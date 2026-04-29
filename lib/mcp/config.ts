import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export interface MCPConfig {
  servers: Record<string, {
    command: string;
    args?: string[];
    env?: Record<string, string>;
  }>;
}

export const defaultMCPConfig: MCPConfig = {
  servers: {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./uploads"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gitlab"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/server-brave-search"],
      "env": { "BRAVE_API_KEY": process.env.BRAVE_API_KEY || "" }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@github/mcp-server"],
      "env": { "GITHUB_TOKEN": process.env.GITHUB_TOKEN || "" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": process.env.DATABASE_URL || "" }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "./data.db"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": process.env.SLACK_BOT_TOKEN || "",
        "SLACK_TEAM_ID": process.env.SLACK_TEAM_ID || ""
      }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "notion-mcp-server"],
      "env": { "NOTION_API_KEY": process.env.NOTION_API_KEY || "" }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@anthropic/server-puppeteer"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"]
    }
  }
};

export type MCPServerName = keyof typeof defaultMCPConfig.servers;

export function getMCPServerConfig(name: MCPServerName) {
  return defaultMCPConfig.servers[name];
}

export function getAllMCPServerNames(): MCPServerName[] {
  return Object.keys(defaultMCPConfig.servers) as MCPServerName[];
}

export function isMCPServerEnabled(name: string): boolean {
  return name in defaultMCPConfig.servers;
}