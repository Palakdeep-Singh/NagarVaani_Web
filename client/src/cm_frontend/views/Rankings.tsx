import React from 'react';
import { useStore } from '../context/Store';
import { GovPageShell, GovCard } from '../components/GovPageShell';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle } from 'lucide-react';

const getScoreStyle = (score: number): { ring: string; color: string; label: string } => {
  if (score >= 80) return { ring: 'good', color: 'var(--primary-light)',   label: 'Performing' };
  if (score >= 60) return { ring: 'warn', color: '#9B8030',   label: 'At Risk' };
  return                  { ring: 'bad',  color: '#8B3A3A',     label: 'Critical' };
};

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export const Rankings: React.FC = () => {
  const { complaints, officers } = useStore();

  const rankings = officers
    .filter(o => o.district)
    .map(dm => {
      const dc    = complaints.filter(c => c.district === dm.district);
      const total = dc.length;
      const unres = dc.filter(c => c.status !== 'Resolved').length;
      const emrg  = dc.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;
      const score = total > 0 ? Math.round(((total - unres) / total) * 100) : 100;
      return { name: dm.district!, score, unres, total, emrg, officer: dm.name, resRate: dm.resolutionRate, avgTime: dm.avgResolutionTime };
    })
    .sort((a, b) => b.score - a.score);

  const avg = rankings.length > 0 ? Math.round(rankings.reduce((a, r) => a + r.score, 0) / rankings.length) : 0;
  const performing = rankings.filter(r => r.score >= 80).length;
  const critical   = rankings.filter(r => r.score <  60).length;

  return (
    <GovPageShell
      office="CM Executive Office · Performance Monitoring Cell"
      title="District Performance Leaderboard"
      subtitle="Grievance resolution SLA scores across Delhi's 11 administrative districts. Rankings updated every 24 hours."
      sourceNote="Computed from grievance resolution data · Methodology: DOPT Performance Framework 2022 · Data: State Portal (synthetic MVP)"
    >
      {/* ECI compliance note */}
      <div className="citizen-charter-note mb-16">
        <strong>ECI / DOPT Compliance:</strong> Performance rankings are used strictly for internal administrative accountability and service improvement. Rankings are not for public release during Model Code of Conduct periods without ECI clearance (ECI Instruction No. 576/3/2022/SDR).
      </div>

      {/* Summary strip */}
      <div className="grid-4 mb-16">
        {[
          { label: 'Best Performing District', value: rankings[0]?.name || '—', color: 'navy', icon: <TrendingUp size={14} /> },
          { label: 'Needs Intervention',        value: rankings[rankings.length-1]?.name || '—', color: 'navy',   icon: <TrendingDown size={14} /> },
          { label: 'State Average SLA Score',   value: `${avg}%`, color: 'navy', icon: <Minus size={14} /> },
          { label: 'Performing Districts',       value: `${performing} / ${rankings.length}`, color: 'navy', icon: <ShieldCheck size={14} /> },
        ].map((s, i) => (
          <div key={i} className={`stat-card c-${s.color}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="stat-card-label">{s.label}</div>
              <div style={{ color: `var(--gov-${s.color})` }}>{s.icon}</div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.2rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Alert for critical districts */}
      {critical > 0 && (
        <div className="alert-strip critical mb-16">
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <div>
            <strong>{critical} district{critical > 1 ? 's' : ''} in critical performance band (&lt;60% SLA score).</strong>{' '}
            Immediate review by Principal Secretary (Services) recommended per DOPT OM 43011/2/2014.
          </div>
        </div>
      )}

      {/* Main rankings table */}
      <GovCard
        title="District-wise SLA Performance Rankings"
        subtitle="Ranked by Grievance Resolution SLA Score (resolution rate × timeliness)"
        source="State Portal · 24-hr cycle"
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>District</th>
                <th>DM / Officer</th>
                <th>Total Grievances</th>
                <th>Unresolved</th>
                <th>Emergency Active</th>
                <th>Avg. Resolution Time</th>
                <th>SLA Score</th>
                <th>Performance Band</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => {
                const st = getScoreStyle(r.score);
                return (
                  <tr key={r.name}>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i < 3 ? (
                          <span style={{ fontSize: '1.2rem' }}>{MEDAL[i]}</span>
                        ) : (
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--surface-row-alt)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)',
                          }}>
                            {i + 1}
                          </div>
                        )}
                      </div>
                    </td>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.officer}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.total.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: r.unres > 10 ? '#8B3A3A' : 'var(--text-primary)', fontWeight: 600 }}>
                      {r.unres}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: r.emrg > 0 ? '#8B3A3A' : 'var(--primary-light)', fontWeight: 700 }}>
                      {r.emrg > 0 ? `⚠ ${r.emrg}` : '✓ 0'}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {r.avgTime ? `${r.avgTime} hrs` : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-ring" style={{ width: 44, height: 44, fontSize: '0.80rem' }} data-class={st.ring}>
                          {/* CSS classes for score ring */}
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            border: `3px solid ${st.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-heading)', fontSize: '0.80rem', fontWeight: 700,
                            color: st.color,
                          }}>
                            {r.score}%
                          </div>
                        </div>
                        <div className="gov-progress" style={{ width: 60 }}>
                          <div className="gov-progress-fill" style={{ width: `${r.score}%`, background: st.color }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" style={{
                        background: r.score >= 80 ? 'var(--status-resolved-bg)' : r.score >= 60 ? 'var(--status-pending-bg)' : 'var(--status-escalated-bg)',
                        color:      r.score >= 80 ? 'var(--status-resolved-text)' : r.score >= 60 ? 'var(--status-pending-text)' : 'var(--status-escalated-text)',
                        borderColor: r.score >= 80 ? 'var(--status-resolved-border)' : r.score >= 60 ? 'var(--status-pending-border)' : 'var(--status-escalated-border)',
                      }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', background: 'var(--surface-row-alt)', borderTop: '1px solid var(--border-light)', fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SLA Score = (Resolved / Total) × 100 · Threshold: ≥80% Performing | 60–79% At Risk | &lt;60% Critical · Based on DOPT Performance Framework 2022
        </div>
      </GovCard>
    </GovPageShell>
  );
};
