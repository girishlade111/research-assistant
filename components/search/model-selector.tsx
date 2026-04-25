"use client";

import { ChevronDown, Zap, Brain, Code, Scale, Check, Cpu, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODEL_REGISTRY } from "@/lib/engine/config";
import { cn } from "@/lib/utils";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "fast":
      return <Zap className="h-3 w-3" />;
    case "reasoning":
      return <Brain className="h-3 w-3" />;
    case "coding":
      return <Code className="h-3 w-3" />;
    case "balanced":
      return <Scale className="h-3 w-3" />;
    default:
      return null;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "fast":
      return "text-primary bg-primary/10 border-primary/20";
    case "reasoning":
      return "text-secondary bg-secondary/10 border-secondary/20";
    case "coding":
      return "text-foreground bg-accent border-border/50";
    case "balanced":
      return "text-primary bg-primary/10 border-primary/20";
    default:
      return "text-muted-foreground bg-accent border-border/50";
  }
};

interface ModelSelectorProps {
  selected: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const allModels = [...MODEL_REGISTRY.nvidia, ...MODEL_REGISTRY.openrouter];
  const selectedModel = allModels.find((m) => m.id === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-xl bg-accent/60 border border-border/40 px-3 py-1.5 text-xs font-medium transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/60"
        )}
      >
        <Cpu className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{selectedModel?.displayName ?? "Auto"}</span>
        <span className="sm:hidden">{selectedModel?.displayName.split(" ")[0] ?? "Auto"}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 border-border bg-card/95 backdrop-blur-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Cpu className="h-3 w-3" />
            NVIDIA Models
          </DropdownMenuLabel>
          {MODEL_REGISTRY.nvidia.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-lg my-0.5",
                selected === model.id && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{model.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-1.5 py-px text-[10px] font-bold uppercase border",
                      getTypeColor(model.type)
                    )}
                  >
                    {getTypeIcon(model.type)}
                    {model.type}
                  </span>
                </div>
              </div>
              {selected === model.id && (
                <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3 w-3" />
            OpenRouter Models
          </DropdownMenuLabel>
          {MODEL_REGISTRY.openrouter.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-lg my-0.5",
                selected === model.id && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{model.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-1.5 py-px text-[10px] font-bold uppercase border",
                      getTypeColor(model.type)
                    )}
                  >
                    {getTypeIcon(model.type)}
                    {model.type}
                  </span>
                </div>
              </div>
              {selected === model.id && (
                <Check className="h-3.5 w-3.5 text-primary ml-2 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
