import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Heatmap } from '../components/Heatmap';
import {
  ShieldAlert, CheckCircle2, Clock, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Filter, Download, RefreshCw,
  Info, Activity, Eye, ChevronRight, User
} from 'lucide-react';
import { formatINR } from '../utils/helper';

const DISTRICTS = [
  'Central','East','New Delhi','North','North East','North West',
  'Shahdara','South','South East','South West','West'
];

const STATUS_ORDER = ['Pending','Active','Escalated','Resolved'];

function StatusPill({ status }: { status: string }) {
  const cls = status === 'Pending' ? 'pending' : status === 'Active' ? 'active' : status === 'Resolved' ? 'resolved' : 'escalated';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  const cls = priority === 'Emergency' ? 'emergency' : priority === 'High' ? 'high' : priority === 'Medium' ? 'medium' : 'low';
  return <span className={`prio-dot ${cls}`}>{priority}</span>;
}

interface StatCardProps {
  label: string; value: string | number; sub?: string; accent: string;
  icon: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; trendLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent, icon, trend, trendLabel }) => (
  <div className={`stat-card c-${accent}`}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
        {trend && trendLabel && (
          <div className="stat-card-trend" style={{ color: trend === 'up' ? 'var(--primary-light)' : trend === 'down' ? '#8B3A3A' : 'var(--text-muted)' }}>
            {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : null}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="stat-card-icon">
        {icon}
      </div>
    </div>
  </div>
);

export const Overview: React.FC = () => {
  const { complaints, files, projects, activeRole, activeDistrict, activeDepartment, updateComplaintStatus } = useStore();
  const [filterDistrict, setFilterDistrict]   = useState('All');
  const [filterStatus, setFilterStatus]       = useState('All');
  const [filterPriority, setFilterPriority]   = useState('All');
  const [expandedId, setExpandedId]           = useState<string | null>(null);
  const [remarkText, setRemarkText]           = useState('');
  const [activeSection, setActiveSection]     = useState<'complaints' | 'heatmap' | 'citizen'>('complaints');

  const isDM   = activeRole === 'District Magistrate';
  const isDept = activeRole === 'Department Head';
  const isCM   = activeRole === 'Chief Minister';

  const filteredComplaints = complaints.filter(c => {
    if (isDM)   return c.district === activeDistrict;
    if (isDept) return c.department === activeDepartment;
    let pass = true;
    if (filterDistrict !== 'All')  pass = pass && c.district === filterDistrict;
    if (filterStatus   !== 'All')  pass = pass && c.status === filterStatus;
    if (filterPriority !== 'All')  pass = pass && c.priority === filterPriority;
    return pass;
  });

  const total      = filteredComplaints.length;
  const resolved   = filteredComplaints.filter(c => c.status === 'Resolved').length;
  const pending    = filteredComplaints.filter(c => c.status === 'Pending').length;
  const escalated  = filteredComplaints.filter(c => c.status === 'Escalated').length;
  const active     = filteredComplaints.filter(c => c.status === 'Active').length;
  const emergency  = filteredComplaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
  const resPct     = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const pendingFiles = files.filter(f => f.status === 'Pending Approval').length;

  const recent = [...filteredComplaints]
    .sort((a, b) => new Date(b.dateFiled).getTime() - new Date(a.dateFiled).getTime())
    .slice(0, 10);

  const statusDist = STATUS_ORDER.map(s => ({
    label: s,
    count: filteredComplaints.filter(c => c.status === s).length,
    pct: total > 0 ? Math.round((filteredComplaints.filter(c => c.status === s).length / total) * 100) : 0,
    color: s === 'Pending' ? '#9B8030' : s === 'Active' ? 'var(--primary)' : s === 'Resolved' ? 'var(--primary-light)' : '#8B3A3A',
  }));

  const handleStatusUpdate = (id: string, status: string) => {
    updateComplaintStatus(id, status as any, remarkText || 'Status updated from CM Dashboard', currentUser?.username || 'Officer');
    setExpandedId(null);
    setRemarkText('');
  };

  const { currentUser } = useStore();

  return (
    <div className="page-shell fade-in">
      {/* Page header */}
      <div className="page-shell-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="page-shell-office">
              {isCM ? 'CM Executive Office · Grievance Management Cell' : isDM ? `${activeDistrict} · District Magistrate Office` : `Department: ${activeDepartment}`}
            </div>
            <h1 className="page-shell-title">Grievance Overview</h1>
            <p className="page-shell-subtitle">
              Real-time grievance intake, routing, tracking and resolution status across all 11 districts of Delhi NCT.
            </p>
            <div className="page-shell-source">
              <Info size={9} /> Data source: Delhi State Portal (synthetic MVP) · Last updated: {new Date().toLocaleTimeString('en-IN')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button className="gov-btn gov-btn-outline gov-btn-sm">
              <Download size={15} /> Export CSV
            </button>
            <button className="gov-btn gov-btn-outline gov-btn-sm">
              <Download size={15} /> PDF Report
            </button>
            <button className="gov-btn gov-btn-primary gov-btn-sm">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Emergency alert strip */}
      {emergency > 0 && (
        <div className="alert-strip critical mb-16">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ lineHeight: 1.55 }}>
            <strong>EMERGENCY — Immediate Action Required:</strong>{' '}
            {emergency} emergency grievance{emergency > 1 ? 's' : ''} unresolved and require{emergency === 1 ? 's' : ''} DM-level escalation within 2 hours per Citizen Charter norms.
            Refer: DOPT OM No. 43011/2/2014-Estt.(D) — Grievance Redressal Guidelines.
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid-6 mb-16">
        <StatCard label="Total Grievances" value={total.toLocaleString('en-IN')} sub="All status" accent="navy" icon={<FileText size={20} />} />
        <StatCard label="Pending" value={pending.toLocaleString('en-IN')} sub="Awaiting assignment" accent="amber" icon={<Clock size={20} />} trend="down" trendLabel="+3 since yesterday" />
        <StatCard label="Active / In Progress" value={active.toLocaleString('en-IN')} sub="Assigned to officers" accent="teal" icon={<Activity size={20} />} />
        <StatCard label="Escalated" value={escalated.toLocaleString('en-IN')} sub="Needs DM attention" accent="saffron" icon={<ShieldAlert size={20} />} trend={escalated > 5 ? 'down' : 'up'} trendLabel={`${escalated} cases`} />
        <StatCard label="Resolved" value={`${resPct}%`} sub={`${resolved} of ${total}`} accent="green" icon={<CheckCircle2 size={20} />} trend="up" trendLabel="+4% vs last week" />
        <StatCard label="Files Pending" value={pendingFiles.toLocaleString('en-IN')} sub="Awaiting approval" accent="red" icon={<FileText size={20} />} />
      </div>

      {/* Status distribution bar */}
      <div className="gov-card mb-16">
        <div className="gov-card-header">
          <div>
            <div className="gov-card-title"><Activity size={14} /> Grievance Status Distribution</div>
            <div className="gov-card-subtitle">Breakdown across all complaint stages</div>
          </div>
          <div className="data-source-badge"><Info size={9} /> Live data</div>
        </div>
        <div className="gov-card-body">
          <div style={{ display: 'flex', height: 18, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
            {statusDist.map(s => s.pct > 0 && (
              <div key={s.label} style={{ width: `${s.pct}%`, background: s.color, transition: 'width 0.5s' }} title={`${s.label}: ${s.count}`} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {statusDist.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{s.count.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.label} ({s.pct}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="gov-tabs">
        <div className={`gov-tab ${activeSection === 'complaints' ? 'active' : ''}`} onClick={() => setActiveSection('complaints')}>
          Grievance Register
        </div>
        <div className={`gov-tab ${activeSection === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveSection('heatmap')}>
          District Heatmap
        </div>
        <div className={`gov-tab ${activeSection === 'citizen' ? 'active' : ''}`} onClick={() => setActiveSection('citizen')}>
          Citizen Transparency Portal
        </div>
      </div>

      {/* COMPLAINTS TABLE */}
      {activeSection === 'complaints' && (
        <>
          {/* Filters — only CM gets district filter */}
          {isCM && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 3, fontSize: '0.78rem', background: '#fff', color: 'var(--text-primary)' }}>
                <option value="All">All Districts</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 3, fontSize: '0.78rem', background: '#fff', color: 'var(--text-primary)' }}>
                <option value="All">All Statuses</option>
                {STATUS_ORDER.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 3, fontSize: '0.78rem', background: '#fff', color: 'var(--text-primary)' }}>
                <option value="All">All Priorities</option>
                {['Emergency','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
              </select>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <Filter size={15} />
                Showing {filteredComplaints.length} of {complaints.length} grievances
              </div>
            </div>
          )}

          <div className="gov-card">
            <div className="gov-card-header">
              <div>
                <div className="gov-card-title"><FileText size={14} /> Grievance Register</div>
                <div className="gov-card-subtitle">Click any row to expand timeline and update status</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Ref. No.</th>
                    <th>Grievance</th>
                    <th>District</th>
                    <th>Department</th>
                    <th>Citizen</th>
                    <th>Filed On</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(c => (
                    <React.Fragment key={c.id}>
                      <tr
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        <td><span className="ref-id">{c.id}</span></td>
                        <td><strong>{c.title}</strong><div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.category}</div></td>
                        <td style={{ fontSize: '0.78rem' }}>{c.district}</td>
                        <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.department}</td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.citizenName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.citizenPhone}</div>
                        </td>
                        <td><span className="ref-id">{c.dateFiled}</span></td>
                        <td><PriorityDot priority={c.priority} /></td>
                        <td><StatusPill status={c.status} /></td>
                        <td>
                          <ChevronRight size={14} color="var(--text-muted)" style={{ transform: expandedId === c.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </td>
                      </tr>
                      {expandedId === c.id && (
                        <tr>
                          <td colSpan={9} style={{ background: 'var(--surface-header)', padding: '14px 18px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                              {/* Timeline */}
                              <div>
                                <div className="section-lbl">Resolution Timeline</div>
                                {c.timeline.map((ev, i) => (
                                  <div key={i} className="track-step">
                                    <div className={`track-dot ${i < c.timeline.length - 1 ? 'done' : 'cur'}`} />
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{ev.action}</div>
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        {ev.date} · {ev.actor}
                                      </div>
                                      {ev.notes && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ev.notes}</div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Update status */}
                              <div>
                                <div className="section-lbl">Update Status</div>
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Remarks / Notes</div>
                                  <textarea
                                    value={remarkText}
                                    onChange={e => setRemarkText(e.target.value)}
                                    placeholder="Enter official remarks (mandatory for escalation/closure)"
                                    style={{
                                      width: '100%', padding: '8px 10px', border: '1px solid var(--border)',
                                      borderRadius: 3, fontSize: '0.75rem', minHeight: 60, resize: 'vertical',
                                      fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
                                    }}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {['Active', 'Resolved', 'Escalated'].map(s => (
                                    <button
                                      key={s}
                                      className={`gov-btn gov-btn-sm ${s === 'Resolved' ? 'gov-btn-primary' : s === 'Escalated' ? 'gov-btn-danger' : 'gov-btn-outline'}`}
                                      onClick={() => handleStatusUpdate(c.id, s)}
                                    >
                                      Mark {s}
                                    </button>
                                  ))}
                                </div>
                                <div style={{ marginTop: 10, fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                                  ⚠ All status changes are logged with officer ID and timestamp<br />
                                  per DOPT Grievance Redressal Guidelines 2014.
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)', fontSize: '0.80rem' }}>
                        No grievances match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 16px', background: 'var(--surface-row-alt)', borderTop: '1px solid var(--border-light)', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Showing {recent.length} most recent · {filteredComplaints.length} total in view</span>
              <span>Audit log maintained · Data classified RESTRICTED</span>
            </div>
          </div>
        </>
      )}

      {/* HEATMAP */}
      {activeSection === 'heatmap' && (
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <div className="gov-card-title">District Grievance Density Map</div>
              <div className="gov-card-subtitle">Complaint volume and SLA breach hotspots across Delhi NCT</div>
            </div>
            <div className="data-source-badge"><Info size={9} /> Synthetic seed data · Heatmap intensity ∝ complaint volume</div>
          </div>
          <div className="gov-card-body">
            <Heatmap />
            <div className="citizen-charter-note mt-16">
              <strong>ECI Spatial Compliance Note:</strong> Geographic complaint mapping must not be used for voter profiling or electoral influence per ECI Instruction No. 309/2019. This heatmap is restricted to administrative grievance routing purposes only.
            </div>
          </div>
        </div>
      )}

      {/* CITIZEN TRANSPARENCY */}
      {activeSection === 'citizen' && (
        <div>
          <div className="citizen-charter-note mb-16">
            <strong>Citizen Charter Commitment (Delhi):</strong> Every citizen has the right to track their grievance status in real time. Complaints not resolved within 30 days are automatically escalated to the Secretary level per Delhi Citizen Charter 2023. RTI requests for grievance data are processed within 30 days per Section 7 of the RTI Act, 2005.
          </div>

          {/* Public tracking widget */}
          <div className="public-track-box mb-16">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Eye size={15} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary)' }}>Public Grievance Tracking</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Citizens can track any complaint using their Reference Number</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Enter Grievance Reference ID (e.g. GR-2026-0042)"
                style={{
                  flex: 1, padding: '9px 12px', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: '0.80rem', fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)', background: '#FAFBFC',
                }}
              />
              <button className="gov-btn gov-btn-primary">Track Status</button>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Tracking available at nagarvaani.delhi.gov.in/track · RTI: rtionline.gov.in
            </div>
          </div>

          {/* Per-complaint public status cards */}
          <div className="gov-card">
            <div className="gov-card-header">
              <div className="gov-card-title"><User size={14} /> Citizen-Facing Resolution Status Board</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Ref. No.</th>
                    <th>Category</th>
                    <th>District</th>
                    <th>Filed On</th>
                    <th>Days Open</th>
                    <th>Status</th>
                    <th>SLA Health</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(c => {
                    const daysOpen = Math.floor((Date.now() - new Date(c.dateFiled).getTime()) / 86400000);
                    const slaPct   = Math.min(100, Math.round((daysOpen / 30) * 100));
                    const slaCls   = slaPct < 50 ? 'sla-ok' : slaPct < 80 ? 'sla-warn' : 'sla-breach';
                    return (
                      <tr key={c.id}>
                        <td><span className="ref-id">{c.id}</span></td>
                        <td style={{ fontSize: '0.75rem' }}>{c.category}</td>
                        <td style={{ fontSize: '0.75rem' }}>{c.district}</td>
                        <td><span className="ref-id">{c.dateFiled}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.78rem', color: daysOpen > 25 ? '#8B3A3A' : 'var(--text-primary)' }}>
                          {daysOpen} days
                        </td>
                        <td><StatusPill status={c.status} /></td>
                        <td>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>{slaPct}% of 30-day SLA</div>
                          <div className="sla-bar" style={{ width: 80 }}>
                            <div className={`sla-fill ${slaCls}`} style={{ width: `${slaPct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
