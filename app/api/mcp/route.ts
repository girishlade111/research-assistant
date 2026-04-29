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
      postgres: "PostgreSQL database",
      sqlite: "SQLite database",
      memory: "Persistent knowledge graph",
      slack: "Slack messaging",
      notion: "Notion workspace",
      puppeteer: "Browser automation",
      playwright: "Browser testing",
      "google-search": "Google search",
      "google-maps": "Google Maps API",
      "google-workspace": "Google Docs/Sheets/Calendar",
      gcloud: "Google Cloud CLI",
      aws: "AWS services",
      "aws-kb-retrieval": "AWS Bedrock KB",
      "aws-iac": "AWS IaC",
      "aws-docs": "AWS documentation",
      azure: "Azure services",
      "azure-ai": "Azure OpenAI",
      "azure-vm": "Azure VMs",
      netlify: "Netlify deployments",
      firebase: "Firebase services",
      supabase: "Supabase database",
      figma: "Figma designs",
      openai: "OpenAI chat models",
      "openai-full": "Full OpenAI API"
    }
  });
}