"use client";

import { Compass, FlaskConical, Settings2, Layers, Sparkles, Search, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector } from "./model-selector";
import { AgentSettingsModal } from "@/components/agents/agent-settings-modal";
import { useState } from "react";
import type { AgentName, SearchMode, WorkflowMode } from "@/lib/engine/types";

interface SearchControlsProps {
  workflowMode: WorkflowMode;
  onWorkflowModeChange: (mode: WorkflowMode) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabledAgents: AgentName[];
  onToggleAgent: (agent: AgentName) => void;
}

const workflowModes: {
  value: WorkflowMode;
  label: string;
  icon: typeof Compass;
  desc: string;
}[] = [
    { value: "planning", label: "Planning", icon: Compass, desc: "Structured workflow" },
    { value: "research", label: "Research", icon: FlaskConical, desc: "Multi-agent deep dive" },
  ];

const modes: { value: SearchMode; label: string; icon: typeof Search }[] = [
  { value: "pro", label: "Pro", icon: Sparkles },
  { value: "deep", label: "Deep", icon: Search },
  { value: "corpus", label: "Corpus", icon: BookOpen },
];

export function SearchControls({
  workflowMode,
  onWorkflowModeChange,
  mode,
  onModeChange,
  selectedModel,
  onModelChange,
  disabledAgents,
  onToggleAgent,
}: SearchControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      {/* Workflow Mode Toggle */}
      <div className="flex rounded-xl bg-accent/60 border border-border/40 p-0.5">
        {workflowModes.map((m) => {
          const Icon = m.icon;
          const isActive = workflowMode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onWorkflowModeChange(m.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
              )}
              title={m.desc}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive && "text-primary-foreground")} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Research Depth Toggles */}
      <div
        className={cn(
          "flex rounded-xl bg-accent/60 border border-border/40 p-0.5 transition-opacity duration-200",
          workflowMode === "planning" && "opacity-50 pointer-events-none"
        )}
      >
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onModeChange(m.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-sm shadow-secondary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
              )}
            >
              <Icon className="h-3 w-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Model selector */}
      <ModelSelector selected={selectedModel} onSelect={onModelChange} />

      {/* Settings button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className={cn(
          "flex items-center gap-1.5 rounded-xl bg-accent/60 border border-border/40 px-3 py-1.5 text-xs font-medium transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/60"
        )}
        title="Configure agents"
      >
        <Settings2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Agents</span>
      </button>

      <AgentSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        disabledAgents={disabledAgents}
        onToggleAgent={onToggleAgent}
      />
    </div>
  );
}
