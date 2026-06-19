import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Percent, ShieldAlert, Cpu, Bell, LogOut, Activity, RefreshCw } from 'lucide-react';
import axios from 'axios';
import PresidingOfficerDashboard from './PresidingOfficerDashboard.jsx';

export default function CMDboard({ user, onLogout }) {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoothId, setSelectedBoothId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchOversightData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${apiUrl}/booth/status`);
      if (res.status === 200 && res.data.booths) {
        setBooths(res.data.booths);
        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error("Failed to fetch oversight data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOversightData();
    const interval = setInterval(fetchOversightData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (selectedBoothId !== null) {
    return (
      <PresidingOfficerDashboard
        user={user}
        onLogout={onLogout}
        boothIdOverride={selectedBoothId}
        onBackToCM={() => setSelectedBoothId(null)}
      />
    );
  }

  // Aggregate stats
  const totalBooths = booths.length;
  const operationalBooths = booths.filter(b => b.status === 'Operational').length;
  const criticalBooths = totalBooths - operationalBooths;
  
  const totalVoted = booths.reduce((acc, b) => acc + (b.turnout?.voted || 0), 0);
  const totalVoters = booths.reduce((acc, b) => acc + (b.turnout?.total || 0), 0);
  const avgTurnout = totalVoters > 0 ? Math.round((totalVoted / totalVoters) * 100) : 0;

  const totalIncidents = booths.reduce((acc, b) => acc + (b.incidentsCount || 0), 0);
  const totalComplaints = booths.reduce((acc, b) => acc + (b.complaintsCount || 0), 0);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#1e293b',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF"
            alt="India Emblem"
            style={{ width: '42px', height: '42px' }}
          />
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
              NagarVaani CM Command Hub
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', margin: '4px 0 0' }}>
              State Election Monitoring Room
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
            Last Update: <span style={{ color: '#60a5fa', fontWeight: '700' }}>{lastUpdated}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '14px',
              color: '#ffffff'
            }}>CM</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>Hon'ble Chief Minister</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>State Executive</div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                marginLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main style={{ padding: '40px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* AGGREGATED STATS ROW */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Total Stations</p>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '8px 0 0', color: '#0f172a' }}>{totalBooths} Booths</h2>
              <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', margin: '4px 0 0' }}>● {operationalBooths} Operational</p>
            </div>
            <div style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '14px', borderRadius: '16px' }}><Activity size={24} /></div>
          </div>

          {/* Card 2 */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Average Turnout</p>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '8px 0 0', color: '#16a34a' }}>{avgTurnout}%</h2>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '4px 0 0' }}>{totalVoted} / {totalVoters} Voted</p>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '14px', borderRadius: '16px' }}><Percent size={24} /></div>
          </div>

          {/* Card 3 */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Pending Complaints</p>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '8px 0 0', color: totalComplaints > 0 ? '#ea580c' : '#0f172a' }}>{totalComplaints} Pending</h2>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '4px 0 0' }}>Requires booth verification</p>
            </div>
            <div style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '14px', borderRadius: '16px' }}><ShieldAlert size={24} /></div>
          </div>

          {/* Card 4 */}
          {(() => {
            const totalEscalated = booths.reduce((acc, b) => acc + (b.escalatedCount || 0), 0);
            const isRed = totalEscalated > 0;
            return (
              <div style={{
                backgroundColor: isRed ? '#fef2f2' : '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: isRed ? '2px solid #ef4444' : '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: isRed ? 'pulse 2s infinite' : 'none'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Critical Escalations</p>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '8px 0 0', color: isRed ? '#dc2626' : '#0f172a' }}>{totalEscalated} Alerts</h2>
                  <p style={{ fontSize: '12px', color: isRed ? '#b91c1c' : '#64748b', fontWeight: '700', margin: '4px 0 0' }}>
                    {isRed ? '⚠️ Immediate Action Required' : '✓ No Escalations Active'}
                  </p>
                </div>
                <div style={{ backgroundColor: isRed ? '#fee2e2' : '#fef2f2', color: '#dc2626', padding: '14px', borderRadius: '16px' }}><Bell size={24} /></div>
              </div>
            );
          })()}
        </section>

        {/* SECTION HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Booth-by-Booth Telemetry
          </h2>
          <button 
            onClick={fetchOversightData} 
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#475569'
            }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* BOOTH CARDS GRID */}
        {loading ? (
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>Loading live election streams...</p>
          </div>
        ) : (
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {booths.map(b => {
              const hasEscalations = b.escalatedCount > 0;
              return (
                <div 
                  key={b.id} 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    border: hasEscalations ? '2.5px solid #ef4444' : (b.status === 'Operational' ? '1px solid #e2e8f0' : '2px solid #fca5a5'),
                    padding: '30px',
                    boxShadow: hasEscalations ? '0 10px 20px rgba(239, 68, 68, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    textAlign: 'left',
                    animation: 'none'
                  }}
                >
                {/* Booth Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      Booth {b.id}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '4px 0 0' }}>
                      {b.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', margin: '4px 0 0', textTransform: 'uppercase' }}>
                      {b.constituency}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: b.status === 'Operational' ? '#dcfce7' : '#fee2e2',
                    color: b.status === 'Operational' ? '#15803d' : '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: b.status === 'Operational' ? '#16a34a' : '#dc2626'
                    }}></span>
                    {b.status}
                  </span>
                </div>

                {/* Progress bar / Turnout */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                    <span>Voter Turnout</span>
                    <span>{b.turnout?.percentage || 0}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${b.turnout?.percentage || 0}%`,
                      backgroundColor: '#2563eb',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '4px 0 0' }}>
                    {b.turnout?.voted} of {b.turnout?.total} citizens voted
                  </p>
                </div>

                {/* Info row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.2fr',
                  gap: '12px',
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Queue Count</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#334155', marginTop: '4px' }}>
                      {b.queue?.count} people
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Avg Wait Time</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: b.queue?.length === 'High' ? '#dc2626' : '#d97706', marginTop: '4px' }}>
                      ~ {b.queue?.waitTime} mins
                    </div>
                  </div>
                </div>

                {/* Escalations warning badge inside card */}
                {hasEscalations && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ⚠️ {b.escalatedCount} Complaint(s) Escalated to Sector Officer
                  </div>
                )}

                {/* Health & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Health Index:</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: b.healthScore > 80 ? '#16a34a' : b.healthScore > 60 ? '#d97706' : '#dc2626'
                    }}>
                      {b.healthScore}/100
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedBoothId(b.id)}
                    style={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 18px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1e293b'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#0f172a'}
                  >
                    Drill Down →
                  </button>
                </div>

              </div>
              );
            })}
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        fontSize: '11px',
        color: '#64748b',
        borderTop: '1px solid #cbd5e1',
        backgroundColor: '#ffffff'
      }}>
        © 2026 NagarVaani Chief Minister Oversight Platform. State Security Protocol Active.
      </footer>
    </div>
  );
}
