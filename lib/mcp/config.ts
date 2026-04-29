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
    "mongodb": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server@latest", "--readOnly"],
      "env": {
        "MDB_MCP_CONNECTION_STRING": process.env.MDB_MCP_CONNECTION_STRING || "mongodb://localhost:27017/myDatabase"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "docker": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-docker"]
    },
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "kubernetes-mcp-server"],
      "env": {
        "KUBECONFIG": process.env.KUBECONFIG || ""
      }
    },
    "github-actions": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github-actions"],
      "env": {
        "GITHUB_TOKEN": process.env.GITHUB_TOKEN || ""
      }
    },
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gitlab"],
      "env": {
        "GITLAB_TOKEN": process.env.GITLAB_TOKEN || "",
        "GITLAB_URL": process.env.GITLAB_URL || "https://gitlab.com"
      }
    },
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentryio/sentry-mcp"],
      "env": {
        "SENTRY_AUTH_TOKEN": process.env.SENTRY_AUTH_TOKEN || "",
        "SENTRY_ORG": process.env.SENTRY_ORG || ""
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp"],
      "env": {
        "VERCEL_API_TOKEN": process.env.VERCEL_API_TOKEN || "",
        "VERCEL_PROJECT_ID": process.env.VERCEL_PROJECT_ID || ""
      }
    },
    "railway": {
      "command": "npx",
      "args": ["-y", "railway-mcp"],
      "env": {
        "RAILWAY_API_TOKEN": process.env.RAILWAY_API_TOKEN || ""
      }
    },
    "tunnel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-tunnel"],
      "env": {
        "TUNNEL_API_TOKEN": process.env.TUNNEL_API_TOKEN || ""
      }
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
      "args": ["-y", "@playwright/mcp"]
    },
    "browserbase": {
      "command": "npx",
      "args": ["-y", "@browserbase/mcp-server"],
      "env": {
        "BROWSERBASE_API_KEY": process.env.BROWSERBASE_API_KEY || "",
        "BROWSERBASE_PROJECT_ID": process.env.BROWSERBASE_PROJECT_ID || ""
      }
    },
    "cloudflare-browser": {
      "command": "npx",
      "args": ["-y", "@cloudflare/mcp-browser"],
      "env": {
        "CF_API_TOKEN": process.env.CF_API_TOKEN || ""
      }
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
    },
    "ollama": {
      "command": "npx",
      "args": ["-y", "ollama-mcp"],
      "env": {
        "OLLAMA_HOST": process.env.OLLAMA_HOST || "http://localhost:11434"
      }
    },
    "claude-api": {
      "command": "npx",
      "args": ["-y", "claude-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": process.env.ANTHROPIC_API_KEY || ""
      }
    },
    "lmstudio": {
      "command": "npx",
      "args": ["-y", "lmstudio-mcp"],
      "env": {
        "LMSTUDIO_HOST": process.env.LMSTUDIO_HOST || "http://localhost:1234"
      }
    },
    "groq": {
      "command": "npx",
      "args": ["-y", "groq-mcp"],
      "env": {
        "GROQ_API_KEY": process.env.GROQ_API_KEY || ""
      }
    },
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@llmindset/hf-mcp-server"],
      "env": {
        "HF_TOKEN": process.env.HF_TOKEN || ""
      }
    },
    "replicate": {
      "command": "npx",
      "args": ["-y", "replicate-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": process.env.REPLICATE_API_TOKEN || ""
      }
    },
    "cloudflare-ai": {
      "command": "npx",
      "args": ["-y", "@cloudflare/ai-mcp"],
      "env": {
        "CF_API_TOKEN": process.env.CF_API_TOKEN || "",
        "CF_ACCOUNT_ID": process.env.CF_ACCOUNT_ID || ""
      }
    },
    "arxiv": {
      "command": "npx",
      "args": ["-y", "arxiv-mcp"],
      "env": {
        "ARXIV_CACHE_DIR": process.env.ARXIV_CACHE_DIR || "./papers"
      }
    },
    "semantic-scholar": {
      "command": "npx",
      "args": ["-y", "semantic-scholar-mcp"],
      "env": {
        "SEMANTIC_API_KEY": process.env.SEMANTIC_API_KEY || ""
      }
    },
    "academic-search": {
      "command": "npx",
      "args": ["-y", "academic-research-mcp"],
      "env": {
        "OPENALEX_API_KEY": process.env.OPENALEX_API_KEY || ""
      }
    },
    "pubmed": {
      "command": "npx",
      "args": ["-y", "pubmed-mcp"],
      "env": {
        "PUBMED_API_KEY": process.env.PUBMED_API_KEY || ""
      }
    },
    "exasearch": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": process.env.SEARXNG_URL || ""
      }
    },
    "appwrite": {
      "command": "uvx",
      "args": ["-y", "mcp-server-appwrite"],
      "env": {
        "APPWRITE_ENDPOINT": process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
        "APPWRITE_PROJECT_ID": process.env.APPWRITE_PROJECT_ID || "",
        "APPWRITE_API_KEY": process.env.APPWRITE_API_KEY || ""
      }
    },
    "appwrite-docs": {
      "command": "uvx",
      "args": ["-y", "mcp-server-appwrite"],
      "env": {
        "APPWRITE_ENDPOINT": "https://appwrite.io/docs"
      }
    },
    "google-sheets": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gspread"],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_JSON": process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "",
        "GOOGLE_SHEETS_ID": process.env.GOOGLE_SHEETS_ID || ""
      }
    },
    "excel": {
      "command": "uvx",
      "args": ["-y", "excel-mcp"],
      "env": {
        "EXCEL_FILES_PATH": "./excel_files"
      }
    },
    "anthropic-sdk": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/sdk"]
    },
    "mcp-everything": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
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