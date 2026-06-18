import React, { useState } from 'react';
import {
  Video, Mic, MicOff, VideoIcon, VideoOff,
  ScreenShare, ScreenShareOff, FileText, PhoneOff, Sparkles
} from 'lucide-react';

export const VideoCall: React.FC = () => {
  
  const [inCall, setInCall] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [meetingNotes, setMeetingNotes] = useState<string>(
    '1. Monsoon preparation status reviewed for Lajpat Nagar drainage.\n2. Education department cleared bench procurement proposal file DF-2026-101.\n3. Water sample testing scheduled for West Delhi.\n4. District ranking data finalized for Central Delhi.'
  );

  return (
    <div className="space-y-6">
      
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Video className="h-5 w-5 text-indigo-600" />
          Video Conference Room
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Secure, real-time video briefings between the Chief Minister, Cabinet Ministers, and District Magistrates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
                <div className="lg:col-span-2 space-y-4">
          
          {inCall ? (
            <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-4 shadow-sm h-[320px] sm:h-[440px] flex items-center justify-center">
              
                            <div className="absolute inset-0 grid grid-cols-2 p-4 gap-4">
                
                                <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  {isVideoOff ? (
                    <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                      CM
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs text-slate-400 font-bold mb-2">CM Office Web Camera Feed</div>
                      <div className="flex justify-center gap-1">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1.5">
                    Chief Minister (Me)
                    {isMuted && <MicOff className="h-3 w-3 text-rose-400" />}
                  </span>
                </div>

                                <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 font-bold mb-2">Alice Vaz (New Delhi DM)</div>
                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse mx-auto" />
                  </div>
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1">
                    New Delhi DM
                  </span>
                </div>

                                <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 font-bold mb-2">Amit Kumar (West Delhi DM)</div>
                    <div className="text-xs text-rose-400 font-semibold mt-1">Microphone Muted</div>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1.5">
                    West Delhi DM
                    <MicOff className="h-3 w-3 text-rose-500" />
                  </span>
                </div>

                                <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  {isSharingScreen ? (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
                      <span className="text-xs text-teal-400 font-bold flex items-center gap-1.5 mb-2">
                        <ScreenShare className="h-4 w-4" /> SCREEN SHARING ACTIVE
                      </span>
                      <div className="w-full max-w-[200px] h-20 bg-slate-900 border border-slate-800 rounded p-2 flex flex-col justify-between text-xs text-slate-400 font-sans">
                        <div>$ npm run build</div>
                        <div className="text-emerald-400">✓ build complete (production mode ready)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs text-slate-400 font-bold mb-2">Director Education Feed</div>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mx-auto" />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-xs font-bold text-white">
                    Himanshu Gupta (IAS)
                  </span>
                </div>

              </div>

                            <div className="absolute top-6 left-6 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-full text-xs text-indigo-400 font-bold flex items-center gap-1.5 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                Cabinet Briefing Call Room #802
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm h-[320px] sm:h-[440px] flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 text-rose-600">
                <PhoneOff className="h-8 w-8" />
              </div>
              <h3 className="text-md font-bold text-slate-800">Conference Call Disconnected</h3>
              <p className="text-xs text-slate-500">The CM briefing call ended successfully.</p>
              <button
                onClick={() => setInCall(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors shadow-md shadow-indigo-600/10"
              >
                Join Call Back
              </button>
            </div>
          )}

                    {inCall && (
            <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isMuted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isVideoOff ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                >
                  {isVideoOff ? <VideoOff className="h-4.5 w-4.5" /> : <VideoIcon className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={() => setIsSharingScreen(!isSharingScreen)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSharingScreen ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title={isSharingScreen ? 'Stop Screen Share' : 'Share Screen'}
                >
                  {isSharingScreen ? <ScreenShareOff className="h-4.5 w-4.5" /> : <ScreenShare className="h-4.5 w-4.5" />}
                </button>
              </div>

              <button
                onClick={() => setInCall(false)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/10 transition-colors border border-rose-700"
              >
                <PhoneOff className="h-4.5 w-4.5" /> Leave Call
              </button>
            </div>
          )}

        </div>

                <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex flex-col justify-between h-[350px] lg:h-[508px]">
          <div className="flex flex-col flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-600" />
              Meeting Minutes Notepad
            </h3>
            <p className="text-xs text-slate-400 font-bold mb-4">Real-time collaborative notepad for cabinet briefing notes.</p>
            
            <textarea
              rows={15}
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed flex-1"
              placeholder="Start typing meeting minutes notes here..."
            />
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 font-semibold mt-4">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            Notepad is synchronized in real-time with all participants.
          </div>
        </div>

      </div>

    </div>
  );
};
