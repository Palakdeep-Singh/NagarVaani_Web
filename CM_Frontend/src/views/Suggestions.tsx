import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { GovPageShell } from '../components/GovPageShell';
import { AlertTriangle, TrendingUp, CheckCircle2, Clock, RefreshCw, ChevronRight, ShieldCheck } from 'lucide-react';

interface AIInsight {
  id: number;
  type: 'critical' | 'warning' | 'opportunity' | 'info';
  department: string;
  title: string;
  detail: string;
  action: string;
  rule: string;
  priority: number;
}

const TYPE_META = {
  critical:    { bg: 'var(--status-escalated-bg)',  color: 'var(--status-escalated-text)',  border: 'var(--status-escalated-border)',  icon: <AlertTriangle size={16} />,   label: 'CRITICAL' },
  warning:     { bg: 'var(--status-pending-bg)',    color: 'var(--status-pending-text)',    border: 'var(--status-pending-border)',    icon: <Clock size={16} />,           label: 'WARNING' },
  opportunity: { bg: 'var(--status-resolved-bg)',   color: 'var(--status-resolved-text)',   border: 'var(--status-resolved-border)',   icon: <TrendingUp size={16} />,      label: 'OPPORTUNITY' },
  info:        { bg: 'var(--status-active-bg)',     color: 'var(--status-active-text)',     border: 'var(--status-active-border)',     icon: <CheckCircle2 size={16} />,    label: 'INFO' },
};

