import { NextRequest, NextResponse } from "next/server";
import { listProviders, type ProviderConfig } from "@/lib/copilot/providers";

type Body = { message: string };

const SYSTEM_PROMPT = `You are TapPath Copilot, a helpful assistant for smartphone settings paths (Samsung One UI, Xiaomi HyperOS, etc.).
Answer briefly. Prefer exact menu paths. Suggest relevant site links when useful:
- Guides under /{brand}/{line}/{slug}
- Topics: /topics/network, /topics/display, /topics/battery, /topics/security
- Glossary: /glossary/volte, /glossary/esim
- Devices: /devices, Forum: /forum
Respond in JSON only: { "text": string, "links": [{ "label": string, "href": string }] }`;

function parseModelText(raw: string): { text: string; links: { label: string; href: string }[] } {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      text: String(parsed.text || parsed.message || parsed.content || cleaned),
      links: Array.isArray(parsed.links) ? parsed.links : [],
    };
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        const parsed = JSON.parse(m[0]);
        return {
          text: String(parsed.text || parsed.message || parsed.content || cleaned),
          links: Array.isArray(parsed.links) ? parsed.links : [],
        };
      } catch {
        /* fall through */
      }
    }
    return { text: cleaned || "No response.", links: [] };
  }
}

function extractChoiceContent(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;
  const choices = d.choices;
  if (Array.isArray(choices) && choices[0]) {
    const c0 = choices[0] as Record<string, unknown>;
    const msg = c0.message as Record<string, unknown> | string | undefined;
    if (typeof msg === "string") return msg;
    if (msg && typeof msg === "object") {
      const content = msg.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .map((part) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
              return String((part as { text: unknown }).text || "");
            }
            return "";
          })
          .join("");
      }
    }
    if (typeof c0.text === "string") return c0.text;
    if (typeof c0.content === "string") return c0.content;
  }
  if (typeof d.content === "string") return d.content;
  if (typeof d.text === "string") return d.text;
  if (typeof d.message === "string") return d.message;
  if (d.message && typeof d.message === "object") {
    const m = d.message as Record<string, unknown>;
    if (typeof m.content === "string") return m.content;
  }
  if (d.data && typeof d.data === "object") return extractChoiceContent(d.data);
  return "";
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

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...provider.extraHeaders,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : "Network error reaching provider",
    };
  }

  const bodyText = await res.text();
  if (!res.ok) {
    console.error(`[copilot:${provider.id}] ${res.status}`, bodyText.slice(0, 400));
    let detail = bodyText.slice(0, 300);
    try {
      const errJson = JSON.parse(bodyText) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof errJson.error === "string") detail = errJson.error;
      else if (errJson.error && typeof errJson.error === "object" && errJson.error.message) {
        detail = errJson.error.message;
      } else if (errJson.message) detail = errJson.message;
    } catch {
      /* keep slice */
    }
    return { ok: false, status: res.status, error: detail };
  }

  let data: unknown;
  try {
    data = JSON.parse(bodyText);
  } catch {
    if (bodyText.trim().length > 0 && !bodyText.trim().startsWith("<")) {
      return { ok: true, result: parseModelText(bodyText) };
    }
    return {
      ok: false,
      status: 502,
      error: `Invalid JSON from provider (${bodyText.slice(0, 120)})`,
    };
  }

  const raw = extractChoiceContent(data);
  if (!raw) {
    return {
      ok: false,
      status: 502,
      error: `Empty model content: ${bodyText.slice(0, 200)}`,
    };
  }
  return { ok: true, result: parseModelText(raw) };
}

async function chatComplete(
  provider: ProviderConfig,
  userMessage: string
): Promise<
  | { text: string; links: { label: string; href: string }[]; provider: string }
  | { error: string; provider: string; status?: number }
> {
  const attempts =
    provider.id === "agentrouter"
      ? [false, true]
      : provider.jsonMode
        ? [true, false]
        : [false, true];

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

  const providers = await listProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    const result = await chatComplete(provider, message);
    if ("text" in result) {
      return NextResponse.json(result);
    }
    errors.push(`${result.provider}(${result.status ?? "?"}): ${result.error.slice(0, 140)}`);
  }

  const fb = fallback(message);

  if (providers.length === 0) {
    return NextResponse.json({
      ...fb,
      provider: "fallback",
      hint: "No AI keys found. Add keys under Admin → Copilot.",
    });
  }

  if (errors.length > 0) {
    return NextResponse.json({
      text: fb.text,
      links: fb.links,
      provider: "fallback",
      errors,
      hint: "AI provider failed. Check keys and base URL under Admin → Copilot.",
    });
  }

  return NextResponse.json({
    ...fb,
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
  if (q.includes("private dns") || q.includes("dns")) {
    return {
      text: "Private DNS is usually under Settings → Connections → More connection settings → Private DNS.",
      links: [{ label: "Network topic", href: "/topics/network" }],
    };
  }
  if (q.includes("volte") || q.includes("4g call")) {
    return {
      text: "VoLTE carries calls over 4G. Enable it under mobile network / SIM settings for your brand.",
      links: [{ label: "VoLTE glossary", href: "/glossary/volte" }],
    };
  }
  if (/^(hi|hello|hey|hola|hallo)\b/i.test(input.trim()) || input.trim().length < 3) {
    return {
      text: "Hi! Ask me how to change a setting (e.g. “remove Google search bar on Samsung”) or what a term means (e.g. “what is VoLTE”). I’ll point you to the right guide.",
      links: [
        { label: "Browse brands", href: "/samsung" },
        { label: "Topics", href: "/topics" },
        { label: "Glossary", href: "/glossary" },
      ],
    };
  }

  return {
    text: "I can help with settings paths and glossary terms. Try a specific question like “enable Private DNS on Samsung” or “what is eSIM”.",
    links: [
      { label: "Topics", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "Forum", href: "/forum" },
    ],
  };
}
