"use client";

import { ChevronDown, Zap, Brain, Code, Scale } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const modelCategories = [
  {
    label: "Fast",
    icon: Zap,
    models: [
      { id: "flash-1", name: "Nemotron 70B", desc: "NVIDIA — ultra-fast responses" },
      { id: "turbo-2", name: "Gemma 3 27B", desc: "Google — speed optimized" },
    ],
  },
  {
    label: "Reasoning",
    icon: Brain,
    models: [
      { id: "reason-1", name: "DeepSeek-R1", desc: "Deep chain-of-thought reasoning" },
      { id: "think-3", name: "Nemotron Super 49B", desc: "NVIDIA — advanced reasoning" },
    ],
  },
  {
    label: "Coding",
    icon: Code,
    models: [
      { id: "code-1", name: "Qwen 2.5 Coder 32B", desc: "Specialized code generation" },
      { id: "dev-2", name: "DeepSeek-R1 (Code)", desc: "Full-stack assistant" },
    ],
  },
  {
    label: "Balanced",
    icon: Scale,
    models: [
      { id: "balanced-1", name: "Nemotron Super 49B", desc: "NVIDIA — best all-around" },
      { id: "standard-2", name: "GPT-4.1 Nano", desc: "OpenAI — reliable & accurate" },
    ],
  },
];

interface ModelSelectorProps {
  selected: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const selectedModel = modelCategories
    .flatMap((c) => c.models)
    .find((m) => m.id === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="glass flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground">
        {selectedModel?.name ?? "Auto"}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 border-glass-border bg-card/95 backdrop-blur-xl"
      >
        {modelCategories.map((category, i) => (
          <div key={category.label}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <category.icon className="h-3 w-3" />
                {category.label}
              </DropdownMenuLabel>
              {category.models.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onSelect(model.id)}
                  className={
                    selected === model.id ? "bg-accent text-foreground" : ""
                  }
                >
                  <div>
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.desc}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
