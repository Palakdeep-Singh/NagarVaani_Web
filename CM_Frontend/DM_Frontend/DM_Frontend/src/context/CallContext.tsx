import React, { createContext, useContext, useState, useEffect } from 'react';

type CallState = 'idle' | 'dialing' | 'ringing' | 'connected';

interface Contact { id: string; name: string; }

interface CallContextType {
  callState: CallState;
  activeCallPartner: Contact | null;
  isConnected: boolean;
  startCall: (contact: Contact, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType>({} as CallContextType);

export const useCall = () => useContext(CallContext);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [activeCallPartner, setActiveCallPartner] = useState<Contact | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const startCall = (contact: Contact, type: 'audio' | 'video') => {
    setActiveCallPartner(contact);
    setCallState('dialing');
    setTimeout(() => {
      setCallState('connected');
    }, 2000);
  };

  const acceptCall = () => {
    setCallState('connected');
  };

  const endCall = () => {
    setCallState('idle');
    setActiveCallPartner(null);
  };

  return (
    <CallContext.Provider value={{ callState, activeCallPartner, isConnected, startCall, acceptCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
};
