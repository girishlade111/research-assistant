"use client";

import {
  Compass,
  FlaskConical,
  Settings2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector } from "./model-selector";
import { AgentSettingsModal } from "@/components/agents/agent-settings-modal";
import { useState } from "react";
import type { AgentName, WorkflowMode } from "@/lib/engine/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchControlsProps {
  workflowMode: WorkflowMode;
  onWorkflowModeChange: (mode: WorkflowMode) => void;
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
    { value: "chat", label: "Chat", icon: MessageSquare },
    { value: "planning", label: "Plan", icon: Compass },
    { value: "research", label: "Research", icon: FlaskConical },
  ];

export function SearchControls({
  workflowMode,
  onWorkflowModeChange,
  selectedModel,
  onModelChange,
  disabledAgents,
  onToggleAgent,
}: SearchControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeMode = workflowModes.find((m) => m.value === workflowMode) || workflowModes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-1">
      {/* Workflow Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg bg-accent/60 border border-border/40 px-2.5 py-1 text-[11px] font-semibold transition-all outline-none",
              "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/60"
            )}
        >
            <ActiveIcon className="h-3.5 w-3.5" />
            <span>{activeMode.label}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {workflowModes.map((m) => {
            const Icon = m.icon;
            const isActive = workflowMode === m.value;
            return (
              <DropdownMenuItem
                key={m.value}
                onClick={() => onWorkflowModeChange(m.value)}
                className={cn(
                  "gap-2 cursor-pointer",
                  isActive && "bg-accent text-accent-foreground font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

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
        onSetDisabledAgents={onSetDisabledAgents}
      />
    </div>
  );
}
