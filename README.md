# OpenClaw Agent Builder

An integrated AI-powered application for creating and managing OpenClaw agents through natural conversation.

## Features

- **Chat-First Agent Creation** — Describe the agent you want and the AI configures it for you
- **Knowledge Injection** — Upload files, paste text, or crawl URLs to inject knowledge into agent workspace files (MEMORY.md, SOUL.md, AGENTS.md, USER.md)
- **Agent Dashboard** — View, search, edit, and manage all your OpenClaw agents
- **Agent Configuration** — Full control over identity, models, fallbacks, thinking level, and workspace files
- **Skills Management** — Browse ClawHub and install skills for your agents
- **Dark/Light Theme** — Automatic and manual theme switching
- **Real-Time Connection** — Connects to your running OpenClaw Gateway via WebSocket

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (persisted to localStorage)
- **Icons**: Lucide React
- **Animations**: Framer Motion, CSS animations
- **Theme**: next-themes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

1. Go to **Settings**
2. Enter your OpenClaw Gateway URL (default: `ws://localhost:18789`)
3. Enter your Gateway token
4. Click **Test Connection**

Once connected, the app will use real data from your OpenClaw server.

## AI Chat Engine

The chat engine supports multiple backends (configured in Settings):

1. **OpenClaw Gateway** (default) — Routes chat through your server's `/v1/chat/completions` endpoint
2. **Direct OpenAI** — Set `OPENAI_API_KEY` environment variable
3. **Direct Anthropic** — Set `ANTHROPIC_API_KEY` environment variable
4. **Local Fallback** — Smart keyword-based responses when no API is available

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Chat interface (main page)
│   ├── agents/page.tsx       # Agent dashboard
│   ├── agents/[id]/page.tsx  # Agent detail/config
│   ├── knowledge/page.tsx    # Knowledge injection
│   ├── skills/page.tsx       # Skills management
│   ├── settings/page.tsx     # Connection & preferences
│   └── api/
│       ├── chat/route.ts     # AI chat engine API
│       └── gateway/          # OpenClaw Gateway proxy routes
│           ├── connect/      # Connection test
│           ├── agents/       # Agent CRUD + files
│           ├── models/       # Model listing
│           ├── config/       # Server config
│           └── skills/       # Skill search & install
├── components/
│   ├── ui/                   # Base UI components (Button, Input, Badge, etc.)
│   ├── layout/               # App shell, Sidebar, TopBar
│   ├── chat/                 # Chat message, Chat input
│   └── agents/               # Agent card
├── lib/
│   ├── openclaw-client.ts    # Browser WebSocket client
│   ├── openclaw-server.ts    # Server-side WebSocket client (Node.js)
│   ├── api-client.ts         # Frontend API client (calls Next.js API routes)
│   └── utils.ts              # Utility functions
└── stores/
    └── app-store.ts          # Zustand global state
```

## OpenClaw Gateway API Methods Used

| Method | Purpose |
|--------|---------|
| `connect` | Authenticate and establish WebSocket session |
| `agents.list` | List all configured agents |
| `agents.create` | Create a new agent |
| `agents.update` | Update agent properties |
| `agents.delete` | Delete an agent |
| `agents.files.get` | Read workspace file content |
| `agents.files.set` | Write to workspace file |
| `agents.files.list` | List workspace files |
| `models.list` | List available AI models |
| `config.get` | Get server configuration |
| `config.set` | Update server configuration |
| `skills.install` | Install a skill from ClawHub |
| `skills.search` | Search available skills |

## License

MIT
