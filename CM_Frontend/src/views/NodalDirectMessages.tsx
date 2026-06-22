import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export const DirectMessages: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'DM Office', to: 'All Nodal Officers', time: '11:00 AM', body: 'Alert: Monsoon preparedness meeting at 4 PM today.', isMine: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedTo, setSelectedTo] = useState('DM Office');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'Nodal Officer',
      to: selectedTo,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: inputText,
      isMine: true
    }]);
    setInputText('');
  };

  return (
    <div className="page-shell fade-in flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <MessageSquare className="text-teal-600 w-5 h-5" />
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Secure Inbox & Requests</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6 shrink-0">
        Receive directives from the District Magistrate or raise requests for resource assistance.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0 flex-1">
        {/* Messages view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">
                {m.isMine ? `To: ${m.to}` : `From: ${m.sender}`} • {m.time}
              </div>
              <div className={`px-5 py-3 rounded-2xl max-w-[70%] text-sm ${m.isMine ? 'bg-teal-600 text-white rounded-br-sm shadow-md shadow-teal-900/10' : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'}`}>
                {m.body}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 shrink-0 rounded-b-xl">
          <div className="flex items-center gap-3">
            <select
              value={selectedTo}
              onChange={e => setSelectedTo(e.target.value)}
              className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-teal-500 shadow-sm"
            >
              <option>DM Office</option>
              <option>CM Monitoring Cell</option>
              <option>PWD Dept Head</option>
            </select>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type request or response here..."
              className="flex-1 bg-white border border-slate-300 text-sm rounded-lg px-4 py-2 outline-none focus:border-teal-500 shadow-sm"
            />
            <button
              onClick={handleSend}
              className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
