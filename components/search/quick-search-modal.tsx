"use client";

import { Search, ArrowRight, Clock, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QuickSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchModal({ open, onOpenChange }: QuickSearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading tracking-tight flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Quick Search
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Instantly search your research history, cached responses, and saved documents.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-12 w-full rounded-xl border border-input bg-background px-10 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search across all your research threads..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Searches</h4>
              <div className="space-y-2">
                {[
                  "Machine learning approaches to climate modeling",
                  "Impact of quantum computing on cryptography",
                  "Historical analysis of renewable energy adoption"
                ].map((query, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors group text-left">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{query}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Saved Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Climate_Report_2025.pdf",
                  "Quantum_Crypto_Analysis.md"
                ].map((doc, i) => (
                  <button key={i} className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm truncate font-medium text-foreground">{doc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
