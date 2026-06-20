import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, FileText } from 'lucide-react';
import { useCall } from '../context/CallContext';

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

export const CallOverlay: React.FC = () => {
  const {
    callState, callType, activeCallPartner, callDuration,
    isMuted, isVideoOff, localVideoRef, remoteVideoRef,
    acceptCall, rejectCall, hangupCall, toggleMute, toggleVideo,
    permissionModalPartner, setPermissionModalPartner
  } = useCall();

  const [notes, setNotes] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedulePurpose, setSchedulePurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (permissionModalPartner) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
        <div className="bg-white border border-slate-200 w-[90%] max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-extrabold text-lg">
              🔒
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Call Permission Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct hotlines to **{permissionModalPartner.name}** are restricted for lower-level operational safety. Please request call authorization or schedule a meeting slot.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-2xl text-center space-y-2 animate-in zoom-in duration-200">
              <span className="text-2xl">✅</span>
              <h4 className="text-xs font-bold text-emerald-800 uppercase">Request Dispatched</h4>
              <p className="text-[11px] text-emerald-600 leading-relaxed">
                Your request to schedule a briefing on **"{schedulePurpose}"** for **{scheduleTime || 'earliest availability'}** has been sent to the CM/DM Office.
              </p>
              <button
                onClick={() => { setPermissionModalPartner(null); setSubmitted(false); setSchedulePurpose(''); }}
                className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3 pt-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Briefing Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Urgently report PWD flyover SLA delay details"
                  value={schedulePurpose}
                  onChange={e => setSchedulePurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Time Slot</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-750 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPermissionModalPartner(null)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors text-center shadow-md shadow-indigo-600/10"
                >
                  Request Call
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (callState === 'idle' || !activeCallPartner) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-[95%] max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[580px]">

        {(callState === 'dialing' || callState === 'ringing') && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-4xl font-extrabold flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-pulse">
              {initials(activeCallPartner.name)}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {callState === 'dialing' ? `Calling ${activeCallPartner.name}...` : `Incoming ${callType} call`}
              </h2>
              {callState === 'ringing' && (
                <p className="text-sm font-bold text-slate-500 mt-1">{activeCallPartner.name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {callState === 'ringing' ? (
                <>
                  <button
                    onClick={acceptCall}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    <Phone className="h-4.5 w-4.5" /> Accept
                  </button>
                  <button
                    onClick={rejectCall}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 transition-colors"
                  >
                    <PhoneOff className="h-4.5 w-4.5" /> Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={hangupCall}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 transition-colors"
                >
                  <PhoneOff className="h-4.5 w-4.5" /> Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {callState === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] h-full">
            <div className="flex flex-col h-full border-r border-slate-200">
              <div className="flex-1 grid grid-cols-2 gap-3 p-4 bg-slate-50">
                <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1.5">
                    You {isMuted && <MicOff className="h-3 w-3 text-rose-400" />}
                  </span>
                </div>
                <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  {callType === 'video' ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl">🎙️</div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white">
                    {activeCallPartner.name}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-center gap-4">
                <span className="text-slate-700 font-mono font-bold text-sm mr-2">{formatTime(callDuration)}</span>
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className={`h-11 w-11 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                    isMuted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isMuted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                </button>
                {callType === 'video' && (
                  <button
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                    className={`h-11 w-11 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                      isVideoOff ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="h-4.5 w-4.5" /> : <Video className="h-4.5 w-4.5" />}
                  </button>
                )}
                <button
                  onClick={hangupCall}
                  title="End call"
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors shadow-md shadow-rose-600/20"
                >
                  <PhoneOff className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col bg-white">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> Live Call Notes
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type key points or decisions taken during this call..."
                className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
