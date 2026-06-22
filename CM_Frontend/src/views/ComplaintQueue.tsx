import React, { useState } from 'react';
import { useStore } from '../context/Store';
import {
  LayoutDashboard, Filter, ChevronRight, ChevronDown,
  AlertTriangle, Clock, CheckCircle2, Activity, FileText, Download,
} from 'lucide-react';
import type { Complaint } from '../types';

function StatusPill({ status }: { status: string }) {
  const cls = status === 'Pending' ? 'pending' : status === 'Active' ? 'active' : status === 'Resolved' ? 'resolved' : 'escalated';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
function PrioDot({ p }: { p: string }) {
  const cls = p === 'Emergency' ? 'emergency' : p === 'High' ? 'high' : p === 'Medium' ? 'medium' : 'low';
  return <span className={`prio-dot ${cls}`}>{p}</span>;
}

const getDaysOpen = (dateStr: string) => Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);

export const ComplaintQueue: React.FC = () => {
  const { complaints, updateComplaintStatus, sendInterimReply, currentUser } = useStore();
  const [filterStatus,   setFilterStatus]   = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDept,     setFilterDept]     = useState('All');
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [remark,         setRemark]         = useState('');
  const [search,         setSearch]         = useState('');

  const filtered = complaints.filter(c => {
    if (filterStatus   !== 'All' && c.status   !== filterStatus)   return false;
    if (filterPriority !== 'All' && c.priority !== filterPriority) return false;
    if (filterDept     !== 'All' && c.department !== filterDept)   return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime());

  const totalPending   = complaints.filter(c => c.status === 'Pending').length;
  const totalActive    = complaints.filter(c => c.status === 'Active').length;
  const totalEscalated = complaints.filter(c => c.status === 'Escalated').length;
  const totalBreached  = complaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) > 21).length;
  const departments    = [...new Set(complaints.map(c => c.department))];

  const handleStatusUpdate = (c: Complaint, status: string) => {
    if (!remark.trim() && (status === 'Escalated' || status === 'Resolved')) {
      alert('⚠ Official remark is mandatory for Escalation or Resolution per DOPT Grievance Guidelines 2014.');
      return;
    }
    updateComplaintStatus(c.id, status as Complaint['status'], remark || `Status updated to ${status}`, currentUser?.username || 'DM Office');
    setExpandedId(null); setRemark('');
  };

  return (
    <div className="page-shell fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-md border border-indigo-100">Daily Operations</span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>LIVE SYNC
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="text-indigo-600" size={24} />
              Complaint Queue — Shahdara District
            </h1>
            <p className="text-sm text-slate-500 mt-1">All district complaints · Filter by status, priority, department · SLA countdown on each row</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#2563EB] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending', value: totalPending, icon: <Clock size={18} />, accent: 'amber', bg: '#FFFBEB', col: '#B45309' },
          { label: 'Active',  value: totalActive,  icon: <Activity size={18} />, accent: 'blue',  bg: '#EFF6FF', col: '#1D4ED8' },
          { label: 'Escalated', value: totalEscalated, icon: <AlertTriangle size={18} />, accent: 'red', bg: '#FEF2F2', col: '#B91C1C' },
          { label: 'SLA Breached (21d+)', value: totalBreached, icon: <CheckCircle2 size={18} />, accent: 'red', bg: '#FEF2F2', col: '#B91C1C' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 flex items-center gap-4">
            <div style={{ padding: 10, borderRadius: 12, background: k.bg, color: k.col }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Breach Alert */}
      {totalBreached > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-rose-800 text-sm">{totalBreached} complaints have breached the 21-day DARPG SLA limit.</span>
            <span className="text-rose-700 text-xs ml-2">Formal escalation to Secretary required. DM is personally liable per DARPG 2024 guidelines.</span>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or Ref ID..." className="flex-1 min-w-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400" />
        {[
          { label: 'Status', value: filterStatus, set: setFilterStatus, opts: ['All','Pending','Active','Resolved','Escalated'] },
          { label: 'Priority', value: filterPriority, set: setFilterPriority, opts: ['All','Emergency','High','Medium','Low'] },
          { label: 'Department', value: filterDept, set: setFilterDept, opts: ['All', ...departments] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400">
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium">Showing {filtered.length} of {complaints.length}</span>
      </div>

      {/* Table */}
      <div className="gov-card">
        <div className="gov-card-header">
          <div>
            <div className="gov-card-title"><FileText size={14} /> Grievance Register</div>
            <div className="gov-card-subtitle">Click any row to expand timeline · All status changes are audited</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ref. No.</th><th>Grievance</th><th>Ward</th><th>Department</th>
                <th>Citizen</th><th>Filed</th><th>Days Open</th><th>SLA</th>
                <th>Priority</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const days    = getDaysOpen(c.dateFiled);
                const slaPct  = Math.min(100, Math.round((days / 21) * 100));
                const slaCls  = slaPct < 60 ? 'sla-ok' : slaPct < 90 ? 'sla-warn' : 'sla-breach';
                const isExpanded = expandedId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr
                      style={{ cursor: 'pointer', background: c.priority === 'Emergency' ? '#FFF5F5' : c.status === 'Escalated' ? '#FEF2F2' : undefined }}
                      onClick={() => { setExpandedId(isExpanded ? null : c.id); setRemark(''); }}
                    >
                      <td><span className="ref-id">{c.id}</span></td>
                      <td>
                        <strong>{c.title}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.category}</div>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>{c.ward}</td>
                      <td style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>{c.department}</td>
                      <td>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{c.citizenName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.citizenPhone}</div>
                      </td>
                      <td><span className="ref-id">{c.dateFiled}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem', color: days > 21 ? '#B91C1C' : days > 15 ? '#B45309' : 'var(--text-primary)' }}>
                        {days}d {days > 21 && <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>BREACH</span>}
                      </td>
                      <td style={{ minWidth: 90 }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>{slaPct}%</div>
                        <div className="sla-bar"><div className={`sla-fill ${slaCls}`} style={{ width: `${slaPct}%` }} /></div>
                      </td>
                      <td><PrioDot p={c.priority} /></td>
                      <td><StatusPill status={c.status} /></td>
                      <td><ChevronRight size={14} color="var(--text-muted)" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} /></td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={11} style={{ background: 'var(--surface-header)', padding: '16px 20px' }}>
                          <div className="grid-2" style={{ gap: 24 }}>
                            {/* Timeline */}
                            <div>
                              <div className="section-lbl">Resolution Timeline</div>
                              {c.timeline.map((ev, i) => (
                                <div key={i} className="track-step">
                                  <div className={`track-dot ${i < c.timeline.length - 1 ? 'done' : 'cur'}`} />
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{ev.action}</div>
                                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ev.date} · {ev.actor}</div>
                                    {ev.notes && <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ev.notes}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Actions */}
                            <div>
                              <div className="section-lbl">Update Status</div>
                              {c.assignedSDM && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>📌 Assigned SDM: <strong>{c.assignedSDM}</strong></div>}
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Official Remark <span style={{ color: 'var(--danger)', fontSize: '0.70rem' }}>(mandatory for Escalation / Resolution)</span></div>
                                <textarea
                                  value={remark} onChange={e => setRemark(e.target.value)}
                                  placeholder="Enter official note with officer ID and reason..."
                                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem', minHeight: 64, resize: 'vertical', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', background: '#FAFBFC' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['Active', 'Resolved', 'Escalated'].map(s => (
                                  <button key={s} className={`gov-btn gov-btn-sm ${s === 'Resolved' ? 'gov-btn-primary' : s === 'Escalated' ? 'gov-btn-danger' : 'gov-btn-outline'}`} onClick={() => handleStatusUpdate(c, s)}>
                                    Mark {s}
                                  </button>
                                ))}
                                {!c.interimSent && getDaysOpen(c.dateFiled) >= 15 && (
                                  <button className="gov-btn gov-btn-sm" style={{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FED7AA' }} onClick={() => { sendInterimReply(c.id); alert(`Interim reply sent to ${c.citizenName} for ${c.id}`); }}>
                                    Send Interim Reply
                                  </button>
                                )}
                              </div>
                              <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                                ⚠ All changes are timestamped · Officer ID auto-logged<br />
                                Per DOPT Grievance Redressal Guidelines 2014
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)', fontSize: '0.84rem' }}>No complaints match the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', background: 'var(--surface-row-alt)', borderTop: '1px solid var(--border-light)', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filtered.length} grievances · Total district: {complaints.length}</span>
          <span>Audit log maintained · Data classified RESTRICTED</span>
        </div>
      </div>
    </div>
  );
};
