import { NextRequest, NextResponse } from "next/server";

type Body = { message: string };

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

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `You are TapPath Copilot for smartphone settings paths. Answer briefly with exact menu paths. Suggest links when useful: /samsung/galaxy/remove-google-search-bar, /samsung/galaxy/battery-percentage, /topics/network, /glossary/volte, /forum, /devices. Respond JSON: { "text": string, "links": [{ "label": string, "href": string }] }`,
            },
            { role: "user", content: message },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        return NextResponse.json(fallback(message));
      }

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json({
          text: parsed.text || raw,
          links: Array.isArray(parsed.links) ? parsed.links : [],
        });
      } catch {
        return NextResponse.json({ text: raw, links: [] });
      }
    } catch {
      return NextResponse.json(fallback(message));
    }
  }

  return NextResponse.json(fallback(message));
}

function fallback(input: string) {
  const q = input.toLowerCase();
  if (q.includes("google search") || q.includes("search bar") || q.includes("widget")) {
    return {
      text: "The Google search bar is a home-screen widget. Long-press it and tap Remove.",
      links: [{ label: "Remove Google Search Bar", href: "/samsung/galaxy/remove-google-search-bar" }],
    };
  }
  if (q.includes("battery") && (q.includes("percent") || q.includes("%") || q.includes("show"))) {
    return {
      text: "Samsung: Settings → Battery and device care → Battery → Show battery percentage.",
      links: [{ label: "Battery percentage guide", href: "/samsung/galaxy/battery-percentage" }],
    };
  }
  if (q.includes("volte")) {
    return {
      text: "VoLTE carries calls over 4G. Enable under mobile network / SIM settings.",
      links: [{ label: "VoLTE glossary", href: "/glossary/volte" }],
    };
  }
  if (q.includes("forum")) {
    return {
      text: "Browse community discussions by brand on the Forum.",
      links: [{ label: "Forum", href: "/forum" }],
    };
  }
  return {
    text: "Ask about a setting or term. Set OPENAI_API_KEY for full AI answers.",
    links: [
      { label: "Topics", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "Forum", href: "/forum" },
    ],
  };
}