export const Suggestions: React.FC = () => {
  const { complaints, projects, officers } = useStore();
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const emergencyCount  = complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
  const escalatedCount  = complaints.filter(c => c.status === 'Escalated').length;
  const deptCounts      = complaints.reduce((acc: Record<string, number>, c) => {
    const d = c.department?.replace(' & Family Welfare','').replace(' Department','') || 'Other';
    acc[d] = (acc[d] || 0) + 1; return acc;
  }, {});
  const topDept         = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];
  const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.status === 'Critical').length;
  const total           = complaints.length;
  const resolved        = complaints.filter(c => c.status === 'Resolved').length;
  const resRate         = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const pendingOver30   = complaints.filter(c => {
    const days = Math.floor((Date.now() - new Date(c.dateFiled).getTime()) / 86400000);
    return days > 30 && c.status !== 'Resolved';
  }).length;

  const lowOfficers = officers.filter(o => o.resolutionRate < 60).length;

  const insights: AIInsight[] = [
    ...(emergencyCount > 0 ? [{
      id: 1, type: 'critical' as const, department: 'Cross-Department',
      title: `${emergencyCount} Emergency grievances unresolved — immediate DM escalation required`,
      detail: `${emergencyCount} active emergency-priority complaints have not been resolved. Per Delhi Citizen Charter 2023, emergency grievances must be acknowledged within 2 hours and resolved within 24 hours. Field inspection teams should be deployed immediately.`,
      action: 'Issue DM Alert — Escalate to Secretary Level',
      rule: 'Delhi Citizen Charter 2023 · Clause 4.2 — Emergency Grievance Response',
      priority: 1,
    }] : []),
    ...(pendingOver30 > 0 ? [{
      id: 2, type: 'critical' as const, department: 'Grievance Cell',
      title: `${pendingOver30} complaints pending beyond 30-day SLA limit`,
      detail: `These complaints breach the mandatory 30-day resolution window prescribed in DOPT OM No. 43011/2/2014. They must be forwarded to the concerned Secretary within 48 hours with a detailed status report. Failure to act may result in RTI queries and court notices.`,
      action: 'Generate 30-Day SLA Breach Report & Notify Secretaries',
      rule: 'DOPT OM No. 43011/2/2014 · Grievance Redressal Policy',
      priority: 2,
    }] : []),
    ...(escalatedCount > 3 ? [{
      id: 3, type: 'warning' as const, department: 'CM Office',
      title: `${escalatedCount} grievances escalated — CM-level review may be required`,
      detail: `High escalation rate indicates systemic departmental bottlenecks. Per the Sevottam framework (BIS IS 15700:2018), repeated escalations in the same department require a root-cause analysis and Standard Operating Procedure revision within 15 working days.`,
      action: 'Schedule Departmental Review Meeting — Sevottam Framework',
      rule: 'BIS IS 15700:2018 Sevottam Framework · Section 6.3',
      priority: 3,
    }] : []),
    ...(topDept ? [{
      id: 4, type: 'warning' as const, department: topDept[0],
      title: `${topDept[0]} is the highest complaint-volume department (${topDept[1]} cases)`,
      detail: `Concentrated load on one department suggests structural capacity issues. Recommend: nodal officer capacity audit, inter-department resource sharing proposal to Chief Secretary, and temporary reallocation of personnel per FR-SR Part I Rule 35.`,
      action: 'Schedule Nodal Officer Capacity Review',
      rule: 'FR-SR Part I Rule 35 · Temporary Inter-Dept. Transfer',
      priority: 4,
    }] : []),
    ...(delayedProjects > 0 ? [{
      id: 5, type: 'warning' as const, department: 'Project Monitoring Cell',
      title: `${delayedProjects} infrastructure projects behind schedule — budget utilisation at risk`,
      detail: `Delayed projects risk lapse of funds at financial year-end per GFR 2017 Rule 239. A contractor performance review and revised timeline submission should be mandated within 7 working days. Penalty clauses in contractor agreements should be invoked where applicable.`,
      action: 'Issue Show-Cause Notice — GFR 2017 Rule 239 Review',
      rule: 'GFR 2017 Rule 239 · Budget Utilisation Guidelines',
      priority: 5,
    }] : []),
    ...(resRate >= 70 ? [{
      id: 6, type: 'opportunity' as const, department: 'Performance Cell',
      title: `Resolution rate at ${resRate}% — above target. Opportunity to raise citizen satisfaction.`,
      detail: `Strong resolution metrics present an opportunity to launch a citizen feedback survey per Sevottam Clause 3.2 — Citizen Charter Feedback Mechanism. Survey results can be used to publish a quarterly transparency report and apply for DARPG's Grievance Excellence Award.`,
      action: 'Launch Citizen Satisfaction Survey — Sevottam 3.2',
      rule: 'Sevottam BIS IS 15700:2018 · Clause 3.2 — Citizen Feedback',
      priority: 6,
    }] : []),
    ...(lowOfficers > 0 ? [{
      id: 7, type: 'warning' as const, department: 'HR / Training',
      title: `${lowOfficers} officer${lowOfficers > 1 ? 's' : ''} below 60% resolution rate — mandatory training recommended`,
      detail: `Officers with resolution rates below 60% for 2+ consecutive months require mandatory capacity building per DOPT Training Policy 2012. Recommend: enrolment in IGNOU PGDGOV programme or district-level grievance management workshop within 30 days.`,
      action: 'Enrol Officers in DOPT Capacity Building Programme',
      rule: 'DOPT Training Policy 2012 · Mandatory Competency Development',
      priority: 7,
    }] : []),
  ].sort((a, b) => a.priority - b.priority);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setRefreshCount(c => c + 1);
    setLoading(false);
  };

  return (
    <GovPageShell
      office="CM Executive Office · AI Policy Recommendation Engine"
      title="AI-Driven Policy Suggestions"
      subtitle="Rule-based insights derived from live grievance data — mapped to government guidelines, citizen charter obligations, and legal frameworks."
      sourceNote={`Refresh ${refreshCount + 1} · ${new Date().toLocaleString('en-IN')} · Data: State Portal`}
      actions={
        <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing…' : 'Refresh Analysis'}
        </button>
      }
    >
      <div className="citizen-charter-note mb-16">
        <strong>AI Transparency Note (Government AI Policy 2023):</strong> These suggestions are generated by rule-based analytics, not generative AI. Every insight is traceable to a specific government regulation, DOPT circular, or Citizen Charter clause. Officers must apply independent professional judgement before acting on any suggestion. AI-generated content must not replace legally mandated human review per MeitY AI Governance Framework 2024.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map(ins => {
          const meta = TYPE_META[ins.type];
          return (
            <div key={ins.id} style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderLeft: `4px solid ${meta.color}`,
              borderRadius: 3,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color, flexShrink: 0,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.84rem', fontWeight: 700, color: meta.color,
                      background: 'rgba(0,0,0,0.06)',
                      padding: '1px 7px', borderRadius: 2,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                    }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Dept: {ins.department}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {ins.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 10 }}>
                    {ins.detail}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button className="gov-btn gov-btn-primary gov-btn-sm">
                      <ChevronRight size={14} /> {ins.action}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ShieldCheck size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {ins.rule}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {insights.length === 0 && (
          <div className="gov-card">
            <div className="gov-card-body" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <CheckCircle2 size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>All Systems Nominal</div>
              <div style={{ fontSize: '0.78rem' }}>No critical or warning-level issues detected at this time.</div>
            </div>
          </div>
        )}
      </div>
    </GovPageShell>
  );
};
