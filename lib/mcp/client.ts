import { spawn, ChildProcess } from "child_process";
import { Readable, Writable } from "stream";

export interface MCPClientOptions {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export interface MCPToolResult {
  content: Array<{
    type: string;
    text?: string;
    resource?: string;
  }>;
  isError?: boolean;
}

class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }>();
  private tools: MCPTool[] = [];
  private resources: MCPResource[] = [];

  async connect(options: MCPClientOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(options.command, options.args || [], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, ...options.env },
      });

      if (!this.process.stdin || !this.process.stdout) {
        reject(new Error("Failed to create process streams"));
        return;
      }

      this.process.stderr?.on("data", (data) => {
        console.log("[MCP stderr]:", data.toString());
      });

      this.process.on("error", (error) => {
        console.error("[MCP Error]:", error);
        reject(error);
      });

      this.process.on("close", () => {
        this.process = null;
      });

      setTimeout(() => resolve(), 1000);
    });
  }

  async initialize(): Promise<void> {
    const response = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        resources: {},
      },
      clientInfo: {
        name: "resagent",
        version: "1.0.0",
      },
    });

    await this.sendRequest("initialized", {});

    this.tools = await this.listTools();
    this.resources = await this.listResources();
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await this.sendRequest("tools/list", {});
    return response.tools || [];
  }

  async listResources(): Promise<MCPResource[]> {
    const response = await this.sendRequest("resources/list", {});
    return response.resources || [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    return this.sendRequest("tools/call", {
      name,
      arguments: args,
    });
  }

  async readResource(uri: string): Promise<string> {
    const response = await this.sendRequest("resources/read", { uri });
    return response.contents?.[0]?.text || "";
  }

  async sendRequest<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (!this.process?.stdin) {
      throw new Error("MCP client not connected");
    }

    const id = `${++this.requestId}`;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      this.process!.stdin!.write(JSON.stringify(request) + "\n");

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000);
    });
  }

  handleResponse(response: { id?: string; result?: unknown; error?: unknown }) {
    if (response.id) {
      const pending = this.pendingRequests.get(response.id);
      if (pending) {
        this.pendingRequests.delete(response.id);
        if (response.error) {
          pending.reject(response.error);
        } else {
          pending.resolve(response.result);
        }
      }
    }
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  getResources(): MCPResource[] {
    return this.resources;
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

export async function createMCPClient(
  command: string,
  args?: string[],
  env?: Record<string, string>
): Promise<MCPClient> {
  const client = new MCPClient();
  await client.connect({ command, args, env });
  await client.initialize();
  return client;
}

export { MCPClient };