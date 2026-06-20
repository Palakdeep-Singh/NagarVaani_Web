import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Bot, X, Send } from 'lucide-react';
import { formatINR } from '../utils/helper';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ChatbotProps {
  onClose?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const { complaints, files, officers, projects, showAIPanel, setShowAIPanel } = useStore();
  const handleClose = () => { setShowAIPanel(false); onClose?.(); };
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  
  const [width, setWidth] = useState<number>(384);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: 'Namaste! I am your Chat Assistant. I can query real-time complaints, audit tracking, officer ratings, and digital files. What would you like to check today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showAIPanel]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: query, timestamp };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    
    setTimeout(() => {
      let aiText = '';
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('file') || lowerQuery.includes('df-')) {
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
        const rankings = officers
          .filter(o => o.district)
          .map(o => {
            const distComplaints = complaints.filter(c => c.district === o.district);
            const active = distComplaints.filter(c => c.status !== 'Resolved').length;
            const total = distComplaints.length;
            const score = total > 0 ? Math.round(((total - active) / total) * 100) : 100;
            return { name: o.district!, score, active };
          })
          .sort((a, b) => a.score - b.score);

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
        aiText = `**Grievance Analytics Summary:**\n\nThere are currently **${complaints.filter(c => c.status !== 'Resolved').length} active grievances** across Delhi.\n\n* **Primary Source:** Waterlogging and Road maintenance contribute 45% of complaints.\n* **Priority:** 3 cases flagged as *Emergency* requiring Immediate field action.\n\nType **"district ranking"**, **"projects status"**, **"file DF-2026-302"**, or **"health"** for detailed status reporting.`;
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

  const parseMessageText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      const isBullet = line.startsWith('* ');
      const rawContent = isBullet ? line.substring(2) : line;

      
      const parts = rawContent.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lIdx} className="pl-4 py-0.5 relative before:content-['•'] before:absolute before:left-1 before:text-slate-400">
            {elements}
          </div>
        );
      }
      return (
        <p key={lIdx} className="mb-1.5 last:mb-0">
          {elements}
        </p>
      );
    });
  };  return (
    <>
            {showAIPanel && (
        <div
          className="fixed inset-0 bg-slate-900/35 z-35 md:hidden"
          onClick={handleClose}
        />
      )}

            <aside
        className={`bg-white flex flex-col z-40 shrink-0 h-full overflow-hidden fixed md:relative inset-y-0 right-0 border-l border-slate-200 ${
          isDragging ? 'transition-none' : 'transition-all duration-300'
        } ${
          showAIPanel
            ? 'translate-x-0 w-full shadow-xl md:shadow-none animate-in slide-in-from-right duration-300 md:translate-x-0'
            : 'translate-x-full md:translate-x-0 border-l-transparent pointer-events-none'
        }`}
        style={
          showAIPanel
            ? { width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${width}px` : undefined }
            : { width: typeof window !== 'undefined' && window.innerWidth >= 768 ? '0px' : undefined }
        }
      >
                {showAIPanel && (
          <div
            onMouseDown={startResizing}
            onDoubleClick={() => setWidth(384)}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/20 active:bg-indigo-500/30 transition-colors group z-50 flex items-center justify-center"
            title="Drag to resize panel (Double click to reset)"
          >
                        <div className="w-0.5 h-8 bg-slate-300 rounded group-hover:bg-indigo-500 group-active:bg-indigo-600 transition-colors" />
          </div>
        )}
        
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-white shrink-0 pl-7">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Chat Assistant
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium">Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-thin">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-indigo-50 text-indigo-950 border-indigo-100/80 rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {parseMessageText(msg.text)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto shrink-0">
          {suggestionPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs text-indigo-600 hover:text-indigo-855 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 px-3 py-1.5 rounded-full text-left transition-colors cursor-pointer shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about files, worst district, health..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-0 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer transition-colors border border-indigo-750 shrink-0 shadow-sm shadow-indigo-600/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
