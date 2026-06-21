import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Bot, X, Send } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ChatbotProps {
  onClose?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const { complaints, officers, projects, files, showAIPanel, setShowAIPanel } = useStore();
  const handleClose = () => { setShowAIPanel(false); onClose?.(); };
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
          text: 'Namaste! I am your NagarVaani AI assistant powered by Groq. I have access to real-time complaints, department SLAs, projects, and officer details. How can I assist you today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showAIPanel]);

  useEffect(() => {
    setShowAIPanel(true);
    return () => setShowAIPanel(false);
  }, [setShowAIPanel]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: query, timestamp };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // ── Content safety filter check ──
    const containsAbuseOrSexual = (text: string) => {
      const blacklist = [
        'abuse', 'fuck', 'bitch', 'asshole', 'shit', 'bastard', 'cunt', 'dick', 'chutiya', 'madarchod', 'harami', 'saala',
        'sex', 'porn', 'naked', 'erotic', 'nude', 'penis', 'vagina', 'xxx', 'slut', 'whore', 'boobs', 'breast',
        'rape', 'orgasm', 'masturbate', 'ass'
      ];
      const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const words = normalized.split(/\s+/);
      return blacklist.some(word => words.includes(word));
    };

    if (containsAbuseOrSexual(query)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ **Security Policy Warning:** The NagarVaani administrative portal does not accept inappropriate, abusive, or sexually explicit content. Please ensure your query is limited to professional and administrative operations.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // 1. Prepare dynamic context for Groq
      const systemPrompt = `You are the NagarVaani CM Executive Assistant.
You have access to live Delhi Government administrative dashboard data:
- Total Complaints: ${complaints.length}
- Resolved: ${complaints.filter(c => c.status === 'Resolved').length}
- Active: ${complaints.filter(c => c.status === 'Active').length}
- Pending: ${complaints.filter(c => c.status === 'Pending').length}
- Escalated: ${complaints.filter(c => c.status === 'Escalated').length}
- High Priority (Emergency/High): ${complaints.filter(c => c.priority === 'Emergency' || c.priority === 'High').length}
- Monitored Projects: ${projects.length}
- Digital Files in circulation: ${files.length}
- Officers Database: ${JSON.stringify(officers.map(o => ({ name: o.name, role: o.designation, rating: o.rating, resolved: o.completedComplaints, pending: o.activeComplaints })))}

Recent Complaints Checklist:
${complaints.slice(0, 10).map(c => `* [${c.id}] ${c.title} (${c.category}, Status: ${c.status}, District: ${c.district})`).join('\n')}

Rules Guidelines:
- Keep your tone highly professional, administrative, and constructive.
- ABSOLUTELY refuse to respond to or generate any abusive, sexual, political, or offensive content, politely citing standard Government Secretariat guidelines.
- Cite Sevottam / DARPG / DOPT guidelines where relevant.
- Format responses cleanly using standard Markdown formatting (bold, bullet points).`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: query }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();
      const aiText = data.choices?.[0]?.message?.content || 'Excuse me, I encountered an issue retrieving that from the server. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Excuse me, I had trouble connecting to the Groq API. Please verify internet connection or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionPrompts = [
    'How many escalated tickets do we have?',
    'Give me a summary of officer performances',
    'Which complaints are past the DARPG SLA limit?',
    'Show me recent water category issues'
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
  };

  return (
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
                NagarVaani Assistant
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-550 font-medium">Groq Engine Active</span>
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
          {loading && (
            <div className="flex flex-col items-start animate-pulse">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-500">
                AI is analyzing dashboard parameters...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto shrink-0">
          {suggestionPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-xs text-indigo-650 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 px-3 py-1.5 rounded-full text-left transition-colors cursor-pointer shadow-sm disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about grievances, officers or SLAs..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-0 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer transition-colors border border-indigo-750 shrink-0 shadow-sm shadow-indigo-600/10 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
