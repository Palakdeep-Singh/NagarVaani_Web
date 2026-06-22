import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/Store';
import { Landmark, Upload, RefreshCw, FileText, CheckCircle, XCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';
import type { DistrictName } from '../types';

type SubTab =
  | 'Overview'
  | 'Complaints'
  | 'Milestones & Documents'
  | 'District View'
  | 'Booth Analyser'
  | 'Fund Predictor'
  | 'Manage Admins'
  | 'Officer CSV Import';

export const CitizenDashboard: React.FC<{ subTab: SubTab }> = ({ subTab }) => {
  const { complaints, generalMetrics, welfareApps, updateWelfareStatus, officers, bulkImportOfficers } = useStore();

  // Local state
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  // CSV import state
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: string[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Welfare action state (optimistic per-item loading)
  const [welfareLoading, setWelfareLoading] = useState<Record<string, boolean>>({});

  // Derive values from DB metrics
  const registeredCitizens = generalMetrics['citizen_registered_count']
    ? Number(generalMetrics['citizen_registered_count']).toLocaleString('en-IN')
    : '—';
  const activeApplications = generalMetrics['active_applications_count'] || '—';
  const benefitDeliveryRate = generalMetrics['benefit_delivery_rate']
    ? `${generalMetrics['benefit_delivery_rate']}%`
    : '—';
  const fundsDisbursed = generalMetrics['funds_disbursed_fy25']
    ? `₹${generalMetrics['funds_disbursed_fy25']} Cr`
    : '—';
  const nationalPerfIndex = generalMetrics['national_performance_index']
    ? `${generalMetrics['national_performance_index']}%`
    : '—';
  const totalResolvedComplaints = generalMetrics['total_resolved_complaints'] || '0';
  const perfTarget = generalMetrics['performance_target_pct'] || '92';
  const activeSchemes = generalMetrics['active_schemes_count'] || '—';
  const enrolledCitizens = generalMetrics['enrolled_citizens']
    ? Number(generalMetrics['enrolled_citizens']).toLocaleString('en-IN')
    : '—';
  const eligibleCitizens = generalMetrics['eligible_citizens']
    ? Number(generalMetrics['eligible_citizens']).toLocaleString('en-IN')
    : '—';

  // Fund chart data from DB or fallback
  const fundData = useMemo(() => {
    if (generalMetrics['fund_chart_data']) {
      try {
        return JSON.parse(generalMetrics['fund_chart_data']);
      } catch {
        // fall through to default
      }
    }
    return [
      { name: 'Jan', actual: 0, predicted: 0 },
    ];
  }, [generalMetrics]);

  // Dynamic calculations from live complaints
  const openComplaintsCount = useMemo(() => {
    return complaints.filter(c => c.status !== 'Resolved').length;
  }, [complaints]);

  // District View dynamic data
  const districtData = useMemo(() => {
    const districtsList: DistrictName[] = [
      'New Delhi', 'South Delhi', 'Shahdara', 'West Delhi', 'North East Delhi',
      'East Delhi', 'Central Delhi', 'North West Delhi', 'North Delhi',
      'South East Delhi', 'South West Delhi'
    ];
    return districtsList.map(dist => {
      const distComplaints = complaints.filter(c => c.district === dist);
      const active = distComplaints.filter(c => c.status !== 'Resolved').length;
      const resolved = distComplaints.filter(c => c.status === 'Resolved').length;
      const total = distComplaints.length;
      const rate = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '100%';
      return { district: dist, active, resolved, rate };
    });
  }, [complaints]);

  // State-level admins (officers without a district)
  const stateAdmins = useMemo(() => {
    return officers.filter(o => !o.district);
  }, [officers]);

  const handleWelfareAction = async (id: string, action: 'Approved' | 'Rejected') => {
    setWelfareLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateWelfareStatus(id, action);
    } catch {
      // error handled in store
    } finally {
      setWelfareLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  // CSV file upload and parse
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setImportStatus('loading');
    setImportResult(null);
    setImportError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.map(row => {
          // Normalize headers to Title Case
          const normalized: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            normalized[key.trim()] = row[key]?.trim() || '';
          }
          return {
            Name: normalized['Name'] || normalized['name'] || '',
            Designation: normalized['Designation'] || normalized['designation'] || '',
            Department: normalized['Department'] || normalized['department'] || '',
            District: normalized['District'] || normalized['district'] || undefined,
          };
        });

        try {
          const result = await bulkImportOfficers(rows);
          setImportResult(result);
          setImportStatus('success');
        } catch (err: any) {
          setImportError(err?.response?.data?.error || 'Import failed. Check the server.');
          setImportStatus('error');
        }
      },
      error: (err) => {
        setImportError(`CSV parse error: ${err.message}`);
        setImportStatus('error');
      }
    });

    // Reset file input so same file can be re-uploaded
    e.target.value = '';
  };

  // ── Renderers ──────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Registered Citizens', value: registeredCitizens, sub: 'Nationwide', accent: 'blue', delta: 12 },
          { label: 'Active Applications', value: activeApplications, sub: 'Pending verification', accent: 'amber', delta: 5 },
          { label: 'Benefit Delivery Rate', value: benefitDeliveryRate, sub: 'Scheme completion rate', accent: 'green', delta: 2 },
          { label: 'Funds Disbursed (FY25)', value: fundsDisbursed, sub: 'Direct Benefit Transfers', accent: 'indigo', delta: 8 },
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
            <div className="text-slate-500 text-[10px] font-medium mt-1">{card.sub}</div>
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
                <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" />
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
              <div className="text-3xl font-extrabold tracking-tight mb-2">{nationalPerfIndex}</div>
              <div className="w-full bg-slate-750 rounded-full h-1.5 mb-4 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full"
                  style={{ width: nationalPerfIndex }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-emerald-400">✓ {Number(totalResolvedComplaints).toLocaleString('en-IN')} Resolved</span>
              <span className="text-slate-400">Target: {perfTarget}%</span>
            </div>
          </div>

          {/* Quick Indicators */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4">
              Quick Indicators
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Open Complaints', value: String(openComplaintsCount), color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Active Schemes', value: activeSchemes, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Enrolled Citizens', value: enrolledCitizens, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Eligible Citizens', value: eligibleCitizens, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((ind, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-xs font-semibold text-slate-655">{ind.label}</span>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${ind.color} ${ind.bg}`}>
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

  const renderComplaints = () => (
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
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-900">{c.id}</td>
                  <td className="py-4 font-bold text-slate-800">{c.title}</td>
                  <td className="py-4">{c.citizenName}</td>
                  <td className="py-4">{c.district}</td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : c.status === 'Escalated'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : c.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center justify-between">
            <span>📁 Resolved Complaint Log (Audit Trail)</span>
            <span className="text-xs text-indigo-600 font-bold">
              {complaints.filter(c => c.status === 'Resolved').length} Complaints Audited
            </span>
          </h3>
        </div>
        <div className="p-6">
          <p className="text-xs text-slate-550 font-medium">
            ECI and administrative audits require all closed complaints to be logged for historical compliance under the IT Act, 2000.
          </p>
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => {
    const pendingWelfare = welfareApps.filter(w => w.status === 'Pending');
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
            Milestones & Documents Intake Queue
          </h3>
          <p className="text-xs text-slate-550 mt-1">
            Verify citizen welfare document lock status and disburse Direct Benefit Transfers (DBT) accordingly.
          </p>
        </div>

        <div className="space-y-4">
          {pendingWelfare.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8 bg-slate-50 border border-dashed rounded-xl">
              No pending welfare documents to review.
            </div>
          ) : (
            pendingWelfare.map(item => (
              <div key={item._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{item.citizen}</span>
                  <span className="text-xs text-slate-550">{item.scheme} · {item.doc}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={welfareLoading[item._id]}
                    onClick={() => handleWelfareAction(item._id, 'Approved')}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {welfareLoading[item._id] ? 'Processing...' : 'Verify & Disburse'}
                  </button>
                  <button
                    disabled={welfareLoading[item._id]}
                    onClick={() => handleWelfareAction(item._id, 'Rejected')}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show approved/rejected too */}
        {welfareApps.filter(w => w.status !== 'Pending').length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Processed Applications</h4>
            <div className="space-y-2">
              {welfareApps.filter(w => w.status !== 'Pending').map(item => (
                <div key={item._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{item.citizen}</span>
                    <span className="text-[10px] text-slate-500">{item.scheme}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDistrictView = () => {
    const filteredDistrictData = districtData.filter(d => {
      if (selectedDistrict === 'All Districts' || selectedDistrict === 'All') return true;
      return d.district === selectedDistrict;
    });

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
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-none"
          >
            <option value="All Districts">All Districts</option>
            {districtData.map(d => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDistrictData.map(d => (
            <div key={d.district} className="p-4 bg-slate-50 rounded-xl border border-slate-150 shadow-sm">
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

  const renderBoothAnalyser = () => (
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
        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
          Generate Analysis Map
        </button>
      </div>
    </div>
  );

  const renderFundPredictor = () => (
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
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none">
                <option>Q2 FY26 (Jul - Sep)</option>
                <option>Q3 FY26 (Oct - Dec)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                Projected Citizen Enrollment Trend
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none">
                <option>Moderate Growth (+5%)</option>
                <option>High Growth (+15%)</option>
              </select>
            </div>
          </div>
          <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
            Run Forecast Model
          </button>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3">
              Projected Disbursement
            </span>
            {/* Dynamic: derive projected Q2 from last predicted data point */}
            <div className="text-3xl font-extrabold text-indigo-600 tracking-tight mb-1">
              ₹{fundData.find((d: any) => d.name === 'Jun')?.predicted?.toFixed(2) || '—'} Cr
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-medium">
              AI model estimates disbursement for Q2 FY26 based on the current monthly trend trajectory.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-3 border-t border-slate-200">
            Confidence level: High
          </div>
        </div>
      </div>
    </div>
  );

  const renderManageAdmins = () => (
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
        {stateAdmins.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-8 bg-slate-50 border border-dashed rounded-xl">
            No state-level administrators found in the database.
          </div>
        ) : (
          stateAdmins.map(admin => (
            <div key={admin.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 text-xs block">{admin.name}</span>
                <span className="text-[10px] text-slate-500">{admin.designation} · {admin.department} · State level</span>
              </div>
              <button className="px-3 py-1 bg-white border border-slate-200 text-slate-655 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                Configure Permissions
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderOfficerCsvImport = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div>
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
          Bulk Officer CSV Import
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Upload a CSV file to provision officer accounts and assign district mapping in bulk.
        </p>
      </div>

      {/* Required format instructions */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <FileText size={14} className="text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-indigo-800 block mb-1">Required CSV Format</span>
            <p className="text-[10px] text-indigo-700 font-medium mb-2">
              Your CSV file must have these exact column headers (case-insensitive):
            </p>
            <code className="text-[10px] bg-white border border-indigo-200 px-2.5 py-1.5 rounded-lg font-mono text-indigo-900 block">
              Name, Designation, Department, District
            </code>
            <p className="text-[10px] text-indigo-600 mt-2">
              <strong>District</strong> is optional. Rows missing Name, Designation, or Department will be skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className="p-10 border-2 border-dashed border-slate-250 rounded-2xl text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto text-indigo-650 mb-3" size={28} />
        <span className="font-bold text-slate-900 text-sm block mb-1">
          {importStatus === 'loading' ? 'Importing...' : 'Click to Upload CSV File'}
        </span>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Select your CSV file — it will be parsed and imported to the database immediately.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCsvFileChange}
        />
      </div>

      {/* Status Results */}
      {csvFileName && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2">
          <FileText size={12} className="text-slate-400" />
          <span className="font-mono">{csvFileName}</span>
        </div>
      )}

      {importStatus === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 animate-pulse">
          <RefreshCw size={12} className="animate-spin" /> Parsing and importing records...
        </div>
      )}

      {importStatus === 'success' && importResult && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            <CheckCircle size={13} />
            Successfully imported {importResult.inserted} officer{importResult.inserted !== 1 ? 's' : ''}.
          </div>
          {importResult.skipped.length > 0 && (
            <div className="text-[10px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              <strong>Skipped ({importResult.skipped.length}):</strong> {importResult.skipped.join(', ')} — missing required fields.
            </div>
          )}
        </div>
      )}

      {importStatus === 'error' && (
        <div className="flex items-start gap-2 text-xs text-rose-700 font-medium bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
          <XCircle size={13} className="shrink-0 mt-0.5" />
          {importError}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 p-8 overflow-y-auto space-y-6 min-h-[680px]">
      {/* View Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">
            Admin › {subTab}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {subTab === 'Overview' ? 'National Dashboard' : subTab}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Super Admin (Bypassed) · Viewing all states and union territories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleForceSync}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
      </div>

      {/* View Content Switcher */}
      {subTab === 'Overview' && renderOverview()}
      {subTab === 'Complaints' && renderComplaints()}
      {subTab === 'Milestones & Documents' && renderMilestones()}
      {subTab === 'District View' && renderDistrictView()}
      {subTab === 'Booth Analyser' && renderBoothAnalyser()}
      {subTab === 'Fund Predictor' && renderFundPredictor()}
      {subTab === 'Manage Admins' && renderManageAdmins()}
      {subTab === 'Officer CSV Import' && renderOfficerCsvImport()}
    </div>
  );
};
