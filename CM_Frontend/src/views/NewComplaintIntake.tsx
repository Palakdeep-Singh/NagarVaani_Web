import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { UserPlus, Save } from 'lucide-react';

export const NewComplaintIntake: React.FC = () => {
  const { addWalkInComplaint } = useStore();
  const [formData, setFormData] = useState({
    citizenName: '', citizenPhone: '', category: 'Civic Infrastructure', priority: 'Medium', ward: 'Ward 48', description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addWalkInComplaint(formData);
    alert(`Complaint recorded successfully. Reference ID: ${id}`);
    setFormData({ citizenName: '', citizenPhone: '', category: 'Civic Infrastructure', priority: 'Medium', ward: 'Ward 48', description: '' });
  };

  return (
    <div className="page-shell fade-in max-w-2xl">
      <div className="section-lbl"><UserPlus size={18} className="text-indigo-600" /> New Walk-In Complaint Intake</div>
      <p className="text-sm text-slate-500 mb-6">Register a grievance manually for citizens visiting the DM office.</p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Citizen Name</label>
              <input required value={formData.citizenName} onChange={e => setFormData({...formData, citizenName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number</label>
              <input required pattern="[0-9]{10}" value={formData.citizenPhone} onChange={e => setFormData({...formData, citizenPhone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none">
                <option>Civic Infrastructure</option><option>Water & Sewage</option><option>Electricity & Power</option>
                <option>Public Health</option><option>Education & Schools</option><option>Sanitation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none">
                <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ward</label>
            <input required value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" placeholder="e.g. Ward 48" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Grievance Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="pt-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm">
              <Save size={16} /> Register Grievance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
