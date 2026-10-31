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
- Guides under /{brand}/{line}/{slug}
- Topics: /topics/network, /topics/display, /topics/battery, /topics/security
- Glossary: /glossary/volte, /glossary/esim
- Devices: /devices, Forum: /forum
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
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://tappath-eight.vercel.app",
        "X-Title": "TapPath Copilot",
      },
      jsonMode: process.env.OPENROUTER_JSON_MODE === "true",
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
      jsonMode: process.env.AGENTROUTER_JSON_MODE === "true",
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

function parseModelText(raw: string): { text: string; links: { label: string; href: string }[] } {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: String(parsed.text || cleaned),
      links: Array.isArray(parsed.links) ? parsed.links : [],
    };
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        return {
          text: String(parsed.text || cleaned),
          links: Array.isArray(parsed.links) ? parsed.links : [],
        };
      } catch {
        /* fall through */
      }
    }
    return { text: cleaned || "No response.", links: [] };
  }
}

async function callOnce(
  provider: ProviderConfig,
  userMessage: string,
  useJsonMode: boolean
): Promise<
  | { ok: true; result: { text: string; links: { label: string; href: string }[] } }
  | { ok: false; status: number; error: string }
> {
  const url = `${provider.baseUrl}/chat/completions`;
  const payload: Record<string, unknown> = {
    model: provider.model,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  };
  if (useJsonMode) {
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

  const bodyText = await res.text();
  if (!res.ok) {
    console.error(`[copilot:${provider.id}] ${res.status}`, bodyText.slice(0, 400));
    return { ok: false, status: res.status, error: bodyText.slice(0, 300) };
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(bodyText);
  } catch {
    return { ok: false, status: 502, error: "Invalid JSON from provider" };
  }
  const raw = data.choices?.[0]?.message?.content || "";
  return { ok: true, result: parseModelText(raw) };
}

async function chatComplete(
  provider: ProviderConfig,
  userMessage: string
): Promise<
  | { text: string; links: { label: string; href: string }[]; provider: string }
  | { error: string; provider: string; status?: number }
> {
  const attempts = provider.jsonMode ? [true, false] : [false, true];
  let lastErr = "";
  let lastStatus = 0;

  for (const useJson of attempts) {
    try {
      const r = await callOnce(provider, userMessage, useJson);
      if (r.ok) return { ...r.result, provider: provider.id };
      lastErr = r.error;
      lastStatus = r.status;
      if (useJson && (r.status === 400 || r.status === 422)) continue;
      if (r.status === 401 || r.status === 403) break;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "Network error";
    }
  }

  return {
    error: lastErr || "Provider request failed",
    provider: provider.id,
    status: lastStatus || undefined,
  };
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
    const result = await chatComplete(provider, message);
    if ("text" in result) return NextResponse.json(result);
    return NextResponse.json({
      text: `AI provider (${result.provider}) failed: ${result.error.slice(0, 180)}. Check OPENROUTER_API_KEY / model on Vercel.`,
      links: [],
      provider: result.provider,
      error: result.error,
      status: result.status,
    });
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
      text: "The Google search bar is a home-screen widget. Long-press it and tap Remove.",
      links: [{ label: "Samsung: Remove Google Search Bar", href: "/samsung/galaxy/remove-google-search-bar" }],
    };
  }
  if (q.includes("battery") && (q.includes("percent") || q.includes("%") || q.includes("show"))) {
    return {
      text: "On Samsung: Settings → Battery and device care → Battery → Show battery percentage.",
      links: [{ label: "Show Battery Percentage", href: "/samsung/galaxy/battery-percentage" }],
    };
  }
  if (q.includes("fingerprint") || q.includes("biometr")) {
    return {
      text: "Fingerprints are under Settings → Security and privacy → Biometrics.",
      links: [{ label: "Add a Fingerprint", href: "/samsung/galaxy/add-fingerprint" }],
    };
  }
  return {
    text: "AI keys are not configured on the server. Set OPENROUTER_API_KEY (or OPENAI_API_KEY) in Vercel environment variables, then redeploy.",
    links: [
      { label: "Topics", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "Forum", href: "/forum" },
    ],
  };
}
