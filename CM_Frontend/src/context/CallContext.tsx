import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CallState = 'idle' | 'dialing' | 'ringing' | 'active';
export type CallType = 'audio' | 'video';

export interface CallParticipant {
  /** Stable identity used for signaling — we use the role label already used
   *  across the app (e.g. "Chief Minister", "New Delhi DM"). */
  id: string;
  name: string;
}

interface CallContextType {
  callState: CallState;
  callType: CallType;
  activeCallPartner: CallParticipant | null;
  callDuration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  isConnected: boolean;
  startCall: (partner: CallParticipant, type: CallType) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  hangupCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

// Signaling server URL — override with VITE_SIGNALING_URL in a .env file if
// the relay server runs elsewhere. See /server in the project root.
const SIGNALING_URL = import.meta.env?.VITE_SIGNALING_URL || 'http://localhost:5001';

// ─── Lightweight ring/dial tone helper (Web Audio API, no audio files) ──────
class PhoneAudio {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private osc: OscillatorNode[] | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playRing() {
    this.init();
    this.stop();
    if (!this.ctx) return;
    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gain.connect(this.ctx.destination);

    const playBeep = () => {
      if (!this.ctx || !this.gain) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc1.connect(this.gain);
      osc2.connect(this.gain);
      osc1.start();
      osc2.start();
      this.gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.1);
      setTimeout(() => {
        if (this.gain && this.ctx) {
          this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        }
        setTimeout(() => {
          try { osc1.stop(); osc2.stop(); } catch (e) { /* noop */ }
        }, 150);
      }, 1500);
    };

    playBeep();
    this.interval = setInterval(playBeep, 3000);
  }

  playDial() {
    this.init();
    this.stop();
    if (!this.ctx) return;
    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.gain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.connect(this.gain);
    osc2.connect(this.gain);
    osc.start();
    osc2.start();
    this.osc = [osc, osc2];
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.osc) {
      this.osc.forEach((o) => { try { o.stop(); } catch (e) { /* noop */ } });
      this.osc = null;
    }
    if (this.gain) {
      try { this.gain.disconnect(); } catch (e) { /* noop */ }
      this.gain = null;
    }
  }
}

const audioHelper = new PhoneAudio();

// ─── Provider ────────────────────────────────────────────────────────────

