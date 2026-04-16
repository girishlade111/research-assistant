"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: SearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`glass-strong relative rounded-2xl transition-shadow duration-300 ${
        isLoading ? "glow-pulse" : "focus-within:glow-sm"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={1}
        disabled={isLoading}
        className="w-full resize-none bg-transparent px-5 py-4 pr-14 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-primary p-2.5 text-primary-foreground transition-all hover:glow-sm disabled:opacity-40"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </motion.div>
  );
}
