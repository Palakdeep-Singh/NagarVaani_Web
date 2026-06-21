import React from 'react';
import { Video, Phone, PhoneOff, Wifi, WifiOff } from 'lucide-react';
import { useCall } from '../context/CallContext';

const CONTACTS = [
  { id: 'CM_OFFICE', name: 'Office of Chief Minister' },
  { id: 'SDM_SHAHDARA_N', name: 'Priya Sharma (SDM Shahdara North)' },
  { id: 'SDM_SHAHDARA_C', name: 'Aman Verma (SDM Shahdara Central)' },
  { id: 'NODAL_DJB', name: 'Delhi Jal Board Nodal Officer' },
  { id: 'NODAL_PWD', name: 'PWD Infrastructure Nodal Officer' },
];

export const VideoCall: React.FC = () => {
  const { startCall, callState, activeCallPartner, isConnected } = useCall();

  return (
    <div className="page-shell fade-in space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Video className="text-indigo-600 w-5 h-5" />
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Secure WebRTC Communication</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
        End-to-end encrypted video and audio briefings with upper management and field officers.
        {isConnected ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold ml-2 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Wifi className="h-3 w-3" /> Encrypted Relay Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-600 font-bold ml-2 text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <WifiOff className="h-3 w-3" /> Relay Offline
          </span>
        )}
      </p>

      {callState !== 'idle' && activeCallPartner ? (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-indigo-900">
              {callState === 'dialing' ? `Establishing connection with ${activeCallPartner.name}...` : callState === 'ringing' ? `Incoming transmission from ${activeCallPartner.name}` : `Active channel with ${activeCallPartner.name}`}
            </p>
            <p className="text-xs text-indigo-600 mt-1">Peer-to-peer secure channel. No logs are retained on the signaling server.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Direct Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTACTS.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{contact.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{contact.id}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startCall(contact, 'audio')}
                    title="Encrypted Audio"
                    className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startCall(contact, 'video')}
                    title="Encrypted Video"
                    className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex items-start gap-2 border border-slate-200">
            <PhoneOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700">Notice:</strong> Calls are routed peer-to-peer via WebRTC once connected. Only signaling data passes through the NagarVaani central servers. Official directives communicated via voice should be formally logged in the Directives module.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
