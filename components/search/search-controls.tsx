"use client";

import {
  Compass,
  FlaskConical,
  Settings2,
  Sparkles,
  Search,
  BookOpen,
} from "lucide-react";
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
}[] = [
    { value: "planning", label: "Plan", icon: Compass },
    { value: "research", label: "Research", icon: FlaskConical },
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
    <div className="flex flex-wrap items-center gap-1.5 px-1">
      {/* Workflow Mode Toggle */}
      <div className="flex rounded-lg bg-accent/60 border border-border/40 p-px">
        {workflowModes.map((m) => {
          const Icon = m.icon;
          const isActive = workflowMode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onWorkflowModeChange(m.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Research Depth Toggles */}
      <div
        className={cn(
          "flex rounded-lg bg-accent/60 border border-border/40 p-px transition-opacity",
          workflowMode === "planning" && "opacity-40 pointer-events-none"
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
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/80"
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{m.label}</span>
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
          "inline-flex items-center gap-1 rounded-lg bg-accent/60 border border-border/40 px-2 py-1 text-[11px] font-medium transition-all",
          "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/60"
        )}
        title="Configure agents"
      >
        <Settings2 className="h-3 w-3" />
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