export const CallProvider: React.FC<{ selfId: string; selfName: string; children: React.ReactNode }> = ({
  selfId,
  selfName,
  children,
}) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [activeCallPartner, setActiveCallPartner] = useState<CallParticipant | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always-fresh refs so socket callbacks never see stale closures
  const callStateRef = useRef<CallState>('idle');
  const activeCallPartnerRef = useRef<CallParticipant | null>(null);
  const callTypeRef = useRef<CallType>('video');
  const selfIdRef = useRef(selfId);
  const selfNameRef = useRef(selfName);

  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { activeCallPartnerRef.current = activeCallPartner; }, [activeCallPartner]);
  useEffect(() => { callTypeRef.current = callType; }, [callType]);
  useEffect(() => { selfIdRef.current = selfId; selfNameRef.current = selfName; }, [selfId, selfName]);

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endCallSession = useCallback(() => {
    audioHelper.stop();
    stopTimer();
    setCallState('idle');
    setActiveCallPartner(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const initiateWebRTCPeer = useCallback(async (isCaller: boolean) => {
    const partner = activeCallPartnerRef.current;
    const vType = callTypeRef.current;
    if (!partner) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: vType === 'video',
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('signal', {
            type: 'webrtc_ice',
            sender: { id: selfIdRef.current, name: selfNameRef.current },
            receiver: { id: partner.id, name: partner.name },
            data: { candidate: event.candidate },
          });
        }
      };

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('signal', {
          type: 'webrtc_offer',
          sender: { id: selfIdRef.current, name: selfNameRef.current },
          receiver: { id: partner.id, name: partner.name },
          data: { offer },
        });
      }
    } catch (err) {
      // Camera/mic unavailable (e.g. permissions denied, or a headless demo
      // environment) — keep the call session alive without local media so
      // chat/notes and call controls still work.
      console.warn('[Call] getUserMedia failed, continuing without local media:', err);
    }
  }, []);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const partner = activeCallPartnerRef.current;
      if (!pcRef.current) await initiateWebRTCPeer(false);
      if (!pcRef.current || !partner) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current?.emit('signal', {
        type: 'webrtc_answer',
        sender: { id: selfIdRef.current, name: selfNameRef.current },
        receiver: { id: partner.id, name: partner.name },
        data: { answer },
      });
    } catch (err) {
      console.warn('[Call] Offer handling failed:', err);
    }
  }, [initiateWebRTCPeer]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn('[Call] Answer handling failed:', err);
    }
  }, []);

  // ── Socket.IO signaling connection ─────────────────────────────────────
  useEffect(() => {
    const unlockAudio = () => { /* satisfies autoplay policies on first interaction */ };
    window.addEventListener('click', unlockAudio, { once: true });

    const socket = io(SIGNALING_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register', selfIdRef.current);
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('signal', async (payload: any) => {
      if (!payload) return;
      const { type, sender, data } = payload;

      if (type === 'call_init') {
        if (callStateRef.current !== 'idle') {
          socket.emit('signal', {
            type: 'call_busy',
            sender: { id: selfIdRef.current, name: selfNameRef.current },
            receiver: sender,
          });
          return;
        }
        setCallType(data.callType);
        setActiveCallPartner({ id: sender.id, name: sender.name });
        setCallState('ringing');
        audioHelper.playRing();
      } else if (type === 'call_accept') {
        audioHelper.stop();
        setCallState('active');
        startTimer();
        initiateWebRTCPeer(false);
      } else if (type === 'call_reject' || type === 'call_hangup') {
        endCallSession();
      } else if (type === 'call_busy') {
        endCallSession();
      } else if (type === 'webrtc_offer') {
        await handleOffer(data.offer);
      } else if (type === 'webrtc_answer') {
        await handleAnswer(data.answer);
      } else if (type === 'webrtc_ice') {
        if (pcRef.current && data.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.warn('[Call] ICE candidate error:', err);
          }
        }
      }
    });

    return () => {
      window.removeEventListener('click', unlockAudio);
      socket.disconnect();
      audioHelper.stop();
    };
    // Re-register if the active identity (selfId) changes, e.g. switching role/login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfId]);

  // ── Public actions ──────────────────────────────────────────────────────

  const startCall = (partner: CallParticipant, type: CallType) => {
    setCallType(type);
    setActiveCallPartner(partner);
    setCallState('dialing');
    audioHelper.playDial();

    socketRef.current?.emit('signal', {
      type: 'call_init',
      sender: { id: selfId, name: selfName },
      receiver: { id: partner.id, name: partner.name },
      data: { callType: type },
    });

    setTimeout(() => {
      if (callStateRef.current === 'dialing') {
        endCallSession();
      }
    }, 30000);
  };

  const acceptCall = () => {
    const partner = activeCallPartnerRef.current;
    if (!partner) return;
    audioHelper.stop();
    setCallState('active');
    startTimer();
    socketRef.current?.emit('signal', {
      type: 'call_accept',
      sender: { id: selfId, name: selfName },
      receiver: { id: partner.id, name: partner.name },
    });
    initiateWebRTCPeer(true);
  };

  const rejectCall = () => {
    const partner = activeCallPartnerRef.current;
    audioHelper.stop();
    if (partner) {
      socketRef.current?.emit('signal', {
        type: 'call_reject',
        sender: { id: selfId, name: selfName },
        receiver: { id: partner.id, name: partner.name },
      });
    }
    endCallSession();
  };

  const hangupCall = () => {
    const partner = activeCallPartnerRef.current;
    audioHelper.stop();
    if (partner) {
      socketRef.current?.emit('signal', {
        type: 'call_hangup',
        sender: { id: selfId, name: selfName },
        receiver: { id: partner.id, name: partner.name },
      });
    }
    endCallSession();
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        activeCallPartner,
        callDuration,
        isMuted,
        isVideoOff,
        localVideoRef,
        remoteVideoRef,
        isConnected,
        startCall,
        acceptCall,
        rejectCall,
        hangupCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
};
