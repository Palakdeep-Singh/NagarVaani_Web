import React, { useState } from "react";
import { emApi, fmt } from "../api/emApi.js";


const PollingOfficerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("po1-search");

  // PO1 State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // PO2 State
  const [po2Steps, setPo2Steps] = useState({ verified: false, inkApplied: false, allowed: false });

  // PO3 State
  const [evmStatus, setEvmStatus] = useState("Ready for next voter");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchResults([
      { id: 1, name: "Aarav Sharma", epic: "XYZ9876543", phone: "9876543210", pwd: false, verified: false },
      { id: 2, name: "Sunita Devi", epic: "ABC1234567", phone: "9123456780", pwd: true, pwdDetails: "Wheelchair Needed", verified: false },
    ]);
  };

  const handleVerify = (id) => {
    setSearchResults((results) =>
      results.map((r) => (r.id === id ? { ...r, verified: true } : r))
    );
  };

  const navItems = [
    { id: "po1-search", label: "🔍 PO-1: Voter Search" },
    { id: "po2-ink", label: "🖊️ PO-2: Ink & Entry" },
    { id: "po3-evm", label: "🗳️ PO-3: EVM Control" },
    { id: "analytics", label: "📊 Queue Analytics" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "po1-search":
        return (
          <div className="po-section">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>PO-1: Smart Voter Search</h2>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
              <input
                type="text"
                placeholder="Search by Name, EPIC, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: "12px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" }}
              />
              <button type="submit" style={{ padding: "12px 24px", backgroundColor: "#0a192f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" }}>
                Search
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {searchResults.length > 0 ? (
                searchResults.map((voter) => (
                  <div key={voter.id} style={{ border: "1px solid #eee", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: voter.verified ? "#f0fdf4" : "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <div>
                      <h3 style={{ margin: "0 0 8px 0", color: "#111" }}>{voter.name}</h3>
                      <p style={{ margin: "0 0 4px 0", color: "#666" }}><strong>EPIC:</strong> {voter.epic} | <strong>Phone:</strong> {voter.phone}</p>
                      {voter.pwd && (
                        <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 8px", backgroundColor: "#fff7ed", color: "#c2410c", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", border: "1px solid #fed7aa" }}>
                          Accessibility Assistant: PwD Voter - {voter.pwdDetails}
                        </span>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => handleVerify(voter.id)}
                        disabled={voter.verified}
                        style={{ padding: "10px 20px", backgroundColor: voter.verified ? "#22c55e" : "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: voter.verified ? "default" : "pointer", fontWeight: "bold" }}
                      >
                        {voter.verified ? "✓ Verified" : "Verify Identity"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#888", textAlign: "center", padding: "40px 0" }}>Enter a query to locate a voter instantly.</p>
              )}
            </div>
          </div>
        );

      case "po2-ink":
        return (
          <div className="po-section">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>PO-2: Ink &amp; Entry Control</h2>
            <div style={{ maxWidth: "600px", backgroundColor: "#f8fafc", padding: "30px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p style={{ color: "#475569", marginBottom: "20px" }}>Process the current voter by completing the required sequence.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", color: "#334155", cursor: "pointer" }}>
                  <input type="checkbox" checked={po2Steps.verified} onChange={(e) => setPo2Steps({ ...po2Steps, verified: e.target.checked })} style={{ width: "20px", height: "20px" }} />
                  Voter Details Verified against Register (17A)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", color: "#334155", cursor: po2Steps.verified ? "pointer" : "not-allowed", opacity: po2Steps.verified ? 1 : 0.5 }}>
                  <input type="checkbox" disabled={!po2Steps.verified} checked={po2Steps.inkApplied} onChange={(e) => setPo2Steps({ ...po2Steps, inkApplied: e.target.checked })} style={{ width: "20px", height: "20px" }} />
                  Indelible Ink Applied
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", color: "#334155", cursor: po2Steps.inkApplied ? "pointer" : "not-allowed", opacity: po2Steps.inkApplied ? 1 : 0.5 }}>
                  <input type="checkbox" disabled={!po2Steps.inkApplied} checked={po2Steps.allowed} onChange={(e) => setPo2Steps({ ...po2Steps, allowed: e.target.checked })} style={{ width: "20px", height: "20px" }} />
                  Voter Slip Issued / Allowed to Vote
                </label>
              </div>
              <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #cbd5e1" }}>
                <button
                  disabled={!po2Steps.allowed}
                  onClick={() => {
                    alert("Voter officially processed by PO-2!");
                    setPo2Steps({ verified: false, inkApplied: false, allowed: false });
                  }}
                  style={{ width: "100%", padding: "15px", backgroundColor: po2Steps.allowed ? "#22c55e" : "#94a3b8", color: "#fff", border: "none", borderRadius: "4px", fontSize: "18px", fontWeight: "bold", cursor: po2Steps.allowed ? "pointer" : "not-allowed" }}
                >
                  Complete Processing
                </button>
              </div>
            </div>
          </div>
        );

      case "po3-evm":
        return (
          <div className="po-section">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>PO-3: EVM Control</h2>
            <div style={{ display: "flex", gap: "40px" }}>
              <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#475569", fontSize: "24px", margin: "0 0 10px 0" }}>Control Unit Status</h3>
                  <div style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    backgroundColor: evmStatus === "Ready for next voter" ? "#fef08a" : evmStatus === "Ballot Enabled" ? "#bbf7d0" : "#bfdbfe",
                    color: evmStatus === "Ready for next voter" ? "#854d0e" : evmStatus === "Ballot Enabled" ? "#166534" : "#1e40af",
                  }}>
                    {evmStatus}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                  <button
                    onClick={() => setEvmStatus("Ballot Enabled")}
                    disabled={evmStatus === "Ballot Enabled"}
                    style={{
                      width: "200px", height: "200px", borderRadius: "50%",
                      backgroundColor: evmStatus === "Ballot Enabled" ? "#94a3b8" : "#3b82f6",
                      color: "#fff", fontSize: "24px", fontWeight: "bold", border: "none",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)", cursor: evmStatus === "Ballot Enabled" ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    BALLOT BUTTON
                  </button>
                  {evmStatus === "Ballot Enabled" && (
                    <button onClick={() => setEvmStatus("Vote Recorded")} style={{ padding: "10px 20px", backgroundColor: "#22c55e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "20px" }}>
                      Simulate Vote Cast
                    </button>
                  )}
                  {evmStatus === "Vote Recorded" && (
                    <button onClick={() => setEvmStatus("Ready for next voter")} style={{ padding: "10px 20px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "20px" }}>
                      Reset for Next Voter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="po-section">
            <h2 style={{ marginBottom: "20px", color: "#333" }}>Queue &amp; Performance Analytics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Processing Rate</p>
                <h3 style={{ margin: "0", color: "#0f172a", fontSize: "28px" }}>180 <span style={{ fontSize: "16px", fontWeight: "normal", color: "#64748b" }}>voters/hr</span></h3>
              </div>
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Avg Verification Time</p>
                <h3 style={{ margin: "0", color: "#0f172a", fontSize: "28px" }}>45 <span style={{ fontSize: "16px", fontWeight: "normal", color: "#64748b" }}>sec</span></h3>
              </div>
              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Current Queue Size</p>
                <h3 style={{ margin: "0", color: "#0f172a", fontSize: "28px" }}>12 <span style={{ fontSize: "16px", fontWeight: "normal", color: "#64748b" }}>people</span></h3>
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ marginTop: 0, color: "#334155" }}>Hourly Processing Trend</h3>
              <svg width="100%" height="250" viewBox="0 0 800 250" style={{ overflow: "visible" }}>
                <line x1="50" y1="200" x2="750" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="50" y1="150" x2="750" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="100" x2="750" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="50" x2="750" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <text x="40" y="205" fontSize="12" fill="#64748b" textAnchor="end">0</text>
                <text x="40" y="155" fontSize="12" fill="#64748b" textAnchor="end">50</text>
                <text x="40" y="105" fontSize="12" fill="#64748b" textAnchor="end">100</text>
                <text x="40" y="55" fontSize="12" fill="#64748b" textAnchor="end">150</text>
                <text x="100" y="225" fontSize="12" fill="#64748b" textAnchor="middle">8 AM</text>
                <text x="250" y="225" fontSize="12" fill="#64748b" textAnchor="middle">9 AM</text>
                <text x="400" y="225" fontSize="12" fill="#64748b" textAnchor="middle">10 AM</text>
                <text x="550" y="225" fontSize="12" fill="#64748b" textAnchor="middle">11 AM</text>
                <text x="700" y="225" fontSize="12" fill="#64748b" textAnchor="middle">12 PM</text>
                <rect x="80" y="120" width="40" height="80" fill="#3b82f6" rx="4" />
                <rect x="230" y="60" width="40" height="140" fill="#3b82f6" rx="4" />
                <rect x="380" y="40" width="40" height="160" fill="#3b82f6" rx="4" />
                <rect x="530" y="70" width="40" height="130" fill="#3b82f6" rx="4" />
                <rect x="680" y="110" width="40" height="90" fill="#3b82f6" rx="4" />
                <text x="100" y="110" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">80</text>
                <text x="250" y="50" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">140</text>
                <text x="400" y="30" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">160</text>
                <text x="550" y="60" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">130</text>
                <text x="700" y="100" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">90</text>
              </svg>
            </div>
          </div>
        );

      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ backgroundColor: "#0f172a", width: "240px", minHeight: "100vh", padding: "0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>Polling Officer</div>
          <span style={{ display: "inline-block", background: "#4f46e5", color: "#fff", fontSize: "0.7rem", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.03em" }}>
            {user?.name || "Officer"}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 12px 0 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => {
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
                {item.label}
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
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default PollingOfficerDashboard;
