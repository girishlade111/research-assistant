"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain } from "lucide-react";
import type { ThinkingStep, AgentName } from "@/lib/engine/types";

// ── Agent Labels (reuse from agent-status-panel) ──────────────

const AGENT_LABELS: Record<AgentName, { icon: string; label: string }> = {
  "web-search-agent": { icon: "🌐", label: "Web Search" },
  "query-intelligence-agent": { icon: "🧠", label: "Query Intel" },
  "analysis-agent": { icon: "📊", label: "Analysis" },
  "coding-agent": { icon: "💻", label: "Coding" },
  "summary-agent": { icon: "⚡", label: "Summary" },
  "fact-check-agent": { icon: "🔍", label: "Fact Check" },
  "report-agent": { icon: "🧾", label: "Report" },
};

// ── Types ─────────────────────────────────────────────────────

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
}

// ── Single Step ───────────────────────────────────────────────

function ThinkingStepRow({
  step,
  isLatest,
}: {
  step: ThinkingStep;
  isLatest: boolean;
}) {
  const agentInfo = step.agent ? AGENT_LABELS[step.agent] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 py-1.5"
    >
      {/* Dot indicator */}
      <div className="mt-1.5 shrink-0">
        {isLatest ? (
          <div className="thinking-dot-active" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {agentInfo && (
            <span className="inline-flex items-center gap-1 rounded bg-accent/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
              <span className="text-[10px]">{agentInfo.icon}</span>
              {agentInfo.label}
            </span>
          )}
          <span
            className={`text-[12px] leading-relaxed ${
              isLatest ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {step.text}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Panel ─────────────────────────────────────────────────────

export function ThinkingPanel({
  steps,
  isExpanded,
  onToggle,
  isActive,
}: ThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      isNearBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new steps
  useEffect(() => {
    if (isNearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [steps.length]);

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="group flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left transition-all hover:bg-accent/50 bg-accent/30"
      >
        <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          AI Thinking
        </span>

        {/* Step count badge */}
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
          {steps.length}
        </span>

        {/* Active pulse */}
        {isActive && (
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}

        <div className="flex-1" />

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="thinking-log mt-1.5 max-h-[220px] overflow-y-auto rounded-xl bg-accent/20 px-3.5 py-2"
            >
              {steps.map((step, i) => (
                <ThinkingStepRow
                  key={step.id}
                  step={step}
                  isLatest={isActive && i === steps.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
