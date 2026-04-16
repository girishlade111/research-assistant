"use client";

import { FileText, FileDown, FileType } from "lucide-react";
import { motion } from "framer-motion";

interface ExportButtonsProps {
  onExport: (format: "md" | "pdf" | "txt") => void;
}

const formats = [
  { value: "md" as const, label: "Markdown", icon: FileText },
  { value: "pdf" as const, label: "PDF", icon: FileDown },
  { value: "txt" as const, label: "TXT", icon: FileType },
];

export function ExportButtons({ onExport }: ExportButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 flex items-center gap-2"
    >
      <span className="mr-1 text-xs text-muted-foreground">Export:</span>
      {formats.map((f) => (
        <button
          key={f.value}
          onClick={() => onExport(f.value)}
          className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
        >
          <f.icon className="h-3 w-3" />
          {f.label}
        </button>
      ))}
    </motion.div>
  );
}
