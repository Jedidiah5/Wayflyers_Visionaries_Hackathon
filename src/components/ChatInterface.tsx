"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Send, Terminal } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "What's killing our margins?",
  "Which ad campaign should we kill?",
  "What are our worst sizing offenders?",
  "How healthy is our cash flow?",
];

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSend: (message: string) => void;
}

const NUMBER_PATTERN =
  /£[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?%|[\d,]+(?:\.\d+)?x|-?[\d,]+(?:\.\d+)?/g;

function MessageContent({ content }: { content: string }) {
  const parts = content.split(NUMBER_PATTERN);
  const matches = content.match(NUMBER_PATTERN) ?? [];

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {matches[index] && (
            <span className="font-mono text-acid">{matches[index]}</span>
          )}
        </span>
      ))}
    </span>
  );
}

function TypingIndicator() {
  return (
    <span className="font-mono text-sm text-text-muted">
      <span className="animate-blink">...</span>
    </span>
  );
}

export function ChatInterface({
  messages,
  isLoading = false,
  onSend,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const trimmed = input.value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    input.value = "";
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Message thread */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8"
      >
        <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-1 flex-col justify-center gap-8 py-8">
              <div className="border-b border-border pb-6">
                <h1 className="font-display text-3xl uppercase tracking-tight text-text-primary sm:text-4xl">
                  Operator Chat
                </h1>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
                  Ask about inventory, ads, returns, or revenue
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => onSend(question)}
                    className="border border-border bg-surface px-4 py-3 text-left font-body text-sm text-text-primary transition-colors hover:border-acid hover:text-acid"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%]",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                <div
                  className={cn(
                    "mb-2 font-mono text-[10px] uppercase tracking-widest",
                    message.role === "user" ? "text-acid" : "text-text-muted"
                  )}
                >
                  {message.role === "user" ? "You" : "Fly Intelligence"}
                </div>
                <div
                  className={cn(
                    "inline-block border p-4 text-left font-body text-sm leading-relaxed",
                    message.role === "user"
                      ? "border-acid/40 bg-surface-elevated text-text-primary"
                      : "border-border bg-surface text-text-primary"
                  )}
                >
                  <MessageContent content={message.content} />
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%]">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Fly Intelligence
                </div>
                <div className="inline-block border border-border bg-surface px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-stretch border border-border bg-surface transition-colors focus-within:border-acid"
        >
          <div className="flex shrink-0 items-center pl-4 text-text-muted">
            <Terminal className="h-5 w-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            name="message"
            placeholder="Ask anything about Pretty Fly..."
            disabled={isLoading}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex shrink-0 items-center gap-2 bg-acid px-4 py-3 font-display text-xs uppercase tracking-wide text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[100px] sm:justify-center"
          >
            <Send className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
