"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "What's killing our margins?",
  "Which ad campaign should we kill?",
  "What are our worst sizing offenders?",
  "How healthy is our cash flow?",
];

const NUMBER_RE =
  /£[\d,]+(?:\.\d+)?|\d[\d,]*(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?x/g;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function highlightNumbers(text: string) {
  const parts = text.split(NUMBER_RE);
  const nums = text.match(NUMBER_RE) ?? [];

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {nums[i] ? (
        <span className="font-mono text-[#c8ff00]">{nums[i]}</span>
      ) : null}
    </span>
  ));
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] sm:max-w-[72%] ${isUser ? "text-right" : ""}`}>
        <p
          className={`mb-1.5 font-mono text-[10px] uppercase tracking-widest ${
            isUser ? "text-[#c8ff00]" : "text-[#888888]"
          }`}
        >
          {isUser ? "You" : "Fly Intelligence"}
        </p>
        <div
          className={`inline-block border px-4 py-3 text-left text-sm leading-relaxed ${
            isUser
              ? "border-[#c8ff00]/30 bg-[#1a1a1a] text-[#e2e2e2]"
              : "border-[#2a2a2a] bg-[#111111] text-[#e2e2e2]"
          }`}
        >
          <span className="whitespace-pre-wrap">
            {highlightNumbers(message.content)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#888888]">
          Fly Intelligence
        </p>
        <div className="inline-block border border-[#2a2a2a] bg-[#111111] px-4 py-3">
          <span className="font-mono text-sm text-[#888888]">
            <span className="animate-blink">...</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking, scrollToBottom]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
    };

    const history = [...messagesRef.current, userMsg];
    messagesRef.current = history;
    setMessages(history);

    setInput("");
    busyRef.current = true;
    setThinking(true);

    const apiPayload = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[chat] API error:", data);
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const withReply = [
        ...history,
        { id: uid(), role: "assistant" as const, content: data.content },
      ];
      messagesRef.current = withReply;
      setMessages(withReply);
    } catch (err) {
      console.error("[chat] Send failed:", err);
      const withError = [
        ...history,
        {
          id: uid(),
          role: "assistant" as const,
          content:
            err instanceof Error
              ? err.message
              : "Request failed. Check the terminal for details.",
        },
      ];
      messagesRef.current = withError;
      setMessages(withError);
    } finally {
      busyRef.current = false;
      setThinking(false);
      inputRef.current?.focus();
    }
  }, []);

  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    const pending = sessionStorage.getItem("fly-intelligence-pending-message");
    if (pending) {
      sessionStorage.removeItem("fly-intelligence-pending-message");
      sendRef.current(pending);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const empty = messages.length === 0 && !thinking;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Thread */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {empty && (
            <>
              <header className="border-b border-[#2a2a2a] pb-5">
                <h1 className="font-display text-3xl uppercase tracking-tight text-[#e2e2e2] sm:text-4xl">
                  Operator Chat
                </h1>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#888888]">
                  Ask about inventory, ads, returns, or revenue
                </p>
              </header>

              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-left text-sm text-[#e2e2e2] transition-colors hover:border-[#c8ff00] hover:text-[#c8ff00]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {thinking && <ThinkingBubble />}
        </div>
      </div>

      {/* Input — always visible at bottom */}
      <footer className="shrink-0 border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-3xl items-center gap-0 border border-[#2a2a2a] bg-[#111111] focus-within:border-[#c8ff00]"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Pretty Fly..."
            disabled={thinking}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-body text-sm text-[#e2e2e2] outline-none placeholder:text-[#888888] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="shrink-0 bg-[#c8ff00] px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
