# MCP Tools

This document catalogs useful Model Context Protocol (MCP) servers that can extend ResAgent's capabilities. MCP servers provide standardized tool access for AI agents.

---

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. MCP servers act as bridges between AI models and external systems.

---

## Popular MCP Servers

### 📂 Development & Code

| Server | Description | Install |
|-------|------------|--------|
| **GitHub** | Repository management, issues, PRs, code search | `npx @github/mcp-server` |
| **Git** | Local git repository operations | `npx @modelcontextprotocol/server-git` |
| **Filesystem** | File read/write operations | `npx @modelcontextprotocol/server-filesystem` |
| **Memory** | Persistent knowledge graph | `npx @modelcontextprotocol/server-memory` |

### 🌐 Web & Search

| Server | Description | Install |
|-------|------------|--------|
| **Fetch** | Web content fetching | `npx @modelcontextprotocol/server-fetch` |
| **Brave Search** | Real-time web search | `npx @anthropic/server-brave-search` |
| **Puppeteer** | Browser automation | `npx @anthropic/server-puppeteer` |
| **Playwright** | Browser testing & automation | `@playwright/mcp-server` |

### 💻 Database

| Server | Description | Install |
|-------|------------|--------|
| **PostgreSQL** | SQL database queries | `npx @modelcontextprotocol/server-postgres` |
| **MySQL** | MySQL database access | `npx @modelcontextprotocol/server-mysql` |
| **SQLite** | Local SQLite databases | `npx @modelcontextprotocol/server-sqlite` |
| **MongoDB** | NoSQL database access | `npx @modelcontextprotocol/server-mongodb` |
| **Redis** | In-memory data store | `@redis/mcp-server` |

### 💬 Communication

| Server | Description | Install |
|-------|------------|--------|
| **Slack** | Channel messaging | `npx @modelcontextprotocol/server-slack` |
| **Discord** | Discord bot interactions | `@synth/docs-mcp-server` |
| **Gmail** | Email management | `@gongrz/talk-at-mcp` |

### 📋 Productivity

| Server | Description | Install |
|-------|------------|--------|
| **Notion** | Notion workspace integration | `npx notion-mcp-server` |
| **Linear** | Issue tracking | `@anthropic-ai/linear-mcp` |
| **Google Drive** | Google Docs/Sheets | `@modelcontextprotocol/server-gdrive` |
| **Everart** | File management | `@everart/mcp-server` |

### ☁️ Cloud & DevOps

| Server | Description | Install |
|-------|------------|--------|
| **AWS KB Retrieval** | AWS knowledge bases | `@aws/mcp-kb-retrieval` |
| **Azure** | Azure cloud services | Microsoft Azure MCP |
| **Docker** | Container management | `@miceap/mcp-server-docker` |
| **Sentry** | Error tracking | `@sentryio/sentry-mcp` |

### 🧠 AI & ML

| Server | Description | Install |
|-------|------------|--------|
| **Ollama** | Local LLM inference | `@minimax/mcp-ollama` |
| **OpenAI** | GPT models access | Custom server |

---

## Installation & Configuration

### For Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@github/mcp-server"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/allowedDirectory"]
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

### Environment Variables

Many MCP servers require API keys:

```env
# GitHub
GITHUB_TOKEN=ghp_...

# Notion
NOTION_API_KEY=secret_...

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_TEAM_ID=T...

# Brave Search
BRAVE_API_KEY=...
```

---

## MCP in ResAgent Context

ResAgent uses NVIDIA NIM and OpenRouter for AI inference. MCP servers can enhance the research pipeline by:

1. **Data Retrieval** - Connect to databases for research data
2. **Content Fetching** - Fetch web content via Fetch/Brave servers
3. **File Access** - Read local files via Filesystem server
4. **Communication** - Send results to Slack/Email
5. **Browser** - Automate web research via Puppeteer

---

## Useful Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Servers Directory](https://findmcp.dev)
- [MCP Atlas](https://mcpatlas.dev)
- [MyMCPTools](https://mymcptools.com)