import { NextRequest, NextResponse } from "next/server";
import { createMCPClient } from "@/lib/mcp";
import { getMCPServerConfig } from "@/lib/mcp/config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server, tool, args: toolArgs } = body;

    if (!server || !tool) {
      return NextResponse.json(
        { error: "Missing server or tool parameter" },
        { status: 400 }
      );
    }

    const config = getMCPServerConfig(server as any);
    if (!config) {
      return NextResponse.json(
        { error: `Server '${server}' not found in config` },
        { status: 404 }
      );
    }

    const client = await createMCPClient(config.command, config.args, config.env);
    
    const result = await client.callTool(tool, toolArgs || {});
    
    await client.disconnect();

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[MCP API Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "MCP operation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    availableServers: {
      filesystem: "File system operations",
      fetch: "Web content fetching",
      brave_search: "Real-time search",
      github: "GitHub repository operations",
      "github-actions": "GitHub Actions CI/CD",
      docker: "Docker containers",
      kubernetes: "Kubernetes clusters",
      gitlab: "GitLab API",
      postgres: "PostgreSQL database",
      sqlite: "SQLite database",
      mongodb: "MongoDB databases",
      memory: "Persistent knowledge graph",
      slack: "Slack messaging",
      notion: "Notion workspace",
      puppeteer: "Browser automation",
      playwright: "Browser testing",
      "google-search": "Google search",
      "google-maps": "Google Maps API",
      "google-workspace": "Google Docs/Sheets/Calendar",
      gcloud: "Google Cloud CLI",
      "browserbase": "Cloud browser automation",
      "cloudflare-browser": "Cloudflare browser",
      sentry: "Error tracking",
      vercel: "Vercel deployments",
      railway: "Railway deployments"
    }
  });
}