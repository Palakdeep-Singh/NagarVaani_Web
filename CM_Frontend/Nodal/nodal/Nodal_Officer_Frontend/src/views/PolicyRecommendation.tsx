import React, { useState } from 'react';
import { Flag, Send } from 'lucide-react';

export const PolicyRecommendation: React.FC = () => {
  const [desc, setDesc] = useState('');

  return (
    <div className="page-shell fade-in max-w-2xl">
      <div className="section-lbl"><Flag size={18} className="text-indigo-600" /> Policy Recommendation Flag</div>
      <p className="text-sm text-slate-500 mb-6">Escalate systemic issues or policy gaps directly to upper management based on grievance patterns.</p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Issue Type</label>
          <select className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none">
            <option>Infrastructure Gap</option>
            <option>Process Bottleneck</option>
            <option>Staffing Shortage</option>
            <option>Legal/Jurisdiction Dispute</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description & Evidence</label>
          <textarea 
            rows={5} 
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" 
            placeholder="Describe the policy gap and cite relevant grievance IDs..."
          />
        </div>

        <button 
          onClick={() => {
            alert('Policy Recommendation submitted to Secretary office.');
            setDesc('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Send size={16} /> Submit to Management
        </button>
      </div>
    </div>
  );
};
