import { useState, useCallback } from 'react';
import type { CallParticipant, CallType } from '../context/CallContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallOutcome = 'completed' | 'missed' | 'declined' | 'cancelled' | 'busy';

export interface CallHistoryEntry {
  id: string;
  partner: CallParticipant;
  callType: CallType;
  direction: 'outgoing' | 'incoming';
  outcome: CallOutcome;
  startedAt: string;   // ISO timestamp
  endedAt: string;     // ISO timestamp
  durationSecs: number;
  notes: string;       // briefing notes saved during the call
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = (selfId: string) => `nagarvaani_call_history_${selfId}`;
const MAX_HISTORY  = 200;

const loadHistory = (selfId: string): CallHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(selfId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistory = (selfId: string, entries: CallHistoryEntry[]) => {
  try {
    // Keep newest MAX_HISTORY entries
    localStorage.setItem(STORAGE_KEY(selfId), JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch { /* quota */ }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCallHistory = (selfId: string) => {
  const [history, setHistory] = useState<CallHistoryEntry[]>(() => loadHistory(selfId));

  const addEntry = useCallback((entry: Omit<CallHistoryEntry, 'id'>) => {
    const newEntry: CallHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY);
      saveHistory(selfId, updated);
      return updated;
    });
  }, [selfId]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY(selfId));
  }, [selfId]);

  return { history, addEntry, clearHistory };
};
