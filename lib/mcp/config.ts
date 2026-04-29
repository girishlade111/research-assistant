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
    },
    "google-search": {
      "command": "npx",
      "args": ["-y", "@mcp-server/google-search-mcp"]
    },
    "google-maps": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-maps"],
      "env": { "GOOGLE_MAPS_API_KEY": process.env.GOOGLE_MAPS_API_KEY || "" }
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@google-workspace/mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": process.env.GOOGLE_CLIENT_ID || "",
        "GOOGLE_CLIENT_SECRET": process.env.GOOGLE_CLIENT_SECRET || ""
      }
    },
    "gcloud": {
      "command": "npx",
      "args": ["-y", "@google-cloud/gcloud-mcp"]
    },
    "aws": {
      "command": "npx",
      "args": ["-y", "@awslabs/mcp-server"],
      "env": {
        "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID || "",
        "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY || "",
        "AWS_REGION": process.env.AWS_REGION || "us-east-1"
      }
    },
    "aws-kb-retrieval": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-aws-kb-retrieval"],
      "env": {
        "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID || "",
        "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY || "",
        "AWS_REGION": process.env.AWS_REGION || "us-east-1"
      }
    },
    "aws-iac": {
      "command": "uvx",
      "args": ["-y", "awslabs-aws-iac-mcp-server@latest"]
    },
    "aws-docs": {
      "command": "uvx",
      "args": ["-y", "awslabs-aws-docs-mcp-server@latest"]
    },
    "azure": {
      "command": "npx",
      "args": ["-y", "@azure/mcp@latest", "server", "start"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": process.env.AZURE_SUBSCRIPTION_ID || "",
        "AZURE_TENANT_ID": process.env.AZURE_TENANT_ID || "",
        "AZURE_CLIENT_ID": process.env.AZURE_CLIENT_ID || "",
        "AZURE_CLIENT_SECRET": process.env.AZURE_CLIENT_SECRET || ""
      }
    },
    "azure-ai": {
      "command": "npx",
      "args": ["-y", "@azure/ai-mcp"],
      "env": {
        "AZURE_OPENAI_ENDPOINT": process.env.AZURE_OPENAI_ENDPOINT || "",
        "AZURE_OPENAI_API_KEY": process.env.AZURE_OPENAI_API_KEY || ""
      }
    },
    "azure-vm": {
      "command": "npx",
      "args": ["-y", "@azure/mcp@latest", "vm"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": process.env.AZURE_SUBSCRIPTION_ID || ""
      }
    },
    "netlify": {
      "command": "npx",
      "args": ["-y", "@netlify/mcp"],
      "env": {
        "NETLIFY_PERSONAL_ACCESS_TOKEN": process.env.NETLIFY_PERSONAL_ACCESS_TOKEN || ""
      }
    },
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": process.env.GOOGLE_APPLICATION_CREDENTIALS || ""
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_PROJECT_REF": process.env.SUPABASE_PROJECT_REF || "",
        "SUPABASE_ACCESS_TOKEN": process.env.SUPABASE_ACCESS_TOKEN || ""
      }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp"],
      "env": {
        "FIGMA_API_KEY": process.env.FIGMA_API_KEY || ""
      }
    },
    "openai": {
      "command": "npx",
      "args": ["-y", "@mzxrai/mcp-openai@latest"],
      "env": {
        "OPENAI_API_KEY": process.env.OPENAI_API_KEY || ""
      }
    },
    "openai-full": {
      "command": "npx",
      "args": ["-y", "openai-mcp-server"],
      "env": {
        "OPENAI_API_KEY": process.env.OPENAI_API_KEY || ""
      }
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