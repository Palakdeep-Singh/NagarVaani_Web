import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { MessageSquare, Send, Phone, Video } from 'lucide-react';
import { useCall } from '../context/CallContext';
import { getRoleLabel } from '../utils/helper';

export const Comm: React.FC = () => {
  const { messages, addMessage, officers, currentUser } = useStore();
  const { startCall, callState, activeCallPartner } = useCall();

  
  const [chatInput, setChatInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('Chief Minister');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    addMessage(chatInput, selectedContact);
    setChatInput('');
  };

  
  const userRoleLabel = getRoleLabel(currentUser);

  const getOfficerRoleLabel = (off: any): string => {
    if (off.designation === 'District Magistrate') return `${off.district} DM`;
    if (off.designation === 'Director Health Services' || off.department === 'Health & Family Welfare' || off.department === 'Public Health') return 'Director Health Services';
    if (off.designation === 'Director of Education' || off.department === 'Education Department' || off.department === 'Education & Schools') return 'Director of Education';
    if (off.designation === 'Chief Engineer' || off.department === 'PWD & Infrastructure') return 'Chief Engineer';
    return off.designation;
  };

  const getOfficerDisplayName = (off: any): string => {
    if (off.designation === 'District Magistrate') return `${off.name} (${off.district} DM)`;
    if (off.designation === 'Director Health Services' || off.department === 'Health & Family Welfare' || off.department === 'Public Health') return `${off.name} (Director Health)`;
    if (off.designation === 'Director of Education' || off.department === 'Education Department' || off.department === 'Education & Schools') return `${off.name} (Director Education)`;
    if (off.designation === 'Chief Engineer' || off.department === 'PWD & Infrastructure') return `${off.name} (Chief Engineer PWD)`;
    return `${off.name} (${off.designation})`;
  };

  const contactList = [
    ...(userRoleLabel !== 'Chief Minister' ? [{ role: 'Chief Minister', name: 'Office of Chief Minister' }] : []),
    ...officers.map(off => ({
      role: getOfficerRoleLabel(off),
      name: getOfficerDisplayName(off)
    }))
  ].filter((c, index, self) => 
    c.role !== userRoleLabel && 
    self.findIndex(t => t.role === c.role) === index
  );


  
  const threadMessages = messages.filter(
    m => (m.senderRole === userRoleLabel && m.receiverRole === selectedContact) ||
         (m.senderRole === selectedContact && m.receiverRole === userRoleLabel)
  );

  return (
    <div className="space-y-6">
      
            <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          NagarVaani Internal Messenger
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Secure encrypted communications suite connecting ministries, departments, and district officers.
        </p>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4 flex flex-col h-[280px] md:h-[560px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Directory Roster
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {contactList.map(contact => {
              const isSelected = selectedContact === contact.role;
              return (
                <button
                  key={contact.role}
                  onClick={() => setSelectedContact(contact.role)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                      : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-100 text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-xs border ${
                    isSelected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}>
                    {contact.name[0]}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-800">{contact.name}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase mt-0.5 tracking-wider">{contact.role}</div>
                  </div>
                  {activeCallPartner?.id === contact.role && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="On call" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

                <div className="md:col-span-2 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col h-[400px] md:h-[560px] overflow-hidden">
          
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-xs text-indigo-700 border border-indigo-200">
                {selectedContact[0]}
              </div>
              <div className="leading-none">
                <h4 className="text-xs font-bold text-slate-800">Active Thread: {selectedContact}</h4>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1 block">
                  Secure encrypted government channel
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startCall({ id: selectedContact, name: selectedContact }, 'audio')}
                disabled={callState !== 'idle'}
                title="Start audio call"
                className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => startCall({ id: selectedContact, name: selectedContact }, 'video')}
                disabled={callState !== 'idle'}
                title="Start video call"
                className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Video className="h-4 w-4" />
              </button>
            </div>
          </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
            {threadMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
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
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed border ${
                        isSentByMe
                          ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none font-medium'
                          : 'bg-white text-slate-800 border-slate-200 rounded-tl-none font-medium shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 px-1 font-semibold">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>

                    <form onSubmit={handleSendChat} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Send message as ${userRoleLabel}...`}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-md shadow-indigo-600/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
