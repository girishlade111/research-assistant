"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { parseFile, ParsedFile } from "@/lib/engine/file-parser";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (files: ParsedFile[]) => void;
  isLoading: boolean;
  workflowMode?: "planning" | "research";
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  workflowMode = "research",
}: SearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<ParsedFile[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !isParsing) {
        onSubmit(attachedFiles);
        setAttachedFiles([]);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsParsing(true);

    const newFiles: ParsedFile[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      try {
        const parsed = await parseFile(file);
        newFiles.push(parsed);
      } catch (err) {
        console.error("Error parsing file:", err);
        alert(`Failed to parse ${file.name}`);
      }
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.length) {
      setIsParsing(true);
      const newFiles: ParsedFile[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        try {
          const parsed = await parseFile(file);
          newFiles.push(parsed);
        } catch (err) {
          console.error("Error parsing file:", err);
        }
      }
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      setIsParsing(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image"))
      return <ImageIcon className="h-3 w-3 text-primary" />;
    if (fileType.includes("pdf") || fileType.includes("text"))
      return <FileText className="h-3 w-3 text-secondary" />;
    return <File className="h-3 w-3 text-muted-foreground" />;
  };

  const canSubmit = value.trim() && !isLoading && !isParsing;

  const placeholder =
    workflowMode === "planning"
      ? dragActive
        ? "Drop files here..."
        : "Describe the topic, goals, and constraints..."
      : dragActive
        ? "Drop files here..."
        : "Ask anything or drop files...";

  return (
    <div className="w-full space-y-1.5">
      {/* File Previews */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-1.5 px-1"
          >
            {attachedFiles.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-lg bg-accent/70 border border-border/50 pl-2 pr-1.5 py-1 text-[11px] font-medium text-foreground"
              >
                {getFileIcon(file.fileType)}
                <span className="max-w-[120px] truncate">{file.fileName}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="rounded-full p-px hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative rounded-xl transition-all",
          dragActive && "border-2 border-dashed border-primary/40 bg-primary/[0.03]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-9 py-2.5 pr-11 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-60"
        />

        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.png,.jpg,.jpeg"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isParsing}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-40"
          title="Attach files"
        >
          {isParsing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Paperclip className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Submit Button */}
        <button
          onClick={() => {
            if (canSubmit) {
              onSubmit(attachedFiles);
              setAttachedFiles([]);
            }
          }}
          disabled={!canSubmit}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-all",
            canSubmit
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow"
              : "bg-muted text-muted-foreground/40"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
