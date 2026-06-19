import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, FileCheck, Calculator, Users, Mail, Settings,
  LogOut, AlertTriangle, CheckCircle, Clock, MapPin, User, ChevronRight, Activity, ShieldAlert
} from "lucide-react";
import { emApi, fmt } from "../api/emApi.js";


const ReturningOfficerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const district = user?.district || "AC-123";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        emApi.getStats({ district }),
        emApi.getComplaints({ district }),
      ]);
      const fetchedStats = statsRes?.data || statsRes || {};
      setStats(fetchedStats);
      setComplaints(complaintsRes?.complaints || (Array.isArray(complaintsRes) ? complaintsRes : []));
    } catch (err) {
      console.error("Error fetching RO dashboard data:", err);
      setError("Failed to load real-time dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, [district]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "form17c", label: "Form 17C Verification", icon: FileCheck },
    { id: "counting", label: "Live Counting Room", icon: Calculator },
    { id: "agents", label: "Digital Agent Mgt", icon: Users },
    { id: "postal", label: "Postal Ballot Tracking", icon: Mail },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const form17CData = [
    { psId: "PS-001", name: "Govt Primary School, North Wing", form17C: 845, evm: 845, status: "Matched" },
    { psId: "PS-002", name: "Community Hall, Sector 4", form17C: 720, evm: 720, status: "Matched" },
    { psId: "PS-003", name: "Women College, Block A", form17C: 912, evm: 910, status: "Mismatch" },
    { psId: "PS-004", name: "Public Library, Main Road", form17C: 650, evm: 650, status: "Matched" },
    { psId: "PS-005", name: "High School, South Wing", form17C: 889, evm: 890, status: "Mismatch" },
  ];

  const countingTables = Array.from({ length: 14 }, (_, i) => ({
    id: `Table-${i + 1}`,
    status: i < 10 ? "Completed" : i === 10 ? "Counting EVM..." : "Idle",
    round: 14,
    lastEVM: i < 11 ? `EVM-${8000 + i}` : "-",
  }));

  const agentData = [
    { id: "AGT-101", name: "Rajesh Kumar", candidate: "Party A - S. Sharma", table: "Table-1", status: "Verified" },
    { id: "AGT-102", name: "Sita Devi", candidate: "Party B - V. Singh", table: "Table-1", status: "Verified" },
    { id: "AGT-103", name: "Amit Patel", candidate: "Party A - S. Sharma", table: "Table-2", status: "Pending" },
    { id: "AGT-104", name: "John Doe", candidate: "Party C - R. Das", table: "Table-3", status: "Rejected" },
  ];

  const renderSkeleton = () => (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ height: "120px", flex: 1, backgroundColor: "#e2e8f0", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
        <div style={{ height: "120px", flex: 1, backgroundColor: "#e2e8f0", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
        <div style={{ height: "120px", flex: 1, backgroundColor: "#e2e8f0", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
      </div>
      <div style={{ height: "300px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
      <div style={{ height: "200px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );

  const renderDashboard = () => {
    const totalVoters = stats?.totalVoters || 254000;
    const turnoutPercentage = stats?.turnoutPercentage || 68.5;
    const totalComplaints = stats?.totalComplaints || complaints.length;
    const nomination = stats?.nomination || { filed: 18, accepted: 14, rejected: 4 };
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const turnoutOffset = circumference - (turnoutPercentage / 100) * circumference;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #2563eb" }}>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 600 }}>Total Registered Voters</p>
            <h2 style={{ fontSize: "2rem", color: "#1e293b", margin: 0 }}>{fmt?.number ? fmt.number(totalVoters) : totalVoters.toLocaleString()}</h2>
            <p style={{ fontSize: "0.8rem", color: "#2563eb", marginTop: "0.5rem" }}>Assembly Constituency: {district}</p>
          </div>
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #10b981", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 600 }}>Estimated Turnout</p>
              <h2 style={{ fontSize: "2rem", color: "#1e293b", margin: 0 }}>{turnoutPercentage}%</h2>
            </div>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#10b981" strokeWidth="12"
                strokeDasharray={circumference} strokeDashoffset={turnoutOffset}
                strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
          </div>
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", borderLeft: "5px solid #f59e0b" }}>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "0.5rem", fontWeight: 600 }}>Active Incidents</p>
            <h2 style={{ fontSize: "2rem", color: "#1e293b", margin: 0 }}>{totalComplaints}</h2>
            <p style={{ fontSize: "0.8rem", color: "#f59e0b", marginTop: "0.5rem" }}>Pending Resolution</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileCheck size={20} color="#2563eb" /> Nomination Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Filed", value: nomination.filed, color: "#3b82f6", max: nomination.filed },
                { label: "Accepted", value: nomination.accepted, color: "#10b981", max: nomination.filed },
                { label: "Rejected", value: nomination.rejected, color: "#ef4444", max: nomination.filed },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#475569" }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.value}</span>
                  </div>
                  <svg width="100%" height="10" style={{ background: "#f1f5f9", borderRadius: "5px" }}>
                    <rect width={`${(item.value / item.max) * 100}%`} height="10" fill={item.color} rx="5" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", maxHeight: "400px", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={20} color="#ef4444" /> Live Incidents
            </h3>
            {complaints.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                <CheckCircle size={40} color="#10b981" style={{ margin: "0 auto 1rem" }} />
                <p>No active incidents reported.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {complaints.slice(0, 5).map((c) => (
                  <div key={c._id || c.id} style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "#1e293b", fontSize: "0.95rem" }}>{c.type || c.category || "General Incident"}</h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <MapPin size={12} /> {c.location || c.pollingStation || "Unknown Location"}
                      </p>
                    </div>
                    <span style={{ padding: "0.25rem 0.75rem", background: c.status === "Resolved" ? "#dcfce7" : "#fee2e2", color: c.status === "Resolved" ? "#166534" : "#991b1b", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {c.status || "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderForm17C = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem", fontWeight: "bold" }}>Form 17C vs EVM Count</h2>
            <p style={{ margin: "0.5rem 0 0", color: "#64748b" }}>Cross-verifying Presiding Officer manual accounts with EVM machine totals.</p>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600 }}>Polling Station</th>
                <th style={{ padding: "1rem", fontWeight: 600 }}>Location</th>
                <th style={{ padding: "1rem", fontWeight: 600 }}>Votes Polled (Form 17C)</th>
                <th style={{ padding: "1rem", fontWeight: 600 }}>EVM Count</th>
                <th style={{ padding: "1rem", fontWeight: 600 }}>Mismatch Alert</th>
              </tr>
            </thead>
            <tbody>
              {form17CData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: row.status === "Mismatch" ? "#fef2f2" : "#ffffff" }}>
                  <td style={{ padding: "1rem", fontWeight: 500, color: "#1e293b" }}>{row.psId}</td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>{row.name}</td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{row.form17C}</td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{row.evm}</td>
                  <td style={{ padding: "1rem" }}>
                    {row.status === "Mismatch" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#dc2626", fontWeight: 600, background: "#fee2e2", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>
                        <ShieldAlert size={14} /> Mismatch Detected
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#16a34a", fontWeight: 600, background: "#dcfce7", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>
                        <CheckCircle size={14} /> Verified Match
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCountingRoom = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calculator size={24} color="#4f46e5" /> Live Counting Operations
          </h2>
          <p style={{ margin: 0, color: "#64748b" }}>Real-time tabulation of EVM results from Strong Room.</p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
            <div>
              <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Current Round</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>14 / 20</div>
            </div>
            <div>
              <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Leading Candidate</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>Party A - S. Sharma</div>
            </div>
            <div>
              <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Lead Margin</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3b82f6" }}>+1,450 Votes</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#1e293b" }}>VVPAT Verification Progress</h3>
        <div style={{ height: "12px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden", marginBottom: "0.5rem" }}>
          <div style={{ height: "100%", width: "40%", background: "#8b5cf6" }}></div>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, textAlign: "right" }}>2 / 5 Polling Stations Verified</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {countingTables.map((table) => (
          <div key={table.id} style={{
            background: "#fff", padding: "1rem", borderRadius: "8px",
            border: `1px solid ${table.status === "Completed" ? "#10b981" : table.status === "Counting EVM..." ? "#3b82f6" : "#e2e8f0"}`,
            borderLeft: `4px solid ${table.status === "Completed" ? "#10b981" : table.status === "Counting EVM..." ? "#3b82f6" : "#94a3b8"}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <strong style={{ color: "#1e293b" }}>{table.id}</strong>
              <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: "4px", color: "#475569" }}>R-{table.round}</span>
            </div>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: table.status === "Completed" ? "#10b981" : table.status === "Counting EVM..." ? "#3b82f6" : "#64748b", fontWeight: 600 }}>
              {table.status === "Counting EVM..." ? <Activity size={14} style={{ display: "inline", marginRight: "4px" }} /> : null}
              {table.status}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Last EVM: {table.lastEVM}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgentManagement = () => (
    <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      <h2 style={{ margin: "0 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Users size={24} color="#3b82f6" /> Digital Agent Management
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "1rem", fontWeight: 600 }}>Agent ID</th>
              <th style={{ padding: "1rem", fontWeight: 600 }}>Agent Name</th>
              <th style={{ padding: "1rem", fontWeight: 600 }}>Representing Candidate</th>
              <th style={{ padding: "1rem", fontWeight: 600 }}>Assigned Table</th>
              <th style={{ padding: "1rem", fontWeight: 600 }}>Verification Status</th>
            </tr>
          </thead>
          <tbody>
            {agentData.map((agent, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem", fontWeight: 500, color: "#3b82f6" }}>{agent.id}</td>
                <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 500 }}>{agent.name}</td>
                <td style={{ padding: "1rem", color: "#64748b" }}>{agent.candidate}</td>
                <td style={{ padding: "1rem", color: "#475569" }}>{agent.table}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    display: "inline-flex", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                    background: agent.status === "Verified" ? "#dcfce7" : agent.status === "Rejected" ? "#fee2e2" : "#fef3c7",
                    color: agent.status === "Verified" ? "#166534" : agent.status === "Rejected" ? "#991b1b" : "#b45309",
                  }}>
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPostalBallots = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Mail size={24} color="#8b5cf6" /> Postal Ballot Tracking
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
        {[
          { label: "Total Applied", val: "5,000", color: "#64748b", bg: "#f1f5f9" },
          { label: "Dispatched", val: "4,950", color: "#3b82f6", bg: "#eff6ff" },
          { label: "Received Back", val: "4,100", color: "#8b5cf6", bg: "#f5f3ff" },
          { label: "Accepted for Counting", val: "4,000", color: "#10b981", bg: "#ecfdf5" },
          { label: "Rejected", val: "100", color: "#ef4444", bg: "#fef2f2" },
        ].map((stat, idx) => (
          <div key={idx} style={{ background: stat.bg, padding: "1.5rem", borderRadius: "12px", textAlign: "center", border: `1px solid ${stat.color}33` }}>
            <h3 style={{ fontSize: "2rem", color: stat.color, margin: "0 0 0.5rem 0" }}>{stat.val}</h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", fontWeight: 500 }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", maxWidth: "600px" }}>
      <h2 style={{ margin: "0 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Settings size={24} color="#64748b" /> System Settings
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#475569", fontWeight: 500 }}>User Name</label>
          <input type="text" value={user?.name || ""} readOnly style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b" }} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#475569", fontWeight: 500 }}>Role</label>
          <input type="text" value={user?.role || "Returning Officer"} readOnly style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b" }} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#475569", fontWeight: 500 }}>Assigned Constituency</label>
          <input type="text" value={district} readOnly style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b" }} />
        </div>
        <button style={{ padding: "0.75rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderSkeleton();
    if (error) return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        <AlertTriangle size={48} style={{ margin: "0 auto 1rem" }} />
        <h2>{error}</h2>
        <button onClick={fetchDashboardData} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Retry</button>
      </div>
    );
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "form17c": return renderForm17C();
      case "counting": return renderCountingRoom();
      case "agents": return renderAgentManagement();
      case "postal": return renderPostalBallots();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Premium Dark Sidebar */}
      <aside style={{ backgroundColor: "#0f172a", width: "240px", minHeight: "100vh", padding: "0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert color="#4f46e5" size={18} /> Election Manager
          </h1>
          <span style={{ display: "inline-block", background: "#4f46e5", color: "#fff", fontSize: "0.7rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.03em" }}>
            Returning Officer
          </span>
        </div>

        {/* User info */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f1f5f9" }}>{user?.name || "RO Admin"}</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{district}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  background: isActive ? "#4f46e5" : "transparent",
                  border: "none", width: "100%", cursor: "pointer", textAlign: "left",
                  fontSize: "0.95rem", fontWeight: "500", borderRadius: "8px",
                  transition: "background 0.15s, color 0.15s", fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#ffffff"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
              >
                <Icon size={16} style={{ color: isActive ? "#ffffff" : "#64748b", flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: "0.6rem", background: "#d97706", color: "#fff", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: "bold" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Logout */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={onLogout}
            style={{ width: "100%", background: "#ef4444", color: "#ffffff", padding: "12px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", border: "none", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'Inter', system-ui, sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ef4444"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a", fontWeight: 600 }}>
            {menuItems.find((m) => m.id === activeTab)?.label}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem" }}>
            <Clock size={14} /> Last updated: {new Date().toLocaleTimeString()}
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ReturningOfficerDashboard;
