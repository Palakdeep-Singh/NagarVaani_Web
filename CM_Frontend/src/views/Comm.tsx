import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { MessageSquare, Send } from 'lucide-react';

export const Comm: React.FC = () => {
  const { messages, addMessage, activeRole, activeDistrict, activeDepartment } = useStore();

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('Chief Minister');

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
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          NagarVaani Internal Messenger
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Secure encrypted communications suite connecting ministries, departments, and district officers.
        </p>
      </div>

      {/* INTERNAL MESSAGING VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
        {/* Contacts Directory */}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col h-[400px] md:h-[560px] overflow-hidden">
          
          {/* Header info */}
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
          </div>

          {/* Message Thread */}
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

          {/* Input Send Bar */}
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
