import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Phone, FileText, Lock,
  Check, Download, Shield, PhoneMissed, AlertCircle, RefreshCw,
  PhoneIncoming, Clock, CalendarDays, X, Bell
} from 'lucide-react';
import { useCall } from '../context/CallContext';
import type { CallRequest } from '../context/CallContext';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
};

const getConnectionStatusLabel = (state: string) => {
  switch (state) {
    case 'connected':    return 'Secure E2EE Channel Active';
    case 'connecting':   return 'Establishing WebRTC Connection...';
    case 'new':          return 'Registering Peer Handshake...';
    case 'disconnected': return 'Reconnecting Carrier Signal...';
    case 'failed':       return 'Handshake Check Failed';
    case 'closed':       return 'Line Offline';
    default:             return 'Registering Peer Handshake...';
  }
};

const getConnectionStatusBadgeStyle = (state: string) => {
  switch (state) {
    case 'connected':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'connecting':
    case 'new':          return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'failed':
    case 'disconnected': return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    default:             return 'bg-slate-50 text-slate-500 border-slate-200';
  }
};

const FallbackAvatar: React.FC<{ name: string; sub: string; label?: string; pulse?: boolean }> = ({ name, sub, label, pulse }) => (
  <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-slate-50 border border-slate-200 rounded-xl p-6 text-center select-none animate-in fade-in duration-200">
    <div className={`h-16 w-16 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xl font-extrabold flex items-center justify-center shadow-inner ${pulse ? 'animate-pulse' : ''}`}>
      {initials(name)}
    </div>
    <div>
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{name}</h4>
      <p className="text-[9px] text-slate-500 font-bold tracking-wide uppercase mt-0.5">{sub}</p>
    </div>
    {label && (
      <span className="text-[10px] bg-slate-200/60 border border-slate-250 px-2 py-0.5 rounded text-slate-600 font-bold uppercase tracking-wider mt-1">
        {label}
      </span>
    )}
    {pulse && (
      <span className="text-[9px] text-indigo-600 font-mono tracking-widest uppercase mt-2 animate-pulse">
        ● Syncing Broadcast Line...
      </span>
    )}
  </div>
);

