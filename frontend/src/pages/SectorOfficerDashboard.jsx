import React, { useState, useEffect } from "react";
import { emApi, fmt } from "../api/emApi.js";


const SectorOfficerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [booths] = useState([
    { id: 101, name: "Booth 101 - Primary School", status: "Running", queue: "Normal", visited: true, visitTime: "08:30 AM", gps: { x: 50, y: 50 } },
    { id: 102, name: "Booth 102 - Town Hall", status: "Running", queue: "High", visited: true, visitTime: "10:15 AM", gps: { x: 150, y: 80 } },
    { id: 103, name: "Booth 103 - Govt College", status: "EVM Fault", queue: "Stopped", visited: false, visitTime: null, gps: { x: 250, y: 40 } },
    { id: 104, name: "Booth 104 - Health Center", status: "Ready", queue: "Low", visited: false, visitTime: null, gps: { x: 350, y: 120 } },
    { id: 105, name: "Booth 105 - Panchayat Bhawan", status: "Running", queue: "Normal", visited: false, visitTime: null, gps: { x: 100, y: 150 } },
    { id: 106, name: "Booth 106 - Girls School", status: "High Queue", queue: "High", visited: false, visitTime: null, gps: { x: 300, y: 180 } },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const constituency = user?.district || "AC-123";
        const data = await emApi.getComplaints(`?constituency=${encodeURIComponent(constituency)}`);
        const fetchedComplaints = Array.isArray(data) ? data : data?.data || [];
        setComplaints(fetchedComplaints);
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
        setError("Failed to load active incidents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        id: `EVM-${Math.floor(1000 + Math.random() * 9000)}-XYZ`,
        time: new Date().toLocaleTimeString(),
        status: "Verified & Collected",
        signature: "✓ Digitally Signed",
      });
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Running": return "#10b981";
      case "Ready": return "#3b82f6";
      case "EVM Fault": return "#ef4444";
      case "High Queue": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const navItems = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "visit", label: "📍 Visit Tracker" },
    { id: "evm", label: "📦 EVM Handover" },
    { id: "incident", label: "⚠️ Incident Reporter" },
    { id: "route", label: "🗺️ Route Optimization" },
  ];

  const renderSkeleton = () => (
    <div style={{ padding: "1.5rem" }}>
      <div className="skeleton-pulse" style={{ height: "30px", width: "200px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "20px" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "20px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-pulse" style={{ height: "80px", background: "#e2e8f0", borderRadius: "8px" }}></div>
        ))}
      </div>
      <div className="skeleton-pulse" style={{ height: "200px", background: "#e2e8f0", borderRadius: "8px", marginBottom: "20px" }}></div>
      <div className="skeleton-pulse" style={{ height: "200px", background: "#e2e8f0", borderRadius: "8px" }}></div>
    </div>
  );

  return (
    <>
      <style>{`
        .so-layout { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', system-ui, sans-serif; }
        .so-sidebar { background-color: #0f172a; width: 240px; min-height: 100vh; padding: 0; display: flex; flex-direction: column; flex-shrink: 0; }
        .so-sidebar-header { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .so-app-name { margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 700; color: #ffffff; }
        .so-role-badge { display: inline-block; background: #4f46e5; color: #fff; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; letter-spacing: 0.03em; }
        .so-nav { padding: 12px 12px 0 12px; display: flex; flex-direction: column; gap: 2px; }
        .so-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #94a3b8; background: transparent; border: none; width: 100%; cursor: pointer; text-align: left; font-size: 0.95rem; font-weight: 500; border-radius: 8px; transition: background 0.15s, color 0.15s; }
        .so-nav-btn:hover:not(.active) { background: rgba(255,255,255,0.06); color: #ffffff; }
        .so-nav-btn.active { background: #4f46e5; color: #ffffff; }
        .so-sidebar-spacer { flex: 1; }
        .so-logout-wrapper { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); }
        .so-logout-btn { width: 100%; background: #ef4444; color: #ffffff; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; font-family: 'Inter', system-ui, sans-serif; }
        .so-logout-btn:hover { background: #dc2626; }
        .so-main { flex: 1; background-color: #ffffff; display: flex; flex-direction: column; overflow-y: auto; }
        .so-header { padding: 1.5rem 1.5rem 0.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
        .so-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0; }
        .so-subtitle { color: #64748b; font-size: 0.875rem; margin: 0; }
        .so-content { padding: 0 1.5rem 1.5rem; flex: 1; }
        .action-btn { border: none; padding: 1rem; border-radius: 0.5rem; font-weight: 600; color: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: transform 0.1s; }
        .action-btn:active { transform: scale(0.98); }
        .btn-red { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .btn-orange { background: linear-gradient(135deg, #f97316, #ea580c); }
        .btn-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .btn-green { background: linear-gradient(135deg, #10b981, #059669); }
        .btn-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }
        .card-title { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        .booth-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .booth-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 0.5rem; border-left: 4px solid #cbd5e1; }
        .scanner-box { width: 100%; max-width: 300px; height: 300px; background: #000; border: 4px solid #3b82f6; border-radius: 1rem; position: relative; margin: 0 auto 1.5rem; overflow: hidden; }
        .scan-line { position: absolute; width: 100%; height: 3px; background: #22c55e; box-shadow: 0 0 10px #22c55e; animation: scan 1.5s infinite linear; }
        .skeleton-pulse { animation: pulse 1.5s infinite ease-in-out; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scan { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        @media (min-width: 768px) {
          .so-layout { flex-direction: row; }
          .so-main { height: 100vh; }
        }
      `}</style>

      <div className="so-layout">
        <aside className="so-sidebar">
          <div className="so-sidebar-header">
            <h2 className="so-app-name">Command App</h2>
            <span className="so-role-badge">Sector Officer</span>
          </div>

          <nav className="so-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`so-nav-btn${activeTab === item.id ? " active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="so-sidebar-spacer" />

          <div className="so-logout-wrapper">
            <button className="so-logout-btn" onClick={onLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        <main className="so-main">
          <header className="so-header">
            <h1 className="so-title">Welcome, {user?.name || "Sector Officer"}</h1>
            <p className="so-subtitle">{user?.district || "AC-123"} | {booths.length} Booths Assigned</p>
          </header>

          {loading ? (
            renderSkeleton()
          ) : (
            <div className="so-content">
              {error && (
                <div style={{ padding: "1rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              {activeTab === "dashboard" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                    <button className="action-btn btn-red" onClick={() => setActiveTab("incident")}>
                      <span style={{ fontSize: "1.5rem" }}>⚠️</span>Report Incident
                    </button>
                    <button className="action-btn btn-orange" onClick={() => setActiveTab("incident")}>
                      <span style={{ fontSize: "1.5rem" }}>🔌</span>EVM Fault
                    </button>
                    <button className="action-btn btn-blue">
                      <span style={{ fontSize: "1.5rem" }}>📈</span>Submit Turnout
                    </button>
                    <button className="action-btn btn-green" onClick={() => setActiveTab("visit")}>
                      <span style={{ fontSize: "1.5rem" }}>📍</span>Visit Booth
                    </button>
                    <button className="action-btn btn-purple" onClick={() => setActiveTab("evm")}>
                      <span style={{ fontSize: "1.5rem" }}>📱</span>Collect EVM
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    <div className="card">
                      <h3 className="card-title">Status Board</h3>
                      <ul className="booth-list">
                        {booths.map((booth) => (
                          <li key={booth.id} className="booth-item" style={{ borderLeftColor: getStatusColor(booth.status) }}>
                            <div>
                              <div style={{ fontWeight: "600", color: "#1e293b" }}>{booth.name}</div>
                              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Queue: {booth.queue}</div>
                            </div>
                            <div style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: "500", background: `${getStatusColor(booth.status)}20`, color: getStatusColor(booth.status) }}>
                              {booth.status}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card">
                      <h3 className="card-title">Active Incidents</h3>
                      {complaints.length === 0 ? (
                        <p style={{ color: "#64748b", textAlign: "center", padding: "2rem 0" }}>No active incidents reported.</p>
                      ) : (
                        <ul className="booth-list">
                          {complaints.slice(0, 5).map((c) => (
                            <li key={c._id || c.id} className="booth-item" style={{ borderLeftColor: "#ef4444" }}>
                              <div>
                                <div style={{ fontWeight: "600", color: "#1e293b" }}>{c.type || "General Incident"}</div>
                                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{c.description?.substring(0, 40)}...</div>
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                {fmt ? fmt.date(c.createdAt) : new Date(c.createdAt || Date.now()).toLocaleDateString()}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {complaints.length > 5 && (
                        <button style={{ width: "100%", padding: "0.75rem", marginTop: "1rem", background: "#f1f5f9", border: "none", borderRadius: "0.5rem", color: "#475569", cursor: "pointer" }} onClick={() => setActiveTab("incident")}>
                          View All Incidents
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "visit" && (
                <div className="card">
                  <h3 className="card-title">GPS Visit Verification</h3>
                  <div style={{ marginBottom: "1.5rem", background: "#e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
                    <svg viewBox="0 0 400 200" style={{ width: "100%", height: "auto", display: "block" }}>
                      <rect width="400" height="200" fill="#f8fafc" />
                      {[0, 1, 2, 3, 4].map((i) => (
                        <React.Fragment key={`grid-${i}`}>
                          <line x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#e2e8f0" strokeWidth="2" />
                          <line x1={i * 100} y1="0" x2={i * 100} y2="200" stroke="#e2e8f0" strokeWidth="2" />
                        </React.Fragment>
                      ))}
                      {booths.map((b) => (
                        <line key={`line-${b.id}`} x1="200" y1="100" x2={b.gps.x} y2={b.gps.y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
                      ))}
                      {booths.map((b) => (
                        <g key={`marker-${b.id}`}>
                          <circle cx={b.gps.x} cy={b.gps.y} r="8" fill={b.visited ? "#10b981" : "#94a3b8"} stroke="#fff" strokeWidth="2" />
                          <text x={b.gps.x} y={b.gps.y - 12} fontSize="10" textAnchor="middle" fill="#475569" fontWeight="600">{b.id}</text>
                        </g>
                      ))}
                      <circle cx="200" cy="100" r="6" fill="#3b82f6" />
                      <circle cx="200" cy="100" r="16" fill="#3b82f6" opacity="0.2" />
                      <text x="200" y="125" fontSize="12" textAnchor="middle" fill="#1e40af" fontWeight="bold">You are here</text>
                    </svg>
                  </div>
                  <ul className="booth-list">
                    {booths.map((booth) => (
                      <li key={`list-${booth.id}`} className="booth-item" style={{ borderLeftColor: booth.visited ? "#10b981" : "#cbd5e1" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#1e293b" }}>{booth.name}</div>
                          <div style={{ fontSize: "0.875rem", color: booth.visited ? "#10b981" : "#64748b" }}>
                            {booth.visited ? `Visited: ${booth.visitTime} (GPS Verified ✓)` : "Pending Visit"}
                          </div>
                        </div>
                        {!booth.visited && (
                          <button style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}>
                            Check In
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "evm" && (
                <div className="card" style={{ textAlign: "center" }}>
                  <h3 className="card-title">EVM Collection &amp; QR Handover</h3>
                  <p style={{ color: "#64748b", marginBottom: "2rem" }}>Scan the QR code on the EVM carrying case to verify handover.</p>
                  {!scanResult ? (
                    <>
                      <div className="scanner-box">
                        {isScanning && <div className="scan-line" />}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>
                          {isScanning ? "Scanning..." : "Camera Viewfinder"}
                        </div>
                      </div>
                      <button
                        onClick={handleScan}
                        disabled={isScanning}
                        style={{ padding: "1rem 2rem", fontSize: "1.125rem", background: isScanning ? "#94a3b8" : "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: isScanning ? "not-allowed" : "pointer", fontWeight: "600" }}
                      >
                        {isScanning ? "Processing..." : "Simulate QR Scan"}
                      </button>
                    </>
                  ) : (
                    <div style={{ maxWidth: "400px", margin: "0 auto", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "1rem", padding: "2rem" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                      <h4 style={{ color: "#166534", margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>EVM Verified Successfully</h4>
                      <div style={{ background: "white", padding: "1rem", borderRadius: "0.5rem", margin: "1rem 0", textAlign: "left" }}>
                        <p style={{ margin: "0.25rem 0" }}><strong>EVM ID:</strong> {scanResult.id}</p>
                        <p style={{ margin: "0.25rem 0" }}><strong>Time:</strong> {scanResult.time}</p>
                        <p style={{ margin: "0.25rem 0" }}><strong>Status:</strong> {scanResult.status}</p>
                      </div>
                      <div style={{ color: "#15803d", fontWeight: "bold" }}>{scanResult.signature}</div>
                      <button
                        onClick={() => setScanResult(null)}
                        style={{ width: "100%", padding: "0.75rem", marginTop: "1.5rem", background: "#22c55e", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}
                      >
                        Scan Next EVM
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "incident" && (
                <div className="card">
                  <h3 className="card-title">Incident Reporter</h3>
                  <div style={{ display: "flex", gap: "1rem", flexDirection: "column", maxWidth: "600px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Select Booth</label>
                      <select style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", background: "white" }}>
                        <option>Select a booth...</option>
                        {booths.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Incident Type</label>
                      <select style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", background: "white" }}>
                        <option>EVM Malfunction</option>
                        <option>Law &amp; Order Issue</option>
                        <option>Voter Intimidation</option>
                        <option>Long Queue Delay</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Description &amp; Remarks</label>
                      <textarea rows={4} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", resize: "vertical" }} placeholder="Provide details here..."></textarea>
                    </div>
                    <button style={{ padding: "1rem", background: "#ef4444", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600", fontSize: "1rem" }}>
                      Submit Urgent Report
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "route" && (
                <div className="card">
                  <h3 className="card-title">AI Route Optimization</h3>
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ fontSize: "2rem" }}>🚨</div>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.125rem" }}>Priority Target: Booth 103</h4>
                      <p style={{ margin: 0 }}>Critical EVM Fault reported. Estimated travel time: <strong>8 mins away</strong>.</p>
                    </div>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                    <svg viewBox="0 0 400 200" style={{ width: "100%", height: "auto", display: "block" }}>
                      <path d="M50,150 Q150,150 200,100 T300,50" fill="none" stroke="#cbd5e1" strokeWidth="8" />
                      <path d="M50,150 Q150,150 200,100 T250,40" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6,6" />
                      <circle cx="150" cy="80" r="6" fill="#94a3b8" />
                      <circle cx="350" cy="120" r="6" fill="#94a3b8" />
                      <circle cx="250" cy="40" r="10" fill="#ef4444" />
                      <circle cx="250" cy="40" r="20" fill="#ef4444" opacity="0.3" />
                      <text x="250" y="20" fontSize="12" fill="#b91c1c" textAnchor="middle" fontWeight="bold">Booth 103</text>
                      <circle cx="50" cy="150" r="8" fill="#10b981" />
                      <text x="50" y="175" fontSize="12" fill="#047857" textAnchor="middle" fontWeight="bold">Your Location</text>
                    </svg>
                  </div>
                  <button style={{ width: "100%", padding: "1rem", marginTop: "1.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600", fontSize: "1rem" }}>
                    Start Navigation
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default SectorOfficerDashboard;
