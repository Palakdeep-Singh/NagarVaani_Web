import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  Users, ClipboardList, CheckSquare, Map, Landmark, BarChart3,
  UserPlus, Upload, ShieldAlert, Award, TrendingUp, Download,
  RefreshCw, FileText, CheckCircle2, AlertTriangle, Play, HelpCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

// Sub-tabs list matching the screenshot
type SubTab =
  | 'Overview'
  | 'Complaints'
  | 'Milestones & Documents'
  | 'District View'
  | 'Booth Analyser'
  | 'Fund Predictor'
  | 'Manage Admins'
  | 'Officer CSV Import';

export const CitizenDashboard: React.FC = () => {
  const { complaints } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');

  // Local state for interactive features
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [uploadedCsv, setUploadedCsv] = useState<string | null>(null);

  // Mock data for charts & stats matching the screenshot
  const fundData = [
    { name: 'Jan', actual: 1.2, predicted: 1.2 },
    { name: 'Feb', actual: 1.8, predicted: 1.8 },
    { name: 'Mar', actual: 2.5, predicted: 2.4 },
    { name: 'Apr', actual: 3.1, predicted: 3.0 },
    { name: 'May', actual: 0, predicted: 3.6 },
    { name: 'Jun', actual: 0, predicted: 4.2 },
    { name: 'Jul', actual: 0, predicted: 4.8 },
  ];

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  const renderSidebar = () => {
    const items = [
      { id: 'Overview', label: 'Overview', icon: BarChart3 },
      { id: 'Complaints', label: 'Complaints', icon: ClipboardList },
      { id: 'Milestones & Documents', label: 'Milestones & Documents', icon: CheckSquare },
      { id: 'District View', label: 'District View', icon: Map },
      { id: 'Booth Analyser', label: 'Booth Analyser', icon: Landmark },
      { id: 'Fund Predictor', label: 'Fund Predictor', icon: Award },
      { id: 'Manage Admins', label: 'Manage Admins', icon: UserPlus },
      { id: 'Officer CSV Import', label: 'Officer CSV Import', icon: Upload },
    ];

    return (
      <div className="w-64 bg-[#0a192f] text-white flex flex-col justify-between shrink-0 border-r border-[#1a2d42]">
        <div>
          <div className="p-6 border-b border-[#1e2d3d] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">
              NV
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide">NAGARVAANI</div>
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Citizen Portal</div>
            </div>
          </div>

          <div className="p-4">
            <div className="text-[10px] font-bold text-slate-450 uppercase tracking-widest px-3 mb-3">
              All India
            </div>
            <div className="space-y-1">
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activeSubTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSubTab(item.id as SubTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#1e2d3d] bg-[#0c1e36]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              SA
            </div>
            <div>
              <div className="text-xs font-bold">Super Admin</div>
              <div className="text-[9px] text-slate-400 font-semibold">National Scope</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Registered Citizens', value: '1,245', sub: 'Nationwide', accent: 'blue', delta: 12 },
            { label: 'Active Applications', value: '84', sub: 'Pending verification', accent: 'amber', delta: 5 },
            { label: 'Benefit Delivery Rate', value: '94.2%', sub: 'Scheme completion rate', accent: 'green', delta: 2 },
            { label: 'Funds Disbursed (FY25)', value: '₹4.8 Cr', sub: 'Direct Benefit Transfers', accent: 'indigo', delta: 8 },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  card.accent === 'blue'
                    ? 'bg-blue-500'
                    : card.accent === 'amber'
                    ? 'bg-amber-500'
                    : card.accent === 'green'
                    ? 'bg-green-500'
                    : 'bg-indigo-500'
                }`}
              />
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {card.label}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  ▲ {card.delta}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="text-slate-500 text-[10px] font-medium mt-1">
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Chart and Side Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Monthly Fund Disbursement
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Historical actuals vs AI-predicted quarters. Values in ₹ Crore.
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-650">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> Actual
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Predicted
                </span>
              </div>
            </div>

            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fundData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            {/* Performance Card */}
            <div className="bg-gradient-to-br from-[#0c1e36] to-[#1e3a6b] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  National Performance Index
                </div>
                <div className="text-3xl font-extrabold tracking-tight mb-2">91.4%</div>
                <div className="w-full bg-slate-750 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[91.4%]" />
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-emerald-400">✓ 842 Resolved</span>
                <span className="text-slate-400">Target: 92%</span>
              </div>
            </div>

            {/* Quick Indicators */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4">
                Quick Indicators
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Open Complaints', value: '14', color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Active Schemes', value: '124', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Enrolled Citizens', value: '1,045', color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Eligible Citizens', value: '2,480', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((ind, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-xs font-semibold text-slate-655">{ind.label}</span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${ind.color} ${ind.bg}`}
                    >
                      {ind.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComplaints = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight mb-4">
            Active Citizen Complaints Register
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="pb-3">Ticket No</th>
                  <th className="pb-3">Grievance Description</th>
                  <th className="pb-3">Filed By</th>
                  <th className="pb-3">District</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                {[
                  { id: 'GRV-2026-001', desc: 'Waterlogging at Ring Road Lajpat Nagar', name: 'Amit Sharma', district: 'South Delhi', status: 'Active' },
                  { id: 'GRV-2026-002', desc: 'Medicine shortage at GTB Hospital', name: 'Priya Mehra', district: 'Shahdara', status: 'Escalated' },
                  { id: 'GRV-2026-003', desc: 'Smartboards defunct in SK Vidyalaya', name: 'Rajesh Kumar', district: 'North West', status: 'Pending' },
                ].map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-4 font-bold text-slate-800">{c.desc}</td>
                    <td className="py-4">{c.name}</td>
                    <td className="py-4">{c.district}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : c.status === 'Escalated'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collapsible Audit Accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center justify-between">
              <span>📁 Resolved Complaint Log (Audit Trail)</span>
              <span className="text-xs text-indigo-600 font-bold">128 Complaints Audited</span>
            </h3>
          </div>
          <div className="p-6">
            <p className="text-xs text-slate-500 font-medium">
              ECI and administrative audits require all closed complaints to be logged for historical compliance under the IT Act, 2000.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderMilestones = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Milestones & Documents Intake queue
          </h3>
          <p className="text-xs text-slate-550 mt-1">
            Verify citizen welfare document lock status and disburse Direct Benefit Transfers (DBT) accordingly.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { citizen: 'Rahul Kumar', scheme: 'CM Widow Pension Scheme', doc: 'Income Certificate', status: 'Awaiting Review' },
            { citizen: 'Sunita Devi', scheme: 'Delhi Ladli Scheme', doc: 'Birth Certificate', status: 'Awaiting Review' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{item.citizen}</span>
                <span className="text-xs text-slate-500">{item.scheme} · {item.doc}</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
                  Verify & Disburse
                </button>
                <button className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDistrictView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
              District Grievance Oversight
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Complaints status breakdown per jurisdictional district of NCT Delhi.
            </p>
          </div>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700"
          >
            <option>All Districts</option>
            <option>New Delhi</option>
            <option>South Delhi</option>
            <option>North Delhi</option>
            <option>Shahdara</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { district: 'New Delhi', active: 12, resolved: 240, rate: '95.2%' },
            { district: 'South Delhi', active: 28, resolved: 280, rate: '90.9%' },
            { district: 'Shahdara', active: 62, resolved: 125, rate: '66.8%' },
          ].map(d => (
            <div key={d.district} className="p-4 bg-slate-50 rounded-xl border border-slate-150">
              <span className="font-extrabold text-slate-900 text-sm block mb-3">{d.district}</span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Active Grievances</span>
                  <span className="font-bold text-slate-900">{d.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved Issues</span>
                  <span className="font-bold text-slate-900">{d.resolved}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
                  <span className="font-semibold text-slate-800">Resolution Rate</span>
                  <span className="font-extrabold text-indigo-600">{d.rate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBoothAnalyser = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Booth Analyser & Scheme Density
          </h3>
          <p className="text-xs text-slate-550 mt-1">
            Granular polling station and booth-level scheme distribution audit console.
          </p>
        </div>

        <div className="p-12 border border-dashed border-slate-250 rounded-2xl text-center">
          <Landmark className="mx-auto text-indigo-600 mb-3" size={32} />
          <span className="font-bold text-slate-900 text-sm block mb-1">
            Ready to Run Density Mapping
          </span>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Compare target demographics with active voter ID records to detect scheme coverage gaps.
          </p>
          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
            Generate Analysis Map
          </button>
        </div>
      </div>
    );
  };

  const renderFundPredictor = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Fund Predictor (AI Treasury Modeller)
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Predict financial requirements based on demographic trends and historical DBT claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Simulation Variables
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Target Quarter
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white">
                  <option>Q2 FY26 (Jul - Sep)</option>
                  <option>Q3 FY26 (Oct - Dec)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Projected Citizen Enrollment Trend
                </label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white">
                  <option>Moderate Growth (+5%)</option>
                  <option>High Growth (+15%)</option>
                </select>
              </div>
            </div>
            <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
              Run Forecast Model
            </button>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3">
                Projected Disbursement
              </span>
              <div className="text-3xl font-extrabold text-indigo-600 tracking-tight mb-1">
                ₹5.14 Cr
              </div>
              <p className="text-xs text-slate-550 leading-relaxed font-medium">
                AI model predicts ₹5.14 Cr will be disbursed in Q2 FY26 with a confidence level of 96.4%.
              </p>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-3 border-t border-slate-200">
              Confidence level: High
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManageAdmins = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Manage System Admins & Roles
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Grant permission settings for national level and state level system administrators.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Dr. Shalini Gupta', role: 'Director Health Services', level: 'State level' },
            { name: 'Shri Himanshu Gupta', role: 'Director of Education', level: 'State level' },
          ].map((admin, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 text-xs block">{admin.name}</span>
                <span className="text-[10px] text-slate-500">{admin.role} · {admin.level}</span>
              </div>
              <button className="px-3 py-1 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                Configure Permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOfficerCsvImport = () => {
    const handleCsvSimulate = () => {
      setUploadedCsv('Simulated_Officers_NagarVaani_Upload_2026.csv');
      alert('CSV file simulated and parsed successfully! 14 new officers imported.');
    };

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Bulk Officer CSV Import
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Upload CSV file to provision officer accounts and assign district mapping in bulk.
          </p>
        </div>

        <div className="p-12 border border-dashed border-slate-250 rounded-2xl text-center">
          <Upload className="mx-auto text-indigo-650 mb-3 animate-bounce" size={28} />
          <span className="font-bold text-slate-900 text-sm block mb-1">
            Simulate CSV Upload
          </span>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Upload file with headers: Name, Designation, District, Department, Email.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCsvSimulate}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Simulate Upload File
            </button>
            {uploadedCsv && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-green-150">
                ✓ {uploadedCsv}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[680px]">
      {renderSidebar()}

      <div className="flex-1 p-8 overflow-y-auto space-y-6">
        {/* View Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">
              Admin › {activeSubTab}
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {activeSubTab === 'Overview' ? 'National Dashboard' : activeSubTab}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Super Admin (Bypassed) · Viewing all states and union territories
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleForceSync}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Force Sync'}
            </button>
          </div>
        </div>

        {/* View Content Switcher */}
        {activeSubTab === 'Overview' && renderOverview()}
        {activeSubTab === 'Complaints' && renderComplaints()}
        {activeSubTab === 'Milestones & Documents' && renderMilestones()}
        {activeSubTab === 'District View' && renderDistrictView()}
        {activeSubTab === 'Booth Analyser' && renderBoothAnalyser()}
        {activeSubTab === 'Fund Predictor' && renderFundPredictor()}
        {activeSubTab === 'Manage Admins' && renderManageAdmins()}
        {activeSubTab === 'Officer CSV Import' && renderOfficerCsvImport()}
      </div>
    </div>
  );
};
