"use client";

import { useCallback } from "react";
import type { ResearchResult, SearchMode, WorkflowMode } from "@/lib/engine/types";

const CACHE_PREFIX = "resagent_cache_";
const HISTORY_KEY = "resagent_history";
const MAX_CACHE_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY = 50;

interface CacheEntry {
  result: ResearchResult;
  timestamp: number;
  query: string;
  workflowMode: WorkflowMode;
  mode: SearchMode;
}

export interface HistoryEntry {
  id: string;
  query: string;
  workflowMode: WorkflowMode;
  mode: SearchMode;
  timestamp: number;
  model: string;
}

function hashKey(query: string, workflowMode: WorkflowMode, mode: SearchMode, model: string): string {
  const raw = `${query.trim().toLowerCase()}|${workflowMode}|${mode}|${model}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return CACHE_PREFIX + Math.abs(hash).toString(36);
}

export function useResearchCache() {
  const getCached = useCallback(
    (query: string, workflowMode: WorkflowMode, mode: SearchMode, model: string): ResearchResult | null => {
      try {
        const key = hashKey(query, workflowMode, mode, model);
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > MAX_CACHE_AGE_MS) {
          localStorage.removeItem(key);
          return null;
        }
        return entry.result;
      } catch {
        return null;
      }
    },
    []
  );

  const setCached = useCallback(
    (query: string, workflowMode: WorkflowMode, mode: SearchMode, model: string, result: ResearchResult) => {
      try {
        const key = hashKey(query, workflowMode, mode, model);
        const entry: CacheEntry = {
          result,
          timestamp: Date.now(),
          query: query.trim(),
          workflowMode,
          mode,
        };
        localStorage.setItem(key, JSON.stringify(entry));
        addToHistory(query, workflowMode, mode, result.metadata.model);
      } catch {
        // localStorage full — silently fail
      }
    },
    []
  );

  const getHistory = useCallback((): HistoryEntry[] => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      // Also clear all cached results
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // noop
    }
  }, []);

  return { getCached, setCached, getHistory, clearHistory };
}

function addToHistory(query: string, workflowMode: WorkflowMode, mode: SearchMode, model: string) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];

    const entry: HistoryEntry = {
      id: Date.now().toString(36),
      query: query.trim(),
      workflowMode,
      mode,
      timestamp: Date.now(),
      model,
    };

    // Dedup: remove existing entry with same query
    const filtered = history.filter(
      (h) => h.query.toLowerCase() !== entry.query.toLowerCase()
    );
    filtered.unshift(entry);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(filtered.slice(0, MAX_HISTORY))
    );
  } catch {
    // noop
  }
}
