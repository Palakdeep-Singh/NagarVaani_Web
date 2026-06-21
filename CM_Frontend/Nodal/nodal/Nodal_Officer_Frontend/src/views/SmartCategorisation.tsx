import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Brain, CheckCircle, XCircle } from 'lucide-react';

export const SmartCategorisation: React.FC = () => {
  const { complaints, confirmAICategory } = useStore();
  const unverified = complaints.filter(c => c.aiSuggestedCategory && c.aiSuggestedCategory !== c.category && c.status === 'Pending');

  // Let's just mock the unverified logic. For this demo, any complaint with aiSuggestedSubCategory that hasn't been confirmed
  // We'll consider it unverified if `subCategory` is missing but `aiSuggestedSubCategory` is present.
  const pendingVerification = complaints.filter(c => !c.subCategory && c.aiSuggestedSubCategory);

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Brain size={18} className="text-indigo-600" /> Smart Categorisation Queue</div>
      <p className="text-sm text-slate-500 mb-6">Verify AI-suggested categories before they are routed to departments. Verification prevents false data reporting to upper authorities.</p>

      {pendingVerification.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500">All incoming complaints have been categorized and verified.</div>
      ) : (
        <div className="space-y-4">
          {pendingVerification.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs font-mono text-indigo-500">{c.id}</div>
                  <div className="font-bold text-slate-900 text-base">{c.title}</div>
                  <p className="text-sm text-slate-600 mt-1">{c.description}</p>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">AI Suggestion</div>
                  <div className="text-sm text-indigo-900 font-medium">{c.aiSuggestedCategory} &gt; {c.aiSuggestedSubCategory}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmAICategory(c.id, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <CheckCircle size={14} /> Verify & Accept
                  </button>
                  <button
                    onClick={() => {
                      const override = prompt('Enter manual sub-category:');
                      if (override) confirmAICategory(c.id, false, override);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <XCircle size={14} /> Override
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
