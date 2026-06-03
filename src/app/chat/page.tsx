"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import type { ChatMessage } from "@/lib/types";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sendingRef = useRef(false);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || sendingRef.current) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    let apiMessages: { role: "user" | "assistant"; content: string }[] = [];

    setMessages((prev) => {
      apiMessages = [...prev, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      return [...prev, userMessage];
    });

    sendingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  useEffect(() => {
    const pending = sessionStorage.getItem("fly-intelligence-pending-message");
    if (pending) {
      sessionStorage.removeItem("fly-intelligence-pending-message");
      sendMessageRef.current(pending);
    }
  }, []);

  return (
    <main className="h-[calc(100dvh-3.5rem)] min-h-0 sm:h-[calc(100dvh-4rem)]">
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSend={sendMessage}
      />
    </main>
  );
}
