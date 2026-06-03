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

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

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
    <main className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-8">
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSend={sendMessage}
      />
    </main>
  );
}
