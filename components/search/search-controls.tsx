"use client";

import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector } from "./model-selector";

type SearchMode = "pro" | "deep" | "corpus";

interface SearchControlsProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const modes: { value: SearchMode; label: string }[] = [
  { value: "pro", label: "Pro" },
  { value: "deep", label: "Deep" },
  { value: "corpus", label: "Corpus" },
];

export function SearchControls({
  mode,
  onModeChange,
  selectedModel,
  onModelChange,
}: SearchControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      {/* Mode toggles */}
      <div className="glass flex rounded-lg p-0.5">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              mode === m.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Model selector */}
      <ModelSelector selected={selectedModel} onSelect={onModelChange} />

      {/* Filter button */}
      <button className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground">
        <SlidersHorizontal className="h-3 w-3" />
        Filters
      </button>
    </div>
  );
}
