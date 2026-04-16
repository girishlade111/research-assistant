"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export interface Source {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

interface SourceCardProps {
  source: Source;
  index: number;
  onClick: () => void;
}

export function SourceCard({ source, index, onClick }: SourceCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="glass group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all hover:bg-accent/60"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
          {source.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {source.snippet}
        </p>
      </div>
      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.button>
  );
}
