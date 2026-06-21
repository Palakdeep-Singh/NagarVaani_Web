import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from './Store';
import { useCallHistory } from '../hooks/useCallHistory';
import type { CallHistoryEntry, CallOutcome } from '../hooks/useCallHistory';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CallState = 'idle' | 'dialing' | 'ringing' | 'active';
export type CallType = 'audio' | 'video';
export type PeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
export type CallNotification = 'rejected' | 'busy' | 'interrupted' | 'missed' | null;

export interface CallParticipant {
  /** Stable identity used for signaling — role label (e.g. "Chief Minister", "New Delhi DM"). */
  id: string;
  name: string;
}

/** A formal call request sent by a lower-level official to a superior. */
export interface CallRequest {
  id: string;
  from: CallParticipant;
  purpose: string;
  scheduledTime: string;
  timestamp: string;
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
  permissionModalPartner: CallParticipant | null;
  setPermissionModalPartner: (p: CallParticipant | null) => void;
  peerConnectionState: PeerConnectionState;
  isRemoteVideoOff: boolean;
  isRemoteMuted: boolean;
  isRemoteStreamActive: boolean;
  // Notification for rejected/busy/interrupted/missed calls
  callNotification: CallNotification;
  notificationPartner: CallParticipant | null;
  dismissNotification: () => void;
  // Call history
  callHistory: CallHistoryEntry[];
  clearCallHistory: () => void;
  // Formal call requests (lower-level → CM/DM)
  pendingCallRequests: CallRequest[];
  sendCallRequest: (partner: CallParticipant, purpose: string, scheduledTime: string) => boolean;
  dismissCallRequest: (id: string) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

// ─── Lightweight ring/dial tone helper (Web Audio API) ───────────────────────
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
          try { osc1.stop(); osc2.stop(); } catch { /* noop */ }
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
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    if (this.osc) {
      this.osc.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
      this.osc = null;
    }
    if (this.gain) {
      try { this.gain.disconnect(); } catch { /* noop */ }
      this.gain = null;
    }
  }
}

const audioHelper = new PhoneAudio();

// ─── sessionStorage persistence helpers ─────────────────────────────────────
const RING_KEY   = 'nagarvaani_pending_ring';
const ACTIVE_KEY = 'nagarvaani_active_call';

interface PendingRingData {
  partner: CallParticipant;
  callType: CallType;
  timestamp: number;
}

interface ActiveCallData {
  partner: CallParticipant;
  callType: CallType;
}

const savePendingRing = (partner: CallParticipant, type: CallType) =>
  sessionStorage.setItem(RING_KEY, JSON.stringify({ partner, callType: type, timestamp: Date.now() } as PendingRingData));

const loadPendingRing = (): PendingRingData | null => {
  try {
    const raw = sessionStorage.getItem(RING_KEY);
    if (!raw) return null;
    const data: PendingRingData = JSON.parse(raw);
    if (Date.now() - data.timestamp > 90_000) { sessionStorage.removeItem(RING_KEY); return null; }
    return data;
  } catch { return null; }
};

const clearPendingRing = () => sessionStorage.removeItem(RING_KEY);

const saveActiveCall = (partner: CallParticipant, type: CallType) =>
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify({ partner, callType: type } as ActiveCallData));

