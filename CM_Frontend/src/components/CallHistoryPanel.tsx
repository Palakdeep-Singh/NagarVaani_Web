import React, { useState } from 'react';
import {
  Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Clock, Calendar, FileText, X, ChevronDown, ChevronUp,
  Trash2, PhoneOff, RotateCcw, Download
} from 'lucide-react';
import type { CallHistoryEntry, CallOutcome } from '../hooks/useCallHistory';
import type { CallType } from '../context/CallContext';
import { useCall } from '../context/CallContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDuration = (secs: number): string => {
  if (secs === 0) return '—';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

const formatDateTime = (iso: string): { date: string; time: string } => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return formatDateTime(iso).date;
};

// ─── Outcome config ──────────────────────────────────────────────────────────

const outcomeConfig: Record<CallOutcome, { label: string; color: string; badgeBg: string }> = {
  completed:  { label: 'Completed',  color: 'text-emerald-600', badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  missed:     { label: 'Missed',     color: 'text-rose-500',    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700' },
  declined:   { label: 'Declined',   color: 'text-orange-500',  badgeBg: 'bg-orange-50 border-orange-200 text-orange-700' },
  cancelled:  { label: 'Cancelled',  color: 'text-slate-400',   badgeBg: 'bg-slate-50 border-slate-200 text-slate-500' },
  busy:       { label: 'Line Busy',  color: 'text-amber-500',   badgeBg: 'bg-amber-50 border-amber-200 text-amber-700' },
};

const DirectionIcon: React.FC<{ direction: 'incoming' | 'outgoing'; outcome: CallOutcome; callType: CallType }> = ({
  direction, outcome, callType
}) => {
  const isMissed = outcome === 'missed' || outcome === 'declined';
  const cls = `h-3.5 w-3.5 ${isMissed ? 'text-rose-500' : direction === 'incoming' ? 'text-emerald-500' : 'text-indigo-500'}`;
  if (isMissed && direction === 'incoming') return <PhoneMissed className={cls} />;
  if (direction === 'incoming') return <PhoneIncoming className={cls} />;
  if (callType === 'video')    return <PhoneOutgoing className={cls} />;
  return <PhoneOutgoing className={cls} />;
};

// ─── Detail Popup ─────────────────────────────────────────────────────────────

const HistoryDetailPopup: React.FC<{
  entry: CallHistoryEntry;
  onClose: () => void;
}> = ({ entry, onClose }) => {
  const { startCall, callState } = useCall();
  const { date, time } = formatDateTime(entry.startedAt);
  const cfg = outcomeConfig[entry.outcome];

  const callBack = (type: CallType) => {
    onClose();
    startCall(entry.partner, type);
  };

  const downloadNotes = () => {
    if (!entry.notes.trim()) return;
    const blob = new Blob([
      `NAGARVAANI CALL BRIEFING NOTES\n`,
      `===============================\n`,
      `Date:      ${date} at ${time}\n`,
      `Partner:   ${entry.partner.name} (${entry.partner.id})\n`,
      `Direction: ${entry.direction === 'incoming' ? 'Incoming' : 'Outgoing'}\n`,
      `Type:      ${entry.callType === 'video' ? 'Video Call' : 'Audio Call'}\n`,
      `Duration:  ${formatDuration(entry.durationSecs)}\n`,
      `Status:    ${cfg.label}\n`,
      `===============================\n\n`,
      `Briefing Notes:\n`,
      `---------------\n`,
      entry.notes,
    ], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `call-notes-${entry.partner.id.replace(/\s+/g, '-')}-${date.replace(/\s/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[1050] bg-slate-950/75 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
              entry.callType === 'video'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              {entry.callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Call Details
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">{date} · {time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Partner info + outcome */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 text-base font-extrabold flex items-center justify-center">
                {entry.partner.name.split(' ').map(w => w[0]).filter(Boolean).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">{entry.partner.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{entry.partner.id}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${cfg.badgeBg}`}>
              {cfg.label}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <DirectionIcon direction={entry.direction} outcome={entry.outcome} callType={entry.callType} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Direction</p>
              <p className="text-xs font-extrabold text-slate-700 mt-0.5 capitalize">{entry.direction}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <Clock className="h-3.5 w-3.5 text-slate-400 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Duration</p>
              <p className="text-xs font-extrabold text-slate-700 mt-0.5">{formatDuration(entry.durationSecs)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <Calendar className="h-3.5 w-3.5 text-slate-400 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Date</p>
              <p className="text-xs font-extrabold text-slate-700 mt-0.5">{date}</p>
            </div>
          </div>

          {/* Briefing notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Briefing Notes
              </h4>
              {entry.notes.trim() && (
                <button
                  onClick={downloadNotes}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Download className="h-3 w-3" /> Export
                </button>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 min-h-[80px] max-h-[140px] overflow-y-auto">
              {entry.notes.trim() ? (
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
              ) : (
                <p className="text-xs text-slate-400 italic">No briefing notes were recorded during this call.</p>
              )}
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled={callState !== 'idle'}
              onClick={() => callBack('audio')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 text-indigo-600" /> Audio Call
            </button>
            <button
              disabled={callState !== 'idle'}
              onClick={() => callBack('video')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
            >
              <Video className="h-3.5 w-3.5" /> Video Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Row ─────────────────────────────────────────────────────────────────────

const HistoryRow: React.FC<{
  entry: CallHistoryEntry;
  onClick: () => void;
}> = ({ entry, onClick }) => {
  const cfg = outcomeConfig[entry.outcome];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer border border-transparent hover:border-slate-200"
    >
      {/* Direction icon */}
      <div className="shrink-0 h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
        <DirectionIcon direction={entry.direction} outcome={entry.outcome} callType={entry.callType} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 truncate">{entry.partner.name}</span>
          {entry.callType === 'video'
            ? <Video className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            : <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
          {entry.durationSecs > 0 && (
            <span className="text-[10px] text-slate-400">· {formatDuration(entry.durationSecs)}</span>
          )}
          {entry.notes.trim() && (
            <FileText className="h-2.5 w-2.5 text-indigo-400" title="Has briefing notes" />
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="text-[10px] text-slate-400 font-medium shrink-0">{timeAgo(entry.endedAt)}</span>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const COLLAPSED_COUNT = 5;

export const CallHistoryPanel: React.FC = () => {
  const { callHistory, clearCallHistory } = useCall();
  const [expanded,       setExpanded]       = useState(false);
  const [selectedEntry,  setSelectedEntry]  = useState<CallHistoryEntry | null>(null);
  const [confirmClear,   setConfirmClear]   = useState(false);

  if (callHistory.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Call History</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <PhoneOff className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No calls yet</p>
          <p className="text-[11px] text-slate-400 mt-1">Your call history will appear here after the first call.</p>
        </div>
      </div>
    );
  }

  const displayedEntries = expanded ? callHistory : callHistory.slice(0, COLLAPSED_COUNT);
  const hasMore          = callHistory.length > COLLAPSED_COUNT;

  return (
    <>
      {selectedEntry && (
        <HistoryDetailPopup
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Call History</h3>
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {callHistory.length}
            </span>
          </div>
          {/* Clear history */}
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Clear all?</span>
              <button
                onClick={() => { clearCallHistory(); setConfirmClear(false); }}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
              title="Clear history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Entries */}
        <div className="p-2">
          {displayedEntries.map((entry) => (
            <HistoryRow
              key={entry.id}
              entry={entry}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>

        {/* Expand / collapse */}
        {hasMore && (
          <div className="border-t border-slate-100 px-4 py-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer py-1 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Show {callHistory.length - COLLAPSED_COUNT} more</>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
