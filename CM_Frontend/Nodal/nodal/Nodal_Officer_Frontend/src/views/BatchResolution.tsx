import React from 'react';
import { useStore } from '../context/Store';
import { MOCK_BATCH_GROUPS } from '../data/mockData';
import { Layers, CheckCircle } from 'lucide-react';

export const BatchResolution: React.FC = () => {
  const { closeBatch } = useStore();

  return (
    <div className="page-shell fade-in">
      <div className="section-lbl"><Layers size={18} className="text-indigo-600" /> Batch Resolution</div>
      <p className="text-sm text-slate-500 mb-6">Resolve grouped grievances from the same locality simultaneously with a single field order.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_BATCH_GROUPS.map(batch => (
          <div key={batch.batchId} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
              <div>
                <div className="text-xs font-mono font-bold text-indigo-600 mb-1">{batch.batchId}</div>
                <div className="font-bold text-lg text-slate-800">{batch.category}</div>
                <div className="text-sm text-slate-500">{batch.locality}</div>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${batch.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                {batch.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Grouped Complaints ({batch.count})</div>
              <div className="flex flex-wrap gap-2">
                {batch.complaintIds.map(id => (
                  <span key={id} className="text-xs font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-600">{id}</span>
                ))}
              </div>
            </div>

            {batch.status === 'Open' ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-2">Issue Field Order for Entire Batch</div>
                <input type="text" placeholder="e.g. Work Order PWD-492 issued..." className="w-full text-sm p-2 border border-slate-300 rounded mb-2 focus:outline-none focus:border-indigo-500" id={`input-${batch.batchId}`} />
                <button 
                  onClick={() => {
                    const el = document.getElementById(`input-${batch.batchId}`) as HTMLInputElement;
                    if(el.value) closeBatch(batch.batchId, el.value);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors"
                >
                  Apply to {batch.count} complaints
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <CheckCircle size={16} />
                <span>Field order issued on {batch.fieldOrderIssued}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
