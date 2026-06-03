"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent, KeyboardEvent } from "react";
import { Terminal } from "lucide-react";

interface ChatInputBarProps {
  placeholder?: string;
  redirectToChat?: boolean;
  onSubmit?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({
  placeholder = "Ask anything about Pretty Fly...",
  redirectToChat = false,
  onSubmit,
  disabled = false,
}: ChatInputBarProps) {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (redirectToChat) {
      sessionStorage.setItem("fly-intelligence-pending-message", trimmed);
      router.push("/chat");
      return;
    }

    onSubmit?.(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-4xl items-center border border-border bg-surface transition-colors focus-within:border-accent"
      >
        <Terminal className="ml-4 h-5 w-5 shrink-0 text-text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="min-w-[100px] bg-accent px-4 py-3 font-display text-xs uppercase tracking-wide text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