const loadActiveCall = (): ActiveCallData | null => {
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const clearActiveCall = () => sessionStorage.removeItem(ACTIVE_KEY);

// ─── Canvas Mock Video Generator (fallback when camera unavailable) ──────────
const createMockVideoStream = (): MediaStream => {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const ctx = canvas.getContext('2d');
  let angle = 0, radiusMultiplier = 0;

  const intervalId = setInterval(() => {
    if (!ctx) return;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 640, 480);

    ctx.strokeStyle = '#E2E7EC';
    ctx.lineWidth = 1;
    for (let i = 0; i < 640; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 480); ctx.stroke(); }
    for (let j = 0; j < 480; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(640, j); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
    ctx.lineWidth = 2;
    const br = 120 + (radiusMultiplier % 40);
    ctx.beginPath(); ctx.arc(320, 220, br, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(320, 220, br + 40, 0, 2 * Math.PI); ctx.stroke();

    ctx.save(); ctx.translate(320, 220); ctx.rotate(angle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FF9933'; ctx.beginPath(); ctx.arc(0, 0, 80, -Math.PI / 3, Math.PI / 3); ctx.stroke();
    ctx.strokeStyle = '#94A3B8'; ctx.beginPath(); ctx.arc(0, 0, 80, Math.PI / 3, Math.PI); ctx.stroke();
    ctx.strokeStyle = '#138808'; ctx.beginPath(); ctx.arc(0, 0, 80, Math.PI, 5 * Math.PI / 3); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#0E548D'; ctx.font = 'bold 20px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('NagarVaani Video Relay', 320, 215);
    ctx.font = '500 13px monospace'; ctx.fillStyle = '#16A34A';
    ctx.fillText('● SECURE WebRTC LINE (E2EE)', 320, 245);
    ctx.font = '12px Inter, sans-serif'; ctx.fillStyle = '#67727E';
    ctx.fillText('Secure Video Feed Fallback', 320, 380);

    angle += 0.04; radiusMultiplier += 1.5;
  }, 80);

  const stream = canvas.captureStream(12);
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const dst = audioCtx.createMediaStreamDestination();
    osc.connect(dst);
    const silenceTrack = dst.stream.getAudioTracks()[0];
    if (silenceTrack) stream.addTrack(silenceTrack);
  } catch { /* noop */ }

  (stream as any)._cleanup = () => clearInterval(intervalId);
  return stream;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const CallProvider: React.FC<{ selfId: string; selfName: string; children: React.ReactNode }> = ({
  selfId, selfName, children,
}) => {
  const { socket } = useStore();

  const [callState,         setCallState]         = useState<CallState>('idle');
  const [callType,          setCallType]           = useState<CallType>('video');
  const [activeCallPartner, setActiveCallPartner]  = useState<CallParticipant | null>(null);
  const [callDuration,      setCallDuration]       = useState(0);
  const [isMuted,           setIsMuted]            = useState(false);
  const [isVideoOff,        setIsVideoOff]         = useState(false);
  const [isConnected,       setIsConnected]        = useState(false);
  const [permissionModalPartner, setPermissionModalPartner] = useState<CallParticipant | null>(null);

  const [peerConnectionState,  setPeerConnectionState]  = useState<PeerConnectionState>('closed');
  const [isRemoteVideoOff,     setIsRemoteVideoOff]     = useState(false);
  const [isRemoteMuted,        setIsRemoteMuted]        = useState(false);
  const [isRemoteStreamActive, setIsRemoteStreamActive] = useState(false);

  // Notification state (shown even after callState returns to idle)
  const [callNotification,  setCallNotification]  = useState<CallNotification>(null);
  const [notificationPartner, setNotificationPartner] = useState<CallParticipant | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Formal call requests (lower-level → CM/DM)
  const [pendingCallRequests, setPendingCallRequests] = useState<CallRequest[]>([]);

  // Call history
  const { history: callHistory, addEntry: addHistoryEntry, clearHistory: clearCallHistory } = useCallHistory(selfId);

  // Refs to track metadata for the current call (direction, outcome, start time)
  const callDirectionRef = useRef<'outgoing' | 'incoming'>('outgoing');
  const callOutcomeRef   = useRef<CallOutcome>('completed');
  const callStartedAtRef = useRef<string>(new Date().toISOString());

  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef   = useRef<HTMLVideoElement>(null);
  const remoteVideoRef  = useRef<HTMLVideoElement>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const callDurationRef = useRef(0); // always-fresh duration for history recording

  const initializingPromiseRef  = useRef<Promise<RTCPeerConnection | null> | null>(null);
  const iceCandidatesQueueRef   = useRef<RTCIceCandidateInit[]>([]);

  // Always-fresh refs so socket callbacks never see stale closures
  const callStateRef        = useRef<CallState>('idle');
  const activeCallPartnerRef = useRef<CallParticipant | null>(null);
  const callTypeRef         = useRef<CallType>('video');
  const selfIdRef           = useRef(selfId);
  const selfNameRef         = useRef(selfName);

  useEffect(() => { callStateRef.current = callState; },           [callState]);
  useEffect(() => { activeCallPartnerRef.current = activeCallPartner; }, [activeCallPartner]);
  useEffect(() => { callTypeRef.current = callType; },             [callType]);
  useEffect(() => { selfIdRef.current = selfId; selfNameRef.current = selfName; }, [selfId, selfName]);
  useEffect(() => { callDurationRef.current = callDuration; },     [callDuration]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const showNotification = useCallback((type: CallNotification, partner: CallParticipant | null) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setCallNotification(type);
    setNotificationPartner(partner);
    notifTimerRef.current = setTimeout(() => {
      setCallNotification(null);
      setNotificationPartner(null);
    }, 5000);
  }, []);

  const dismissNotification = useCallback(() => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setCallNotification(null);
    setNotificationPartner(null);
  }, []);

  const endCallSession = useCallback((silent = false) => {
    audioHelper.stop();
    const finalDuration = callDurationRef.current; // capture before stopTimer resets it
    stopTimer();
    clearPendingRing();
    clearActiveCall();

    // Record call history entry
    const partner = activeCallPartnerRef.current;
    if (partner && callStateRef.current !== 'idle') {
      const notes = localStorage.getItem(`briefing_notes_${partner.id}`) || '';
      addHistoryEntry({
        partner,
        callType:     callTypeRef.current,
        direction:    callDirectionRef.current,
        outcome:      callOutcomeRef.current,
        startedAt:    callStartedAtRef.current,
        endedAt:      new Date().toISOString(),
        durationSecs: finalDuration,
        notes,
      });
    }

    setCallState('idle');
    setActiveCallPartner(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setPeerConnectionState('closed');
    setIsRemoteVideoOff(false);
    setIsRemoteMuted(false);
    setIsRemoteStreamActive(false);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      if ((localStreamRef.current as any)._cleanup) (localStreamRef.current as any)._cleanup();
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    iceCandidatesQueueRef.current = [];
    initializingPromiseRef.current = null;
  }, []);

  // ── FIX 1: Re-attach streams after React paints the active video elements ──
  // The <video> elements only mount when callState === 'active'. By the time
  // initiateWebRTCPeer runs, the DOM hasn't updated yet so refs are null.
  // This effect fires AFTER the paint, guaranteeing the refs are populated.
  useEffect(() => {
    if (callState !== 'active') return;

    // Give React one animation frame to commit the <video> elements to the DOM
    const id = requestAnimationFrame(() => {
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    });
    return () => cancelAnimationFrame(id);
  }, [callState]);

  // ── FIX 2a: Save active call to sessionStorage so we can detect page reload ─
  useEffect(() => {
    if (callState === 'active' && activeCallPartner) {
      saveActiveCall(activeCallPartner, callType);
    }
  }, [callState, activeCallPartner, callType]);

  // ── FIX 2b: beforeunload — signal peer when the user closes/refreshes page ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      const partner = activeCallPartnerRef.current;
      const state   = callStateRef.current;
      if ((state === 'active' || state === 'dialing') && partner && socket?.connected) {
        // Synchronous send via sendBeacon-style fallback isn't available for socket.io,
        // but socket.io v4 queues the emit even during disconnect flush.
        socket.emit('signal', {
          type: 'call_hangup',
          sender:   { id: selfIdRef.current, name: selfNameRef.current },
          receiver: { id: partner.id, name: partner.name },
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket]);

  // ── FIX 2c: On page load, detect if user had an active call before refreshing ─
  useEffect(() => {
    if (!selfId) return;
    const wasActive = loadActiveCall();
    if (wasActive) {
      clearActiveCall();
      // Show an 'interrupted' notification without affecting callState
      showNotification('interrupted', wasActive.partner);
      console.log('[Call] Active call with', wasActive.partner.name, 'was interrupted by page reload');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfId]);

  // ── Restore ringing state after page refresh ─────────────────────────────
  useEffect(() => {
    if (!selfId) return;
    const pending = loadPendingRing();
    if (pending && callStateRef.current === 'idle') {
      console.log('[Call] Restoring pending ring from sessionStorage:', pending);
      setCallType(pending.callType);
      setActiveCallPartner(pending.partner);
      setCallState('ringing');
      audioHelper.playRing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfId]);

  // ── WebRTC peer setup ─────────────────────────────────────────────────────

  const initiateWebRTCPeer = useCallback(async (isCaller: boolean): Promise<RTCPeerConnection | null> => {
    if (pcRef.current) return pcRef.current;
    if (initializingPromiseRef.current) return initializingPromiseRef.current;

    const promise = (async () => {
      const partner = activeCallPartnerRef.current;
      const vType   = callTypeRef.current;
      if (!partner) return null;

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: vType === 'video',
            audio: true,
          });
        } catch (err) {
          console.warn('[Call] getUserMedia failed, using animated mock stream:', err);
          stream = createMockVideoStream();
        }

        localStreamRef.current = stream;
        // Attach immediately if the video element is already in the DOM
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        });
        pcRef.current = pc;
        setPeerConnectionState('new');

        pc.onconnectionstatechange = () => {
          setPeerConnectionState(pc.connectionState as PeerConnectionState);
        };

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteStreamRef.current = event.streams[0];
            // Attach immediately if video element is already in the DOM
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
              remoteVideoRef.current.play().catch(() => {});
            }
            setIsRemoteStreamActive(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('signal', {
              type: 'webrtc_ice',
              sender:   { id: selfIdRef.current,   name: selfNameRef.current },
              receiver: { id: partner.id, name: partner.name },
              data: { candidate: event.candidate },
            });
          }
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socket) {
            socket.emit('signal', {
              type: 'webrtc_offer',
              sender:   { id: selfIdRef.current,   name: selfNameRef.current },
              receiver: { id: partner.id, name: partner.name },
              data: { offer },
            });
          }
        }
        return pc;
      } catch (err) {
        console.warn('[Call] WebRTC Peer Connection initiation failed:', err);
        return null;
      }
    })();

    initializingPromiseRef.current = promise;
    try   { return await promise; }
    finally { initializingPromiseRef.current = null; }
  }, [socket]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const partner = activeCallPartnerRef.current;
      const pc = await initiateWebRTCPeer(false);
      if (!pc || !partner) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (socket) {
        socket.emit('signal', {
          type: 'webrtc_answer',
          sender:   { id: selfIdRef.current,   name: selfNameRef.current },
          receiver: { id: partner.id, name: partner.name },
          data: { answer },
        });
      }
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) =>
            console.warn('[Call] Failed to add queued ICE candidate:', e)
          );
        }
      }
    } catch (err) {
      console.warn('[Call] Offer handling failed:', err);
    }
  }, [initiateWebRTCPeer, socket]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        while (iceCandidatesQueueRef.current.length > 0) {
          const candidate = iceCandidatesQueueRef.current.shift();
          if (candidate) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) =>
              console.warn('[Call] Failed to add queued ICE candidate:', e)
            );
          }
        }
      }
    } catch (err) {
      console.warn('[Call] Answer handling failed:', err);
    }
  }, []);

  // ── Socket.IO signaling ───────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('click', () => {}, { once: true }); // unlock AudioContext

    if (!socket) { setIsConnected(false); return; }

    setIsConnected(socket.connected);

    const handleConnect = () => {
      setIsConnected(true);
      if (selfIdRef.current) {
        socket.emit('register', selfIdRef.current);
        socket.emit('query_pending_call', selfIdRef.current);
      }
    };
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect',    handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If socket is already connected when this effect runs
    if (socket.connected && selfIdRef.current) {
      socket.emit('register', selfIdRef.current);
      socket.emit('query_pending_call', selfIdRef.current);
    }

    const handleSignal = async (payload: any) => {
      if (!payload) return;
      const { type, sender, data } = payload;

      if (type === 'call_init') {
        callDirectionRef.current = 'incoming';
        callOutcomeRef.current   = 'missed'; // default until accepted/rejected
        callStartedAtRef.current = new Date().toISOString();
        if (callStateRef.current !== 'idle') {
          socket.emit('signal', {
            type: 'call_busy',
            sender:   { id: selfIdRef.current, name: selfNameRef.current },
            receiver: sender,
          });
          return;
        }
        const partner: CallParticipant = { id: sender.id, name: sender.name };
        const incomingType: CallType   = data.callType || 'video';
        savePendingRing(partner, incomingType);
        setCallType(incomingType);
        setActiveCallPartner(partner);
        setCallState('ringing');
        audioHelper.playRing();

      } else if (type === 'call_accept') {
        callOutcomeRef.current = 'completed';
        audioHelper.stop();
        clearPendingRing();
        setCallState('active');
        startTimer();
        // The acceptor creates the WebRTC offer — caller waits here for it
        await initiateWebRTCPeer(false);

      } else if (type === 'call_reject') {
        callOutcomeRef.current = 'declined';
        const partner = activeCallPartnerRef.current;
        endCallSession();
        showNotification('rejected', partner);

      } else if (type === 'call_hangup') {
        // If we were ringing (caller cancelled/timed out) → missed call, not completed
        const wasRinging = callStateRef.current === 'ringing';
        const missedPartner = activeCallPartnerRef.current || { id: sender.id, name: sender.name };
        if (!wasRinging) {
          callOutcomeRef.current = 'completed';
        }
        // else: outcome stays 'missed' (set at call_init time)
        endCallSession();
        if (wasRinging) {
          showNotification('missed', missedPartner);
        }

      } else if (type === 'call_busy') {
        callOutcomeRef.current = 'busy';
        const partner = activeCallPartnerRef.current;
        endCallSession();
        showNotification('busy', partner);

      } else if (type === 'webrtc_offer') {
        await handleOffer(data.offer);

      } else if (type === 'webrtc_answer') {
        await handleAnswer(data.answer);

      } else if (type === 'webrtc_ice') {
        if (data.candidate) {
          if (pcRef.current && pcRef.current.remoteDescription) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
              console.warn('[Call] ICE candidate error:', err);
            }
          } else {
            iceCandidatesQueueRef.current.push(data.candidate);
          }
        }
      } else if (type === 'call_request') {
        // Receive a formal call request from a lower-level official
        const newReq: CallRequest = {
          id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          from:          { id: sender.id, name: sender.name },
          purpose:       data?.purpose || '',
          scheduledTime: data?.scheduledTime || '',
          timestamp:     new Date().toISOString(),
        };
        setPendingCallRequests(prev => [newReq, ...prev]);

      } else if (type === 'call_video_toggle') {
        setIsRemoteVideoOff(!data.enabled);
      } else if (type === 'call_mute_toggle') {
        setIsRemoteMuted(!data.enabled);
      }
    };

    socket.on('signal', handleSignal);

    return () => {
      socket.off('connect',    handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('signal',     handleSignal);
      audioHelper.stop();
    };
  }, [socket, initiateWebRTCPeer, handleOffer, handleAnswer, endCallSession, showNotification]);

  // ── Public actions ────────────────────────────────────────────────────────

  const startCall = (partner: CallParticipant, type: CallType) => {
    const isLowerLevel  = selfId.includes('Director') || selfId.includes('Nodal') || selfId.includes('Officer');
    const isHigherLevel = partner.id === 'Chief Minister' || partner.id.includes('DM');
    if (isLowerLevel && isHigherLevel) { setPermissionModalPartner(partner); return; }

    // Track metadata for history
    callDirectionRef.current = 'outgoing';
    callOutcomeRef.current   = 'cancelled'; // default if never answered
    callStartedAtRef.current = new Date().toISOString();

    setCallType(type);
    setActiveCallPartner(partner);
    setCallState('dialing');
    audioHelper.playDial();

    if (socket) {
      socket.emit('signal', {
        type: 'call_init',
        sender:   { id: selfId, name: selfName },
        receiver: { id: partner.id, name: partner.name },
        data: { callType: type },
      });
    }

    setTimeout(() => {
      if (callStateRef.current === 'dialing') {
        // Notify callee that the call timed out (so they see a missed call)
        const timedOutPartner = activeCallPartnerRef.current;
        if (timedOutPartner && socket) {
          socket.emit('signal', {
            type: 'call_hangup',
            sender:   { id: selfIdRef.current,   name: selfNameRef.current },
            receiver: { id: timedOutPartner.id, name: timedOutPartner.name },
          });
        }
        endCallSession();
      }
    }, 30_000);
  };

  const acceptCall = () => {
    const partner = activeCallPartnerRef.current;
    if (!partner) return;
    callOutcomeRef.current = 'completed';
    audioHelper.stop();
    clearPendingRing();
    setCallState('active');
    startTimer();
    if (socket) {
      socket.emit('signal', {
        type: 'call_accept',
        sender:   { id: selfId, name: selfName },
        receiver: { id: partner.id, name: partner.name },
      });
    }
    // The acceptor is isCaller=true: they create the WebRTC offer
    initiateWebRTCPeer(true);
  };

  const rejectCall = () => {
    const partner = activeCallPartnerRef.current;
    callOutcomeRef.current = 'declined';
    audioHelper.stop();
    clearPendingRing();
    if (partner && socket) {
      socket.emit('signal', {
        type: 'call_reject',
        sender:   { id: selfId, name: selfName },
        receiver: { id: partner.id, name: partner.name },
      });
    }
    endCallSession();
  };

  const hangupCall = () => {
    const partner = activeCallPartnerRef.current;
    callOutcomeRef.current = 'completed';
    audioHelper.stop();
    clearPendingRing();
    clearActiveCall();
    if (partner && socket) {
      socket.emit('signal', {
        type: 'call_hangup',
        sender:   { id: selfId, name: selfName },
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
      const partner = activeCallPartnerRef.current;
      if (partner && socket) {
        socket.emit('signal', {
          type: 'call_mute_toggle',
          sender:   { id: selfId, name: selfName },
          receiver: { id: partner.id, name: partner.name },
          data: { enabled: track.enabled },
        });
      }
    }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
      const partner = activeCallPartnerRef.current;
      if (partner && socket) {
        socket.emit('signal', {
          type: 'call_video_toggle',
          sender:   { id: selfId, name: selfName },
          receiver: { id: partner.id, name: partner.name },
          data: { enabled: track.enabled },
        });
      }
    }
  };

  /** Send a formal call request to a superior. Returns true if socket is connected. */
  const sendCallRequest = (partner: CallParticipant, purpose: string, scheduledTime: string): boolean => {
    if (!socket || !socket.connected) return false;
    socket.emit('signal', {
      type: 'call_request',
      sender:   { id: selfId, name: selfName },
      receiver: { id: partner.id, name: partner.name },
      data: { purpose, scheduledTime },
    });
    console.log(`[Call] Sent call request to "${partner.id}" — Purpose: ${purpose}`);
    return true;
  };

  const dismissCallRequest = (id: string) => {
    setPendingCallRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <CallContext.Provider value={{
      callState, callType, activeCallPartner, callDuration,
      isMuted, isVideoOff, localVideoRef, remoteVideoRef, isConnected,
      startCall, acceptCall, rejectCall, hangupCall, toggleMute, toggleVideo,
      permissionModalPartner, setPermissionModalPartner,
      peerConnectionState, isRemoteVideoOff, isRemoteMuted, isRemoteStreamActive,
      callNotification, notificationPartner, dismissNotification,
      callHistory, clearCallHistory,
      pendingCallRequests,
      sendCallRequest,
      dismissCallRequest,
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
};
