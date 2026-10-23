import { NextRequest, NextResponse } from "next/server";

type Body = { message: string };

type ProviderId = "openai" | "openrouter" | "agentrouter";

type ProviderConfig = {
  id: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  extraHeaders?: Record<string, string>;
  jsonMode: boolean;
};

const SYSTEM_PROMPT = `You are TapPath Copilot, a helpful assistant for smartphone settings paths (Samsung One UI, Xiaomi HyperOS, etc.).
Answer briefly. Prefer exact menu paths. Suggest relevant site links when useful:
- Guides: /samsung/galaxy/remove-google-search-bar, /samsung/galaxy/battery-percentage
- Topics: /topics/network, /topics/display, /topics/battery, /topics/security
- Glossary: /glossary/volte, /glossary/esim, /glossary/amoled
- Devices: /devices
- Forum: /forum
Respond in JSON only: { "text": string, "links": [{ "label": string, "href": string }] }`;

function resolveProvider(): ProviderConfig | null {
  const preferred = (process.env.COPILOT_PROVIDER || "").toLowerCase() as ProviderId | "";

  const candidates: ProviderConfig[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    candidates.push({
      id: "openrouter",
      baseUrl: (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, ""),
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      extraHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://tappath.com",
        "X-Title": "TapPath Copilot",
      },
      jsonMode: true,
    });
  }

  if (process.env.AGENTROUTER_API_KEY || process.env.AGENTIC_API_KEY) {
    const base =
      process.env.AGENTROUTER_BASE_URL ||
      process.env.AGENTIC_API_BASE_URL ||
      "http://localhost:1975/v1";
    candidates.push({
      id: "agentrouter",
      baseUrl: base.replace(/\/$/, ""),
      apiKey: process.env.AGENTROUTER_API_KEY || process.env.AGENTIC_API_KEY || "",
      model: process.env.AGENTROUTER_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
      jsonMode: process.env.AGENTROUTER_JSON_MODE !== "false",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    candidates.push({
      id: "openai",
      baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      jsonMode: true,
    });
  }

  if (candidates.length === 0) return null;

  if (preferred) {
    const match = candidates.find((c) => c.id === preferred);
    if (match) return match;
  }

  return candidates[0];
}

async function chatComplete(
  provider: ProviderConfig,
  userMessage: string
): Promise<{ text: string; links: { label: string; href: string }[] } | null> {
  const url = `${provider.baseUrl}/chat/completions`;

  const payload: Record<string, unknown> = {
    model: provider.model,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  };

  if (provider.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      ...provider.extraHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[copilot:${provider.id}] ${res.status}`, err.slice(0, 500));
    return null;
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content || "";

  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      text: parsed.text || raw,
      links: Array.isArray(parsed.links) ? parsed.links : [],
    };
  } catch {
    return { text: raw || "No response.", links: [] };
  }
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const provider = resolveProvider();

  if (provider) {
    try {
      const result = await chatComplete(provider, message);
      if (result) {
        return NextResponse.json({
          ...result,
          provider: provider.id,
        });
      }
    } catch (e) {
      console.error(`[copilot:${provider.id}]`, e);
    }
  }

  return NextResponse.json({
    ...fallback(message),
    provider: "fallback",
  });
}

function fallback(input: string) {
  const q = input.toLowerCase();

  if (q.includes("google search") || q.includes("search bar") || q.includes("widget")) {
    return {
      text: "The Google search bar is a home-screen widget. Long-press it and tap Remove. The Google app stays installed.",
      links: [
        {
          label: "Samsung: Remove Google Search Bar",
          href: "/samsung/galaxy/remove-google-search-bar",
        },
      ],
    };
  }
  if (q.includes("battery") && (q.includes("percent") || q.includes("%") || q.includes("show"))) {
    return {
      text: "On Samsung: Settings → Battery and device care → Battery → enable Show battery percentage.",
      links: [
        {
          label: "Show Battery Percentage",
          href: "/samsung/galaxy/battery-percentage",
        },
        { label: "Battery topic", href: "/topics/battery" },
      ],
    };
  }
  if (q.includes("private dns") || q.includes("dns")) {
    return {
      text: "Private DNS is usually under Settings → Connections → More connection settings → Private DNS.",
      links: [{ label: "Network topic", href: "/topics/network" }],
    };
  }
  if (q.includes("volte")) {
    return {
      text: "VoLTE carries calls over 4G. Enable under mobile network / SIM settings — path varies by brand.",
      links: [
        { label: "VoLTE glossary", href: "/glossary/volte" },
        { label: "Network topic", href: "/topics/network" },
      ],
    };
  }
  if (q.includes("always on") || q.includes("aod")) {
    return {
      text: "Always On Display is usually under Settings → Lock screen → Always On Display.",
      links: [
        { label: "Display topic", href: "/topics/display" },
        { label: "AOD glossary", href: "/glossary/always-on-display" },
      ],
    };
  }
  if (q.includes("forum")) {
    return {
      text: "Browse community discussions by brand on the Forum.",
      links: [{ label: "Forum", href: "/forum" }],
    };
  }

  return {
    text: "I can help with settings paths and glossary terms. Try “remove Google search bar”, “battery percentage”, or “what is VoLTE”. Configure OPENROUTER_API_KEY, AGENTROUTER_API_KEY, or OPENAI_API_KEY for full AI answers.",
    links: [
      { label: "Topics", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "Forum", href: "/forum" },
      { label: "Devices", href: "/devices" },
    ],
  };
}
