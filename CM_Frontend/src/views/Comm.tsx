import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  MessageSquare, Video, Send, Mic, MicOff, VideoIcon, VideoOff,
  ScreenShare, ScreenShareOff, FileText, PhoneOff, Sparkles
} from 'lucide-react';

export const Comm: React.FC = () => {
  const { messages, addMessage, activeRole, activeDistrict, activeDepartment } = useStore();
  const [activeCommTab, setActiveCommTab] = useState<'Chat' | 'Video'>('Chat');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('Chief Minister');

  // Video call simulator states
  const [inCall, setInCall] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [meetingNotes, setMeetingNotes] = useState<string>('1. Monsoon preparation status reviewed for Lajpat Nagar drainage.\n2. Education department cleared bench procurement proposal file DF-2026-101.\n3. Water sample testing scheduled for West Delhi.');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    addMessage(chatInput, selectedContact);
    setChatInput('');
  };

  // Filter messages for current user perspective
  let userRoleLabel = activeRole as string;
  if (activeRole === 'District Magistrate') userRoleLabel = `${activeDistrict} DM`;
  if (activeRole === 'Department Head') userRoleLabel = activeDepartment === 'Education & Schools' ? 'Director of Education' : 'Director Health Services';

  const contactList = [
    { role: 'Chief Minister', name: 'Office of Chief Minister' },
    { role: 'New Delhi DM', name: 'Alice Vaz (New Delhi DM)' },
    { role: 'West Delhi DM', name: 'Amit Kumar (West Delhi DM)' },
    { role: 'Director of Education', name: 'Himanshu Gupta (IAS)' },
    { role: 'Director Health Services', name: 'Dr. Shalini Gupta' }
  ].filter(c => c.role !== userRoleLabel);

  // Group messages
  const threadMessages = messages.filter(
    m => (m.senderRole === userRoleLabel && m.receiverRole === selectedContact) ||
         (m.senderRole === selectedContact && m.receiverRole === userRoleLabel)
  );

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Delhi Gov Communications Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Internal secure chats and virtual briefing rooms connecting ministries and district officers.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveCommTab('Chat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCommTab === 'Chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Internal Messenger
          </button>
          <button
            onClick={() => setActiveCommTab('Video')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCommTab === 'Video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="h-4 w-4" /> Briefing Room (Video)
          </button>
        </div>
      </div>

      {/* INTERNAL MESSAGING VIEW */}
      {activeCommTab === 'Chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Contacts Directory */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col h-[520px]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 px-2">
              Ministries & Officers
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {contactList.map(contact => {
                const isSelected = selectedContact === contact.role;
                return (
                  <button
                    key={contact.role}
                    onClick={() => setSelectedContact(contact.role)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white font-bold'
                        : 'bg-slate-950/20 text-slate-400 hover:bg-slate-900/40 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
                      {contact.name[0]}
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs text-white">{contact.name}</div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">{contact.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 glass-panel rounded-2xl flex flex-col h-[520px] overflow-hidden">
            
            {/* Header info */}
            <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-500/10 rounded-lg flex items-center justify-center font-bold text-xs text-indigo-400">
                  {selectedContact[0]}
                </div>
                <div className="leading-none">
                  <h4 className="text-xs font-bold text-white">Active Thread: {selectedContact}</h4>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1 block">
                    Secure encrypted government channel
                  </span>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
              {threadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  No chat logs recorded in this thread yet. Send a message to start conversation.
                </div>
              ) : (
                threadMessages.map((msg, index) => {
                  const isSentByMe = msg.senderRole === userRoleLabel;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isSentByMe
                            ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-800/80 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1 font-semibold">
                        {msg.senderName} • {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Send Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Send message as ${userRoleLabel}...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-indigo-600/10"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VIDEO CONFERENCING VIEW */}
      {activeCommTab === 'Video' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Main Video Stream Frame (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            
            {inCall ? (
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl h-[420px] flex items-center justify-center">
                
                {/* Simulated Camera Video feed grid */}
                <div className="absolute inset-0 grid grid-cols-2 p-4 gap-3">
                  
                  {/* Participant 1: CM */}
                  <div className="relative bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center">
                    {isVideoOff ? (
                      <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">CM</div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xs text-slate-400 font-bold mb-2">Simulated CM Web Cam Feed</div>
                        <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping mx-auto" />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                      Chief Minister (Me)
                    </span>
                  </div>

                  {/* Participant 2: New Delhi DM */}
                  <div className="relative bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-slate-400 font-bold mb-2">Simulated DM Cam Feed</div>
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse mx-auto" />
                    </div>
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                      Alice Vaz (New Delhi DM)
                    </span>
                  </div>

                  {/* Participant 3: West Delhi DM */}
                  <div className="relative bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-slate-400 font-bold mb-2">Simulated DM Cam Feed</div>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1">
                      Amit Kumar (West Delhi DM)
                      <span className="text-rose-500 text-[8px] font-bold">[Muted]</span>
                    </span>
                  </div>

                  {/* Participant 4: Director Education */}
                  <div className="relative bg-slate-900 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center">
                    {isSharingScreen ? (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] text-teal-400 font-bold flex items-center gap-1 mb-2">
                          <ScreenShare className="h-4 w-4" /> SCREEN SHARING ACTIVE
                        </span>
                        <div className="w-full h-24 bg-slate-950 border border-slate-800/60 rounded p-2 flex flex-col justify-between text-[8px] text-slate-400 font-mono">
                          <div>$ npm run build</div>
                          <div className="text-emerald-400">✓ build complete (production mode ready)</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xs text-slate-400 font-bold mb-2">Simulated Director Cam Feed</div>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-bold text-white">
                      Himanshu Gupta (IAS, Education)
                    </span>
                  </div>

                </div>

                {/* Call Status Header */}
                <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-full text-[9px] text-indigo-400 font-bold flex items-center gap-1.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                  Cabinet Briefing Call Room #802
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl h-[420px] flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 text-rose-500">
                  <PhoneOff className="h-8 w-8" />
                </div>
                <h3 className="text-md font-bold text-white">Conference Call Disconnected</h3>
                <p className="text-xs text-slate-500">The CM briefing call ended successfully.</p>
                <button
                  onClick={() => setInCall(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors shadow-lg shadow-indigo-600/10"
                >
                  Join Call Back
                </button>
              </div>
            )}

            {/* Video Controls Panel */}
            {inCall && (
              <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isMuted ? 'bg-rose-950 text-rose-400 border-rose-500/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                  </button>
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isVideoOff ? 'bg-rose-950 text-rose-400 border-rose-500/30' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="h-4.5 w-4.5" /> : <VideoIcon className="h-4.5 w-4.5" />}
                  </button>
                  <button
                    onClick={() => setIsSharingScreen(!isSharingScreen)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSharingScreen ? 'bg-indigo-600 text-white border-indigo-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSharingScreen ? <ScreenShareOff className="h-4.5 w-4.5" /> : <ScreenShare className="h-4.5 w-4.5" />}
                  </button>
                </div>

                <button
                  onClick={() => setInCall(false)}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/10 transition-colors"
                >
                  <PhoneOff className="h-4.5 w-4.5" /> Leave Call
                </button>
              </div>
            )}

          </div>

          {/* Meeting Notes / Scribe Sidebar (1 col) */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[490px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                Cabinet Meeting Minutes Scribe
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 font-semibold">Real-time collaboration notepad for CM briefing.</p>
              
              <textarea
                rows={16}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none font-mono leading-relaxed"
                placeholder="Start typing meeting minutes notes here..."
              />
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/10 text-[9px] text-indigo-300 font-semibold mt-4">
              <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              Notepad is synchronized in real-time with all participants.
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
