"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { AgentName } from "@/lib/engine/types";
import { cn } from "@/lib/utils";
import {
  Network,
  BrainCog,
  Microscope,
  FileDigit,
  ShieldCheck,
  TerminalSquare,
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentConfig {
  id: AgentName;
  name: string;
  description: string;
  exactTiming: string;
  impact: "High" | "Medium" | "Low";
  icon: React.ElementType;
}

const CONFIGURABLE_AGENTS: AgentConfig[] = [
  {
    id: "web-search-agent",
    name: "Web Search & Retrieval",
    description: "Executes targeted deep-web queries to aggregate real-time, contextually relevant data streams.",
    exactTiming: "2.5s - 4.0s",
    impact: "High",
    icon: Network,
  },
  {
    id: "query-intelligence-agent",
    name: "Query Intelligence",
    description: "Performs semantic decomposition of the prompt to infer primary intent and extract latent subtopics.",
    exactTiming: "1.2s - 1.8s",
    impact: "Medium",
    icon: BrainCog,
  },
  {
    id: "analysis-agent",
    name: "Deep Analytical Engine",
    description: "Synthesizes multi-source data arrays, resolving contradictions and isolating core thematic patterns.",
    exactTiming: "5.0s - 8.5s",
    impact: "High",
    icon: Microscope,
  },
  {
    id: "summary-agent",
    name: "Summary & Distillation",
    description: "Compresses voluminous data sets into high-signal, actionable executive summaries.",
    exactTiming: "3.5s - 5.2s",
    impact: "Medium",
    icon: FileDigit,
  },
  {
    id: "fact-check-agent",
    name: "Verification & Fact-Check",
    description: "Cross-references extracted claims against authoritative corpus databases to ensure empirical accuracy.",
    exactTiming: "3.0s - 4.5s",
    impact: "High",
    icon: ShieldCheck,
  },
  {
    id: "coding-agent",
    name: "Technical & Code Generation",
    description: "Formulates algorithmic solutions, syntax snippets, and architectural blueprints on demand.",
    exactTiming: "4.0s - 6.0s",
    impact: "Low",
    icon: TerminalSquare,
  },
  {
    id: "report-agent",
    name: "Report Assembler",
    description: "Orchestrates verified findings into a logically structured, comprehensive markdown artifact.",
    exactTiming: "2.8s - 4.2s",
    impact: "High",
    icon: BookOpenCheck,
  }
];

interface AgentSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabledAgents: AgentName[];
  onToggleAgent: (agent: AgentName) => void;
  onSetDisabledAgents: (agents: AgentName[]) => void;
}

export function AgentSettingsModal({
  open,
  onOpenChange,
  disabledAgents,
  onToggleAgent,
  onSetDisabledAgents,
}: AgentSettingsModalProps) {
  const isAllDisabled = disabledAgents.length === CONFIGURABLE_AGENTS.length;
  const isAllEnabled = disabledAgents.length === 0;

  const handleEnableAll = () => onSetDisabledAgents([]);
  const handleDisableAll = () => onSetDisabledAgents(CONFIGURABLE_AGENTS.map((a) => a.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl bg-background/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Agent Configuration
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Customize your research pipeline. Enabled agents act as a swarm to tackle complex queries. 
            <strong className="text-foreground ml-1">If all agents are disabled, queries resolve instantly using direct chat.</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border-b border-border/40 pb-3 mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {CONFIGURABLE_AGENTS.length - disabledAgents.length} of {CONFIGURABLE_AGENTS.length} Active
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleEnableAll}
              disabled={isAllEnabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isAllEnabled
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enable All
            </button>
            <button
              onClick={handleDisableAll}
              disabled={isAllDisabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isAllDisabled
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-destructive/10 text-destructive hover:bg-destructive/20"
              )}
            >
              <XCircle className="h-3.5 w-3.5" />
              Disable All
            </button>
          </div>
        </div>

        <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
          {CONFIGURABLE_AGENTS.map((agent) => {
            const isEnabled = !disabledAgents.includes(agent.id);
            const Icon = agent.icon;

            return (
              <div
                key={agent.id}
                className={cn(
                  "relative flex items-start justify-between space-x-4 rounded-xl border p-4 transition-all duration-300",
                  isEnabled
                    ? "border-primary/30 bg-primary/[0.03] shadow-sm shadow-primary/5"
                    : "border-border/40 bg-accent/30 opacity-75 grayscale-[0.5]"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "mt-1 p-2 rounded-lg flex-shrink-0 transition-colors",
                    isEnabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-[15px] font-semibold leading-none",
                        isEnabled ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {agent.name}
                      </h4>
                    </div>
                    <p className="text-[13px] text-muted-foreground/90 leading-relaxed pr-6">
                      {agent.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 border border-border/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        <Clock className="h-3 w-3 opacity-70" />
                        {agent.exactTiming}
                      </span>
                      <span className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        agent.impact === "High" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        agent.impact === "Medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {agent.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAgent(agent.id)}
                  className={cn(
                    "relative mt-2 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isEnabled ? "bg-primary" : "bg-muted"
                  )}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span className="sr-only">Toggle {agent.name}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-300 ease-in-out",
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
