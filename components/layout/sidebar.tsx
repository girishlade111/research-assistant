"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Home,
  Clock,
  Plus,
  X,
  Menu,
  Trash2,
  Search,
  Brain,
  Lightbulb,
  ChevronDown,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "@/hooks/use-cache";

import type { WorkflowMode } from "@/lib/engine/types";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  onNewThread: () => void;
  history: HistoryEntry[];
  onSelectHistory: (query: string, workflowMode: WorkflowMode, mode: "pro" | "deep" | "corpus") => void;
  onClearHistory: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  activeView: "home" | "history";
  onViewChange: (view: "home" | "history") => void;
  activeQuery?: string | null;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const WorkflowIcon = ({ mode, className }: { mode: string; className?: string }) => {
  if (mode === "chat") return <MessageSquare className={className} />;
  if (mode === "planning") return <Lightbulb className={className} />;
  return <Brain className={className} />;
};

const ModeBadge = ({ mode }: { mode: string }) => {
  const colors: Record<string, string> = {
    pro: "bg-primary/10 text-primary border-primary/20",
    deep: "bg-secondary/10 text-secondary border-secondary/20",
    corpus: "bg-accent text-foreground border-border/50",
  };
  return (
    <span className={cn("rounded px-1 py-px text-[10px] font-bold uppercase border", colors[mode] ?? colors.pro)}>
      {mode}
    </span>
  );
};

export function Sidebar({
  open,
  onClose,
  isMobile,
  onNewThread,
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
  activeView,
  onViewChange,
  activeQuery,
}: SidebarProps) {
  const [historyOpen, setHistoryOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  
  useEffect(() => {
    setNow(Date.now());
  }, []);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts: Esc to close sidebar, / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && activeView === "history") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, activeView]);

  const handleSelect = useCallback(
    (entry: HistoryEntry) => {
      onSelectHistory(entry.query, entry.workflowMode, entry.mode);
      if (isMobile) onClose();
    },
    [onSelectHistory, isMobile, onClose]
  );

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirmDelete === id) {
        onDeleteHistoryItem?.(id);
        setConfirmDelete(null);
      } else {
        setConfirmDelete(id);
        setTimeout(() => setConfirmDelete(null), 2000);
      }
    },
    [confirmDelete, onDeleteHistoryItem]
  );

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter((h) => h.query.toLowerCase().includes(q));
  }, [history, historySearch]);

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: HistoryEntry[] }[] = [];
    const today: HistoryEntry[] = [];
    const yesterday: HistoryEntry[] = [];
    const thisWeek: HistoryEntry[] = [];
    const older: HistoryEntry[] = [];

    for (const entry of filteredHistory) {
      const diff = now - entry.timestamp;
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      if (days === 0) today.push(entry);
      else if (days === 1) yesterday.push(entry);
      else if (days < 7) thisWeek.push(entry);
      else older.push(entry);
    }

    if (today.length) groups.push({ label: "Today", items: today });
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
    if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
    if (older.length) groups.push({ label: "Older", items: older });

    return groups;
  }, [filteredHistory, now]);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      active: activeView === "home",
      onClick: () => onViewChange("home"),
    },
    {
      icon: Clock,
      label: "History",
      active: activeView === "history",
      onClick: () => onViewChange("history"),
      badge: history.length || undefined,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col px-3 py-5" ref={sidebarRef}>
      {/* Logo */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 border border-primary/20">
            <img src="/logo.svg" alt="ResAgent Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-lg font-heading font-bold tracking-tight text-foreground">
            ResAgent
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Close sidebar (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New Thread */}
      <button
        onClick={() => {
          onNewThread();
          if (isMobile) onClose();
        }}
        className="mb-5 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/15 hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" />
        New Thread
      </button>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all",
              item.active
                ? "bg-accent border border-border/50 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.badge && (
              <span className="ml-auto rounded-md bg-primary/12 px-1.5 py-0.5 text-xs font-bold text-primary border border-primary/15">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* History Section */}
      <div className="mt-5 flex flex-col flex-1 min-h-0">
        {/* History Header */}
        <div
          className="flex items-center justify-between px-2 py-1 mb-2 group"
        >
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors"
          >
            Recent
            <motion.span
              animate={{ rotate: historyOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.span>
          </button>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="Clear all history"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Search input for history */}
              {history.length > 5 && (
                <div className="relative mb-2 px-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history..."
                    className="w-full rounded-lg bg-accent/50 border border-border/30 pl-7 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* History list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {filteredHistory.length > 0 ? (
                  groupedHistory.map((group) => (
                    <div key={group.label}>
                      <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((entry) => {
                          const isActive = activeQuery?.toLowerCase() === entry.query.toLowerCase();
                          const isConfirming = confirmDelete === entry.id;
                          return (
                            <div
                              key={entry.id}
                              className="relative group"
                              onMouseEnter={() => setHoveredItem(entry.id)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <button
                                onClick={() => handleSelect(entry)}
                                className={cn(
                                  "flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-all",
                                  isActive
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-accent/50"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-full truncate text-xs transition-colors",
                                    isActive ? "text-primary font-medium" : "text-foreground group-hover:text-primary"
                                  )}
                                >
                                  {entry.query}
                                </span>
                                <span className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <WorkflowIcon mode={entry.workflowMode} className="h-3 w-3" />
                                  {entry.workflowMode === "planning" ? "Planning" : entry.workflowMode === "chat" ? "Chat" : "Research"}
                                  <span className="text-border">·</span>
                                  <ModeBadge mode={entry.mode} />
                                  <span className="text-border">·</span>
                                  {formatTimeAgo(entry.timestamp)}
                                </span>
                              </button>

                              {/* Delete button (appears on hover) */}
                              <AnimatePresence>
                                {(hoveredItem === entry.id || isConfirming) && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => handleDelete(entry.id, e)}
                                    className={cn(
                                      "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors",
                                      isConfirming
                                        ? "bg-destructive/15 text-destructive border border-destructive/30"
                                        : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    )}
                                    title={isConfirming ? "Click again to confirm" : "Delete"}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </motion.button>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center">
                    {historySearch ? (
                      <>
                        <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No matching history found</p>
                      </>
                    ) : (
                      <>
                        <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No history yet. Start researching!</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-3 pb-2">
          <Link href="/about-us" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
          <Link href="/privacy-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-glass-border bg-sidebar"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 288, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="hidden shrink-0 border-r border-glass-border bg-sidebar md:block overflow-hidden"
        >
          <div className="w-72 h-full">
            {sidebarContent}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