// ─── Floating Call Notification Toast ────────────────────────────────────────
const CallNotificationToast: React.FC = () => {
  const { callNotification, notificationPartner, dismissNotification } = useCall();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!callNotification) { setProgress(100); return; }
    setProgress(100);
    const start    = Date.now();
    const duration = 5000;
    const tick = setInterval(() => {
      const remaining = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(tick);
    }, 50);
    return () => clearInterval(tick);
  }, [callNotification]);

  if (!callNotification) return null;

  const config = {
    rejected: {
      icon: <PhoneMissed className="h-5 w-5 text-rose-600" />,
      bg:   'bg-rose-50 border-rose-200',
      bar:  'bg-rose-500',
      title: 'Call Declined',
      desc:  notificationPartner
        ? `${notificationPartner.name} declined your call.`
        : 'Your call was declined.',
    },
    missed: {
      icon: <PhoneMissed className="h-5 w-5 text-orange-600" />,
      bg:   'bg-orange-50 border-orange-200',
      bar:  'bg-orange-500',
      title: 'Missed Call',
      desc:  notificationPartner
        ? `Missed call from ${notificationPartner.name}.`
        : 'You missed an incoming call.',
    },
    busy: {
      icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
      bg:   'bg-amber-50 border-amber-200',
      bar:  'bg-amber-500',
      title: 'Line Busy',
      desc:  notificationPartner
        ? `${notificationPartner.name} is currently on another call.`
        : 'The line is currently busy.',
    },
    interrupted: {
      icon: <RefreshCw className="h-5 w-5 text-indigo-600" />,
      bg:   'bg-indigo-50 border-indigo-200',
      bar:  'bg-indigo-500',
      title: 'Call Interrupted',
      desc:  notificationPartner
        ? `Your call with ${notificationPartner.name} was disconnected due to page reload.`
        : 'Your previous call was disconnected.',
    },
  }[callNotification];

  return (
    <div className={`fixed bottom-6 right-6 z-[1100] w-80 rounded-2xl border shadow-2xl shadow-slate-900/10 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300 ${config.bg}`}>
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{config.title}</h4>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{config.desc}</p>
        </div>
        <button
          onClick={dismissNotification}
          className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none cursor-pointer"
          title="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="h-0.5 bg-slate-200/60">
        <div className={`h-full transition-none ${config.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// ─── Call Request Card (for CM/DM receiving formal briefing requests) ─────────
const CallRequestCard: React.FC<{ req: CallRequest }> = ({ req }) => {
  const { startCall, callState, dismissCallRequest } = useCall();

  const callBack = (type: 'audio' | 'video') => {
    dismissCallRequest(req.id);
    startCall(req.from, type);
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl shadow-md shadow-indigo-600/5 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="bg-indigo-50/80 border-b border-indigo-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PhoneIncoming className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">Briefing Request</span>
        </div>
        <button
          onClick={() => dismissCallRequest(req.id)}
          className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3.5 space-y-2.5">
        {/* Who */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-extrabold flex items-center justify-center shrink-0">
            {initials(req.from.name)}
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-800">{req.from.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.from.id}</p>
          </div>
        </div>

        {/* Purpose */}
        {req.purpose && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Briefing Purpose</p>
            <p className="text-xs text-slate-700 leading-snug">{req.purpose}</p>
          </div>
        )}

        {/* Proposed time + sent time */}
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {req.scheduledTime && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {new Date(req.scheduledTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            {timeAgo(req.timestamp)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            disabled={callState !== 'idle'}
            onClick={() => callBack('audio')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Phone className="h-3.5 w-3.5 text-indigo-600" /> Audio
          </button>
          <button
            disabled={callState !== 'idle'}
            onClick={() => callBack('video')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Video className="h-3.5 w-3.5" /> Video
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Call Requests Panel (fixed, bottom-left) ─────────────────────────────────
const CallRequestsPanel: React.FC = () => {
  const { pendingCallRequests } = useCall();
  if (pendingCallRequests.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[1090] w-72 space-y-3">
      {pendingCallRequests.slice(0, 3).map(req => (
        <CallRequestCard key={req.id} req={req} />
      ))}
      {pendingCallRequests.length > 3 && (
        <div className="text-center text-[10px] text-slate-400 font-bold">
          +{pendingCallRequests.length - 3} more requests
        </div>
      )}
    </div>
  );
};

// ─── Permission Modal (sends real socket signal) ──────────────────────────────
const PermissionModal: React.FC = () => {
  const { permissionModalPartner, setPermissionModalPartner, sendCallRequest, isConnected } = useCall();

  const [scheduleTime,    setScheduleTime]    = useState('');
  const [schedulePurpose, setSchedulePurpose] = useState('');
  const [submitted,       setSubmitted]       = useState(false);
  const [sendFailed,      setSendFailed]      = useState(false);

  // Reset state when partner changes
  useEffect(() => {
    setScheduleTime('');
    setSchedulePurpose('');
    setSubmitted(false);
    setSendFailed(false);
  }, [permissionModalPartner]);

  if (!permissionModalPartner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = sendCallRequest(permissionModalPartner, schedulePurpose, scheduleTime);
    if (ok) {
      setSubmitted(true);
      setSendFailed(false);
    } else {
      setSendFailed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/70 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-[90%] max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Briefing Request Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct calls to <strong>{permissionModalPartner.name}</strong> require a formal request.
            Submit below — the request will be delivered to them in real-time.
          </p>
          {!isConnected && (
            <p className="text-xs text-rose-600 font-bold">⚠ Relay offline — request cannot be delivered.</p>
          )}
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2 animate-in zoom-in duration-200 flex flex-col items-center">
            <Check className="h-6 w-6 text-emerald-600" />
            <h4 className="text-xs font-bold text-emerald-800 uppercase">Request Delivered</h4>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your briefing request has been sent to <strong>{permissionModalPartner.name}</strong> in real-time.
              They can call you back at their earliest availability.
            </p>
            <button
              onClick={() => setPermissionModalPartner(null)}
              className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Briefing Purpose *</label>
              <input
                type="text" required
                placeholder="E.g., Urgently report PWD flyover SLA delay details"
                value={schedulePurpose}
                onChange={e => setSchedulePurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Time Slot *</label>
              <input
                type="datetime-local" required
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mt-1"
              />
            </div>

            {sendFailed && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700 font-medium">
                ⚠ Could not deliver request — relay server is offline. Please try again when connected.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermissionModalPartner(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isConnected}
                className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer transition-colors text-center shadow-md shadow-indigo-600/10"
              >
                <Bell className="h-3.5 w-3.5 inline mr-1.5" />
                Send Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Main Call Overlay ────────────────────────────────────────────────────────
export const CallOverlay: React.FC = () => {
  const {
    callState, callType, activeCallPartner, callDuration,
    isMuted, isVideoOff, localVideoRef, remoteVideoRef,
    acceptCall, rejectCall, hangupCall, toggleMute, toggleVideo,
    permissionModalPartner,
    peerConnectionState, isRemoteVideoOff, isRemoteMuted, isRemoteStreamActive,
  } = useCall();

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activeCallPartner) {
      const saved = localStorage.getItem(`briefing_notes_${activeCallPartner.id}`);
      setNotes(saved || '');
    } else {
      setNotes('');
    }
  }, [activeCallPartner]);

  useEffect(() => {
    if (activeCallPartner && notes) {
      localStorage.setItem(`briefing_notes_${activeCallPartner.id}`, notes);
    }
  }, [notes, activeCallPartner]);

  const downloadNotes = () => {
    if (!notes.trim() || !activeCallPartner) return;
    const blob = new Blob([
      `NAGARVAANI SECURE GOVERNMENT BRIEFING NOTES\n`,
      `===========================================\n`,
      `Date/Time:  ${new Date().toLocaleString('en-IN')}\n`,
      `Partner:    ${activeCallPartner.name} (${activeCallPartner.id})\n`,
      `Duration:   ${formatTime(callDuration)}\n`,
      `Encryption: WebRTC End-to-End Secure\n`,
      `===========================================\n\n`,
      `Briefing Decisions & Notes:\n---------------------------\n`,
      notes,
    ], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `nagarvaani-notes-${activeCallPartner.id.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Always-visible elements (toasts, request cards, permission modal) */}
      <CallNotificationToast />
      <CallRequestsPanel />
      {permissionModalPartner && <PermissionModal />}

      {/* Full-screen call overlay — only when a call is in progress */}
      {callState !== 'idle' && activeCallPartner && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-[95%] max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">

            {/* ── Dialing / Ringing ─────────────────────────────── */}
            {(callState === 'dialing' || callState === 'ringing') && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-4xl font-extrabold flex items-center justify-center shadow-lg shadow-indigo-600/20 animate-pulse">
                  {initials(activeCallPartner.name)}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    {callState === 'dialing'
                      ? `Connecting to ${activeCallPartner.name}...`
                      : `Incoming Briefing Request`}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mt-1">
                    {activeCallPartner.name}
                  </p>
                  {callState === 'dialing' && (
                    <p className="text-[10px] text-slate-400 mt-2">
                      Waiting for response — call will timeout in 30 seconds
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {callState === 'ringing' ? (
                    <>
                      <button
                        onClick={acceptCall}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 transition-colors"
                      >
                        <Phone className="h-4 w-4" /> Accept Briefing
                      </button>
                      <button
                        onClick={rejectCall}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/10 transition-colors"
                      >
                        <PhoneOff className="h-4 w-4" /> Decline
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={hangupCall}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/10 transition-colors"
                    >
                      <PhoneOff className="h-4 w-4" /> Cancel Call
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Active call ───────────────────────────────────── */}
            {callState === 'active' && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] h-full">
                <div className="flex flex-col h-full border-r border-slate-200">

                  {/* Header */}
                  <div className="bg-slate-50/50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Secure Briefing Hotlink</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getConnectionStatusBadgeStyle(peerConnectionState)}`}>
                        {getConnectionStatusLabel(peerConnectionState)}
                      </span>
                      <span className="text-slate-800 font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded">
                        {formatTime(callDuration)}
                      </span>
                    </div>
                  </div>

                  {/* Video Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-3.5 p-4 bg-slate-50/30 overflow-hidden">
                    {/* Local */}
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                      {isVideoOff ? (
                        <FallbackAvatar name="You" sub="Your Camera Feed" label="Camera Disabled" />
                      ) : (
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl" />
                      )}
                      <span className="absolute bottom-3 left-3 bg-slate-950/70 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm">
                        You {isMuted && <MicOff className="h-3 w-3 text-rose-400" />}
                      </span>
                    </div>

                    {/* Remote */}
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                      {callType === 'video' && peerConnectionState === 'connected' && isRemoteStreamActive && !isRemoteVideoOff ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <FallbackAvatar
                          name={activeCallPartner.name}
                          sub={activeCallPartner.id}
                          label={
                            peerConnectionState !== 'connected'
                              ? 'Synchronizing WebRTC'
                              : isRemoteVideoOff ? 'Camera Disabled' : 'Audio Call Only'
                          }
                          pulse={peerConnectionState !== 'connected'}
                        />
                      )}
                      <span className="absolute bottom-3 left-3 bg-slate-950/70 px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1.5 backdrop-blur-sm">
                        {activeCallPartner.name}
                        {isRemoteMuted && <MicOff className="h-3 w-3 text-rose-400" />}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="bg-slate-50/50 border-t border-slate-200 p-4 flex items-center justify-center gap-4">
                    <button
                      onClick={toggleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                        isMuted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    {callType === 'video' && (
                      <button
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                          isVideoOff ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={hangupCall}
                      title="Disconnect Briefing"
                      className="h-11 w-11 rounded-2xl flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-all shadow-md shadow-rose-600/10 hover:scale-105"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notes sidebar */}
                <div className="p-4 flex flex-col bg-white h-full">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-150 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" /> Briefing Decisions
                    </h4>
                    <button
                      onClick={downloadNotes}
                      disabled={!notes.trim()}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg"
                    >
                      <Download size={13} /> Export
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type briefing log notes or operational decisions taken during this video conference..."
                    className="flex-1 resize-none bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-3.5 py-3.5 text-xs text-slate-700 focus:outline-none leading-relaxed"
                  />
                  <div className="text-[10px] text-slate-400 font-semibold text-center mt-3 tracking-wide">
                    Notes autosave in this browser session
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
