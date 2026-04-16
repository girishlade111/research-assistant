"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import type { Source } from "./source-card";

interface SourceModalProps {
  source: Source | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceModal({ source, open, onOpenChange }: SourceModalProps) {
  if (!source) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-glass-border bg-card/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg leading-snug">
            {source.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {source.snippet}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-accent px-2 py-0.5 font-medium">
              {source.domain}
            </span>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:glow-sm"
          >
            Visit Source
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
