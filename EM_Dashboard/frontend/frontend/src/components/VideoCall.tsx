import React from 'react';
import { Video, Phone, PhoneOff, Wifi, WifiOff } from 'lucide-react';
import { useCall } from '../context/CallContext';

const CONTACTS = [
  { id: 'Chief Minister', name: 'Office of Chief Minister' },
  { id: 'New Delhi DM', name: 'Alice Vaz (New Delhi DM)' },
  { id: 'West Delhi DM', name: 'Amit Kumar (West Delhi DM)' },
  { id: 'Director of Education', name: 'Himanshu Gupta (IAS)' },
  { id: 'Director Health Services', name: 'Dr. Shalini Gupta' },
];

export const VideoCall: React.FC = () => {
  const { startCall, callState, activeCallPartner, isConnected } = useCall();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Video className="h-5 w-5 text-indigo-600" />
          Video Conference Room
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
          Secure, real-time audio &amp; video briefings between the Chief Minister, Cabinet Ministers, and District Magistrates.
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold ml-2">
              <Wifi className="h-3 w-3" /> Relay connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold ml-2">
              <WifiOff className="h-3 w-3" /> Relay offline — start the signaling server
            </span>
          )}
        </p>
      </div>

      {callState !== 'idle' && activeCallPartner ? (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-indigo-900">
              {callState === 'dialing' ? `Calling ${activeCallPartner.name}...` : callState === 'ringing' ? `Incoming call from ${activeCallPartner.name}` : `On a call with ${activeCallPartner.name}`}
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">Use the call window to manage mute, camera and notes.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Dial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTACTS.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{contact.name}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{contact.id}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startCall(contact, 'audio')}
                    title="Audio call"
                    className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => startCall(contact, 'video')}
                    title="Video call"
                    className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <PhoneOff className="h-3 w-3" /> Calls are routed peer-to-peer via WebRTC once connected — no audio/video passes through the signaling server.
          </p>
        </div>
      )}
    </div>
  );
};
