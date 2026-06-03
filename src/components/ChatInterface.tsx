"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChatInputBar } from "./ChatInputBar";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSend: (message: string) => void;
}

export function ChatInterface({
  messages,
  isLoading = false,
  onSend,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto pb-40 pt-8">
        {messages.length === 0 && (
          <div className="border-b border-border pb-6">
            <h1 className="font-display text-4xl uppercase tracking-tight text-text-primary">
              Operator Chat
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
              Ask about inventory, ads, returns, or revenue
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-3xl",
              message.role === "user" ? "ml-auto text-right" : ""
            )}
          >
            <div
              className={cn(
                "mb-2 font-mono text-[10px] uppercase tracking-widest",
                message.role === "user" ? "text-accent" : "text-text-muted"
              )}
            >
              {message.role === "user" ? "You" : "Fly Intelligence"}
            </div>
            <div
              className={cn(
                "inline-block border p-4 text-left font-body text-sm leading-relaxed",
                message.role === "user"
                  ? "border-accent bg-surface-elevated text-text-primary"
                  : "border-border bg-surface text-text-primary"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="max-w-3xl">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Fly Intelligence
            </div>
            <div className="inline-block border border-border bg-surface p-4">
              <span className="font-mono text-sm text-text-muted">
                Processing...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInputBar onSubmit={onSend} disabled={isLoading} />
    </div>
  );
}
