import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are an AI Agent Builder assistant for OpenClaw. Your role is to help users create and configure AI agents through conversation.

When a user wants to create an agent, you should:
1. Understand their requirements (name, purpose, skills needed)
2. Suggest an appropriate AI model (anthropic/claude-sonnet-4-20250514, openai/gpt-5.5, google/gemini-2.5-pro, etc.)
3. Configure the agent with appropriate settings

When responding with an agent configuration, include a JSON block in your response wrapped in \`\`\`agent-config markers:

\`\`\`agent-config
{
  "name": "Agent Name",
  "emoji": "🤖",
  "model": {
    "primary": "provider/model-name",
    "fallbacks": ["fallback/model"]
  },
  "skills": ["skill-name"],
  "thinking": "medium",
  "soul": "Description of the agent's persona and behavior",
  "instructions": "Specific instructions for the agent"
}
\`\`\`

Available models (suggest based on user needs):
- anthropic/claude-opus-4-20250514 (most capable, expensive, 200K context, reasoning)
- anthropic/claude-sonnet-4-20250514 (balanced, 200K context, reasoning)
- openai/gpt-5.5 (versatile, 128K context)
- openai/gpt-4.1 (fast, good for simple tasks)
- google/gemini-2.5-pro (1M context, reasoning, good for long documents)
- mistral/mistral-large-latest (efficient, multilingual)

Available skills: web-search, github, memory, email, calendar, database

Guidelines:
- Be conversational and helpful, especially in Vietnamese
- Ask clarifying questions if the request is vague
- Suggest appropriate models based on the task complexity
- Always include fallback models for reliability
- For knowledge-heavy agents, suggest "memory" skill
- For agents that need internet access, suggest "web-search" skill
- Set thinking level based on task: simple=low, moderate=medium, complex=high`;

type ChatMessageInput = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { messages, gatewayUrl, gatewayToken, provider } = (await request.json()) as {
      messages: ChatMessageInput[];
      gatewayUrl?: string;
      gatewayToken?: string;
      provider?: "gateway" | "openai" | "anthropic";
    };

    if (!messages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const fullMessages: ChatMessageInput[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Try OpenClaw gateway first (uses the user's running server)
    if (provider !== "openai" && provider !== "anthropic" && gatewayUrl && gatewayToken) {
      try {
        const httpUrl = gatewayUrl
          .replace("ws://", "http://")
          .replace("wss://", "https://");

        const res = await fetch(`${httpUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${gatewayToken}`,
          },
          body: JSON.stringify({
            messages: fullMessages,
            stream: false,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content ?? "";
          const agentConfig = extractAgentConfig(content);
          return Response.json({ content, agentConfig });
        }
      } catch {
        // Fall through to direct API
      }
    }

    // Fallback: Use OpenAI API directly if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: fullMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? "";
        const agentConfig = extractAgentConfig(content);
        return Response.json({ content, agentConfig });
      }
    }

    // Fallback: Use Anthropic API directly if API key is available
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content?.[0]?.text ?? "";
        const agentConfig = extractAgentConfig(content);
        return Response.json({ content, agentConfig });
      }
    }

    // Last fallback: smart local response
    const lastMessage = messages[messages.length - 1].content;
    const localResponse = generateLocalResponse(lastMessage);
    return Response.json(localResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat error";
    return Response.json({ error: message }, { status: 500 });
  }
}

function extractAgentConfig(content: string): Record<string, unknown> | null {
  const match = content.match(/```agent-config\n([\s\S]*?)\n```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

function generateLocalResponse(userMessage: string): { content: string; agentConfig: Record<string, unknown> | null } {
  const lower = userMessage.toLowerCase();

  if (lower.includes("create") || lower.includes("tạo") || lower.includes("build") || lower.includes("make")) {
    const name = extractName(userMessage);
    const model = lower.includes("claude")
      ? "anthropic/claude-sonnet-4-20250514"
      : lower.includes("gpt")
        ? "openai/gpt-5.5"
        : lower.includes("gemini")
          ? "google/gemini-2.5-pro"
          : "anthropic/claude-sonnet-4-20250514";

    const skills: string[] = [];
    if (lower.includes("web") || lower.includes("search") || lower.includes("internet")) skills.push("web-search");
    if (lower.includes("github") || lower.includes("code") || lower.includes("git")) skills.push("github");
    if (lower.includes("memory") || lower.includes("remember") || lower.includes("knowledge")) skills.push("memory");

    const thinking = lower.includes("high") || lower.includes("complex") ? "high" : lower.includes("simple") || lower.includes("fast") ? "low" : "medium";

    const config = {
      name,
      emoji: "🤖",
      model: {
        primary: model,
        fallbacks: model.includes("anthropic") ? ["openai/gpt-5.5"] : ["anthropic/claude-sonnet-4-20250514"],
      },
      skills,
      thinking,
      soul: `You are ${name}, an AI assistant specialized in the tasks described by the user.`,
      instructions: `Follow user instructions carefully. Be helpful, accurate, and professional.`,
    };

    return {
      content: `I've configured your agent based on your description:\n\n**${name}**\n- Model: ${model}\n- Fallback: ${config.model.fallbacks[0]}\n- Skills: ${skills.length > 0 ? skills.join(", ") : "none"}\n- Thinking: ${thinking}\n\nWould you like to create this agent or make any changes?`,
      agentConfig: config,
    };
  }

  if (lower.includes("knowledge") || lower.includes("inject") || lower.includes("nạp") || lower.includes("upload")) {
    return {
      content: "I can help you inject knowledge into an agent! You have several options:\n\n1. **Upload files** - PDF, DOCX, TXT, MD, CSV, JSON\n2. **Paste text** - directly paste content\n3. **Crawl URL** - extract content from a webpage\n\nThe knowledge will be saved to the agent's workspace files (MEMORY.md, SOUL.md, etc.)\n\nWhich agent would you like to add knowledge to?",
      agentConfig: null,
    };
  }

  return {
    content: "I can help you with:\n\n- **Create agents** - describe what you need and I'll configure it\n- **Inject knowledge** - upload files, paste text, or crawl URLs\n- **Manage models** - choose AI providers and configure fallbacks\n- **Install skills** - add capabilities from ClawHub\n\nWhat would you like to do?",
    agentConfig: null,
  };
}

function extractName(content: string): string {
  const patterns = [
    /(?:named?|tên|called)\s+["']?([a-zA-Z\s-]+?)["']?(?:\s*,|\s+with|\s+using|\s+dùng|$)/i,
    /(?:create|tạo|build|make)\s+(?:a\s+|an\s+)?([a-zA-Z\s-]+?)(?:\s+agent|\s+with|\s+using|\s+dùng|,|\.|$)/i,
  ];
  for (const p of patterns) {
    const match = content.match(p);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 2 && name.length < 50) return name;
    }
  }
  return "My Agent";
}
