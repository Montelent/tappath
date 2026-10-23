"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Minimize2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  links?: { label: string; href: string }[];
};

const SUGGESTIONS = [
  "How do I remove the Google search bar?",
  "Enable Private DNS on Samsung",
  "What is VoLTE?",
  "Show battery percentage",
  "Turn on Always On Display",
];

/** Simple keyword-based replies until a real LLM is wired */
function replyTo(input: string): Message {
  const q = input.toLowerCase();

  if (q.includes("google search") || q.includes("search bar") || q.includes("widget")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "The Google search bar is a home-screen widget. Long-press it and tap Remove. The Google app stays installed.",
      links: [
        {
          label: "Samsung: Remove Google Search Bar",
          href: "/samsung/galaxy/remove-google-search-bar",
        },
      ],
    };
  }

  if (q.includes("private dns") || q.includes("dns")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Private DNS is usually under Settings → Connections → More connection settings → Private DNS. Set it to a provider hostname (e.g. dns.google).",
      links: [
        { label: "Network & Connectivity topic", href: "/topics/network" },
        { label: "Samsung hub", href: "/samsung" },
      ],
    };
  }

  if (q.includes("volte") || q.includes("4g call")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "VoLTE (Voice over LTE) carries calls over 4G instead of 2G/3G. Enable it under mobile network / SIM settings — the exact path depends on your brand.",
      links: [
        { label: "What is VoLTE? (Glossary)", href: "/glossary/volte" },
        { label: "Network topic", href: "/topics/network" },
      ],
    };
  }

  if (q.includes("battery") && (q.includes("percent") || q.includes("%") || q.includes("show"))) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "On Samsung: Settings → Battery and device care → Battery → show battery percentage (or via notification panel quick settings on some One UI versions).",
      links: [
        { label: "Battery & Power topic", href: "/topics/battery" },
        { label: "Samsung hub", href: "/samsung" },
      ],
    };
  }

  if (q.includes("always on") || q.includes("aod")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Always On Display is usually under Settings → Lock screen → Always On Display. Paths vary by One UI / HyperOS version.",
      links: [
        { label: "Display topic", href: "/topics/display" },
        { label: "AOD glossary", href: "/glossary/always-on-display" },
      ],
    };
  }

  if (q.includes("fingerprint") || q.includes("biometric")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Add a fingerprint under Settings → Security / Biometrics → Fingerprints. Follow on-screen enrollment.",
      links: [
        { label: "Security topic", href: "/topics/security" },
        { label: "Biometrics glossary", href: "/glossary/biometrics" },
      ],
    };
  }

  if (q.includes("esim") || q.includes("e-sim")) {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "An eSIM is a digital SIM built into the phone. Plans are activated via QR code or carrier app — no physical SIM needed.",
      links: [{ label: "eSIM glossary", href: "/glossary/esim" }],
    };
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: "I can help with settings paths, glossary terms, and finding guides. Try asking about a specific feature (e.g. “remove Google search bar” or “what is VoLTE”), or browse by brand and topic.",
    links: [
      { label: "Browse brands", href: "/samsung" },
      { label: "Topic hubs", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "All devices", href: "/devices" },
    ],
  };
}

export default function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi — I’m the TapPath copilot. Ask how to change a setting, or what a term means. I’ll point you to the right guide.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const answer = replyTo(trimmed);
      setMessages((m) => [...m, answer]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-xl"
          aria-label="Open AI copilot"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Ask TapPath</span>
          <MessageCircle className="h-4 w-4 sm:hidden" />
        </button>
      )}

      {open && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-2xl",
            "bottom-0 right-0 h-[min(100dvh,560px)] w-full rounded-t-2xl",
            "sm:bottom-5 sm:right-5 sm:h-[520px] sm:w-[380px] sm:rounded-2xl"
          )}
          role="dialog"
          aria-label="TapPath AI copilot"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">TapPath Copilot</div>
                <div className="text-[11px] text-white/80">Settings & guides helper</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition hover:bg-white/15"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  )}
                >
                  <p>{m.text}</p>
                  {m.links && m.links.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-black/10 pt-2 dark:border-white/10">
                      {m.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                          >
                            {l.label}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[var(--muted)] px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted-foreground)] [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted-foreground)] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted-foreground)] [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            {messages.length <= 1 && !typing && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs transition hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-t border-[var(--border)] p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a setting or term…"
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              disabled={typing}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
