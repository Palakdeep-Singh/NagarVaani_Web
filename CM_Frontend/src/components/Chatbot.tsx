import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Bot, X, Send, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/helper';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const Chatbot: React.FC = () => {
  const { complaints, files, officers, projects } = useStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize chatbot messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: 'Namaste! I am NagarVaani AI, your governance assistant. I can query real-time complaints, audit tracking, officer ratings, and digital files. What would you like to check today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: query, timestamp };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Process Response (AI simulated intelligence reading the state store context)
    setTimeout(() => {
      let aiText = '';
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('file') || lowerQuery.includes('df-')) {
        // Find matching file
        const fileMatch = files.find(f => 
          lowerQuery.includes(f.id.toLowerCase()) || 
          lowerQuery.includes(f.title.toLowerCase().split(' ')[0])
        ) || files[0];

        if (fileMatch) {
          aiText = `**File Tracking Report [${fileMatch.id}]**\n\n* **Title:** ${fileMatch.title}\n* **Department:** ${fileMatch.department}\n* **Status:** ${fileMatch.status}\n* **Current Location:** ${fileMatch.currentOwner} (Step ${fileMatch.currentStep + 1} of ${fileMatch.totalSteps})\n* **Priority:** ${fileMatch.priority}\n\n**Latest Action:** ${fileMatch.remarks[fileMatch.remarks.length - 1]?.text || 'No comments logged.'}`;
        } else {
          aiText = `Could not locate specific e-file records matching "${query}". Currently, there are ${files.length} active files in rotation.`;
        }
      } else if (lowerQuery.includes('worst district') || lowerQuery.includes('district rank') || lowerQuery.includes('ranking')) {
        // Calculate rankings
        const rankings = officers
          .filter(o => o.district)
          .map(o => {
            const distComplaints = complaints.filter(c => c.district === o.district);
            const active = distComplaints.filter(c => c.status !== 'Resolved').length;
            const total = distComplaints.length;
            const score = total > 0 ? Math.round(((total - active) / total) * 100) : 100;
            return { name: o.district!, score, active };
          })
          .sort((a, b) => a.score - b.score); // Ascending order to get worst first

        const worst = rankings[0];
        const best = rankings[rankings.length - 1];

        aiText = `**District Grievance Performance Ranking**\n\n* **Top Performing District:** ${best.name} (Resolution Score: ${best.score}%, Active: ${best.active})\n* **District Requiring Attention:** ${worst.name} (Resolution Score: ${worst.score}%, Active: ${worst.active} complaints)\n\nWe recommend requesting a status review from the DM of ${worst.name}.`;
      } else if (lowerQuery.includes('health') || lowerQuery.includes('hospital') || lowerQuery.includes('bed')) {
        const healthComplaints = complaints.filter(c => c.department.includes('Health') || c.category === 'Public Health');
        const activeHealth = healthComplaints.filter(c => c.status !== 'Resolved').length;
        aiText = `**Health & Family Welfare Grievance Overview:**\n\n* **Total Intake:** ${healthComplaints.length} grievances filed this month.\n* **Active Cases:** ${activeHealth} pending resolution.\n* **Critical Area:** ${healthComplaints.find(c => c.priority === 'Emergency')?.title || 'No active emergencies'}.\n\nCurrently, PWD is coordinating with the Health Directorate to audit Mohalla Clinic pharmacy stocks.`;
      } else if (lowerQuery.includes('project') || lowerQuery.includes('infrastructure') || lowerQuery.includes('progress')) {
        const delayed = projects.filter(p => p.status === 'Delayed' || p.status === 'Critical');
        const listStr = delayed.map(p => `* **${p.title}** (${p.physicalProgress}% complete, status: ${p.status})`).join('\n');
        
        aiText = `**Delhi Major Project Infrastructure Audit:**\n\n* **Total Monitored Projects:** ${projects.length}\n* **Capital Allocation:** ${formatINR(projects.reduce((acc, curr) => acc + curr.budgetAllocated, 0))}\n\n**Delayed/Critical Pipelines:**\n${listStr || '* All projects are currently on track.'}`;
      } else if (lowerQuery.includes('officer') || lowerQuery.includes('accountability') || lowerQuery.includes('rating')) {
        const poorOfficers = [...officers].sort((a, b) => a.rating - b.rating).slice(0, 2);
        const bestOfficers = [...officers].sort((a, b) => b.rating - a.rating).slice(0, 2);
        
        aiText = `**Officer SLA Accountability Check:**\n\n* **Highest Rated Officer:** ${bestOfficers[0].name} (${bestOfficers[0].designation}, Rating: ${bestOfficers[0].rating}/5)\n* **Lowest Rated Officer:** ${poorOfficers[0].name} (${poorOfficers[0].designation}, Rating: ${poorOfficers[0].rating}/5, Avg resolution time: ${poorOfficers[0].avgResolutionTime} days)\n\nSLAs breached this week: **12 items**. Central administrative services have flagged ${poorOfficers[0].name} for delay explanation.`;
      } else {
        aiText = `**Grievance Analytics Summary:**\n\nThere are currently **${complaints.filter(c => c.status !== 'Resolved').length} active grievances** across Delhi.\n\n* **Primary Source:** Waterlogging and Road maintenance contribute 45% of complaints.\n* **Priority:** 3 cases flagged as *Emergency* requiring Immediate field action.\n\nType **"district ranking"**, **"projects status"**, **"file DF-2026-302"**, or **"health"** for targeted intelligence reporting.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  const suggestionPrompts = [
    'Track file DF-2026-302',
    'Which district has the worst rating?',
    'Report on health and hospital beds',
    'Audit delayed major projects'
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-50 group border border-white/20"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 text-[10px] font-bold text-white items-center justify-center">AI</span>
        </span>
      </button>

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[90vw] h-[580px] rounded-2xl glass-panel shadow-2xl border border-indigo-500/20 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-4 border-b border-indigo-500/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/35">
                <Bot className="h-5.5 w-5.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  NagarVaani Copilot
                  <Sparkles className="h-3.5 w-3.5 text-teal-400 fill-teal-400 animate-pulse" />
                </h4>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Gov-NLP engine</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/60 scrollbar-thin">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md font-medium'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800/80 rounded-tl-none font-normal'
                  } whitespace-pre-line`}
                >
                  {/* Handle simple markdown render in bot reply */}
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('* ')) {
                      return <div key={lIdx} className="pl-3 py-0.5 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-400">{line.substring(2)}</div>;
                    }
                    return <p key={lIdx} className="mb-1">{line}</p>;
                  })}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-semibold">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-900 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
            {suggestionPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 px-2 py-1 rounded-full text-left transition-all hover:scale-[1.02]"
              >
                <HelpCircle className="h-3 w-3 text-teal-400 shrink-0" />
                {p}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about files, worst district, health..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
