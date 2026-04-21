"use client";

import { GitBranch, Maximize2, Share2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CitationGraphModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CitationGraphModal({ open, onOpenChange }: CitationGraphModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-heading tracking-tight flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Citation Graph
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Visual relationship between sources across your current research context.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground" title="Export Graph">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground" title="Share Graph">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground" title="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4 rounded-xl border border-border/50 bg-accent/20 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          
          <div className="relative w-full h-full p-8 flex items-center justify-center">
            {/* Dummy Graph Visualization */}
            <div className="relative w-full max-w-lg h-64 mx-auto">
              {/* Central Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-primary/20 animate-pulse">
                <span className="text-xs font-bold text-primary text-center leading-tight">Primary<br/>Research</span>
              </div>
              
              {/* Satellite Nodes */}
              {[
                { top: "10%", left: "20%", label: "Source A", size: "w-16 h-16", delay: "0s" },
                { top: "15%", left: "80%", label: "Source B", size: "w-20 h-20", delay: "1s" },
                { top: "85%", left: "25%", label: "Source C", size: "w-14 h-14", delay: "2s" },
                { top: "75%", left: "75%", label: "Source D", size: "w-16 h-16", delay: "1.5s" },
                { top: "45%", left: "5%", label: "Source E", size: "w-12 h-12", delay: "0.5s" },
              ].map((node, i) => (
                <div key={i} className="absolute" style={{ top: node.top, left: node.left, animationDelay: node.delay }}>
                  <div className={`rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm hover:border-primary/50 transition-colors cursor-pointer ${node.size}`}>
                    <span className="text-[10px] font-medium text-foreground">{node.label}</span>
                  </div>
                  {/* Connecting lines would typically be drawn with an SVG or Canvas here */}
                </div>
              ))}
              
              {/* SVGs connecting them roughly */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-40">
                <line x1="50%" y1="50%" x2="20%" y2="10%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary" />
                <line x1="50%" y1="50%" x2="80%" y2="15%" stroke="currentColor" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="25%" y2="85%" stroke="currentColor" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary" />
                <line x1="50%" y1="50%" x2="5%" y2="45%" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-background/80 backdrop-blur border text-sm text-muted-foreground flex justify-between items-center shadow-sm">
            <span>Showing connections for <strong>&quot;Impact of quantum computing on cryptography&quot;</strong></span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary/60"></div> Primary</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-foreground/20"></div> Direct Citation</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-primary/60 border-dashed bg-transparent"></div> Indirect</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
