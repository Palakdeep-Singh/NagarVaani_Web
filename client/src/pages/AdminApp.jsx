import { useState, useEffect, useContext } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

export default function AdminApp() {
  const { user, logout } = useContext(AuthContext);
  const [role, setRole] = useState("district");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    API.get("/api/admin/users").then(r => setUsers(r.data || [])).catch(() => { });
  }, []);

  const toggleSelect = id => setSelected(s => ({ ...s, [id]: !s[id] }));
  const selectAll = (checked) => {
    const map = {};
    users.forEach(u => map[u.id] = checked);
    setSelected(map);
  };

  const bulkAction = (action) => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return alert("Select at least one row");
    // TODO: call API
    alert(`${action === "approve" ? "Approved" : "Rejected"} ${ids.length} records`);
  };

  const adminName = { district: "DC Priya Sharma", state: "CS Maharashtra", central: "Central Command" };
  const adminAv = { district: "DC", state: "SC", central: "CE" };

  return (
    <div id="app-admin" className="app on">
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">🏛</div>
          <div className="nav-brand-txt">NagarikConnect Admin <span>{{ district: "District Authority", state: "State Authority", central: "Central Command" }[role]}</span></div>
        </div>
        <div className="nav-tabs">
          {["district", "state", "central"].map(r => (
            <button key={r} className={`ntab${role === r ? " on" : ""}`} onClick={() => setRole(r)}>
              {r === "district" ? "🏛 District" : r === "state" ? "🗺 State" : "🏛 Central"}
            </button>
          ))}
        </div>
        <div className="nav-r">
          <div className="nav-user">
            <div className="nav-av">{adminAv[role]}</div>
            <div className="nav-uname">{adminName[role]}</div>
          </div>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          {role === "district" && <DistrictSidebar />}
          {role === "state" && <StateSidebar />}
          {role === "central" && <CentralSidebar />}
        </aside>
        <main className="main">
          {role === "district" && <DistrictMain users={users} selected={selected} toggleSelect={toggleSelect} selectAll={selectAll} bulkAction={bulkAction} />}
          {role === "state" && <StateMain />}
          {role === "central" && <CentralMain />}
        </main>
      </div>
    </div>
  );
}

// ── DISTRICT ──────────────────────────────────────────────────────────────────
function DistrictSidebar() {
  return (
    <>
      <div className="s-lbl">Latur District</div>
      <div className="si on"><span className="si-ic">✅</span>Bulk Verify <span className="sbadge">12</span></div>
      <div className="si"><span className="si-ic">⏱</span>SLA Monitor <span className="sbadge">3</span></div>
      <div className="si"><span className="si-ic">🗺</span>Coverage Map</div>
      <div className="si"><span className="si-ic">📢</span>Complaints <span className="sbadge">14</span></div>
      <div className="sb-profile" style={{ margin: "12px 8px 0", background: "var(--nv-l)", borderRadius: "var(--r)", padding: 11 }}>
        <div className="sbp-name" style={{ color: "var(--nv)" }}>Latur District</div>
        <div className="sbp-sub">Maharashtra · DC Office</div>
        <div className="sbp-sub" style={{ marginTop: 4 }}>DC Priya Sharma</div>
      </div>
    </>
  );
}

function DistrictMain({ users, selected, toggleSelect, selectAll, bulkAction }) {
  const [vRows, setVRows] = useState([
    { id: "v1", av: "MK", avClr: "gn", name: "Mahesh Kadam", ward: "Ward 7", scheme: "PM Kisan", ms: "M1 Registration", doc: "📄 Aadhaar.pdf", docCls: "p-bl", status: "Pending", stCls: "p-am", submitted: true },
    { id: "v2", av: "SK", avClr: "am", name: "Sunita Kulkarni", ward: "Ward 3", scheme: "PMJAY", ms: "M2 Photo", doc: "⚠ Blurry", docCls: "p-rd", status: "Rejected", stCls: "p-rd", submitted: false },
    { id: "v3", av: "RP", avClr: "nv", name: "Raju Patil", ward: "Ward 12", scheme: "PMAY", ms: "M1 Application", doc: "✓ Complete", docCls: "p-gn", status: "Pending", stCls: "p-am", submitted: true },
    { id: "v4", av: "RK", avClr: "rd", name: "Ramesh Kumar", ward: "Ward 4", scheme: "PM Kisan", ms: "M3 Bank fix", doc: "📄 Passbook re-uploaded", docCls: "p-am", status: "Re-submitted", stCls: "p-am", submitted: true },
  ]);

  // Also add real users from API
  const realRows = users.slice(0, 5).map((u, i) => ({
    id: u.id, av: (u.full_name || "U").slice(0, 2).toUpperCase(), avClr: "nv",
    name: u.full_name || "Citizen", ward: u.ward || u.district || "—",
    scheme: "PM Kisan", ms: "M1 Registration", doc: "📄 Aadhaar", docCls: "p-bl",
    status: "Pending", stCls: "p-am", submitted: true
  }));

  const allRows = [...realRows, ...vRows].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);

  const approve = id => setVRows(r => r.map(x => x.id === id ? { ...x, status: "✓ Approved", stCls: "p-gn" } : x));
  const reject = id => setVRows(r => r.map(x => x.id === id ? { ...x, status: "✗ Rejected", stCls: "p-rd" } : x));

  const complaints = [
    { issue: "💧 Water — Ward 4", citizen: "Ramesh Kumar", filed: "Feb 14", sla: 86, days: "12/14 days", left: "2d 4h", leftClr: "rd", bg: "#FFF5F5", note: "AUTO-ESCALATE in 2 days" },
    { issue: "⚡ Power — Ward 11", citizen: "Meena Shinde", filed: "Feb 18", sla: 57, days: "8/14 days", left: "6d", leftClr: "am", bg: "#FFFBF0" },
    { issue: "🛣 Road — Ward 6", citizen: "Suresh Pawar", filed: "Feb 20", sla: 29, days: "4/14 days", left: "10d", leftClr: "gn", bg: "" },
  ];

  return (
    <>
      <div className="bc">Admin › Maharashtra › <span>Latur District</span></div>
      <div className="ph"><h1>District Command Center</h1><p>Latur · 8,92,000 citizens · 47 active schemes</p></div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">Beneficiaries</div><div className="sv">2,84,391</div><div className="ss">+1,247 this month</div></div>
        <div className="sc c-gn"><div className="sl">Schemes Delivered</div><div className="sv">41/47</div><div className="ss">87% delivery rate</div></div>
        <div className="sc c-am"><div className="sl">Open Complaints</div><div className="sv">14</div><div className="ss" style={{ color: "var(--rd)" }}>3 near SLA breach</div></div>
        <div className="sc c-nv"><div className="sl">Funds Utilized</div><div className="sv">₹24.7Cr</div><div className="ss">of ₹31.2Cr allocated</div></div>
      </div>

      <div className="sec">✅ Bulk Document Verification</div>
      <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
        <button className="btn b-gn b-sm" onClick={() => bulkAction("approve")}>✅ Approve Selected</button>
        <button className="btn b-rd b-sm" onClick={() => bulkAction("reject")}>❌ Reject Selected</button>
        <button className="btn b-gh b-sm">⬇ Export</button>
      </div>
      <table className="dtbl">
        <thead><tr>
          <th><input type="checkbox" onChange={e => selectAll(e.target.checked)} /></th>
          <th>Citizen</th><th>Scheme</th><th>Milestone</th><th>Document</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          {allRows.map(r => (
            <tr key={r.id}>
              <td><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleSelect(r.id)} /></td>
              <td><div className="u-cell"><div className="u-av" style={{ background: `var(--${r.avClr}-l)`, color: `var(--${r.avClr})` }}>{r.av}</div><div><div style={{ fontWeight: 600, fontSize: 12 }}>{r.name}</div><div style={{ fontSize: 10, color: "var(--t3)" }}>{r.ward}</div></div></div></td>
              <td style={{ fontSize: 12 }}>{r.scheme}</td>
              <td style={{ fontSize: 12 }}>{r.ms}</td>
              <td><span className={`pill ${r.docCls}`}>{r.doc}</span></td>
              <td><span className={`pill ${r.stCls}`}>{r.status}</span></td>
              <td><div style={{ display: "flex", gap: 3 }}>
                <button className="btn b-gn b-sm" onClick={() => approve(r.id)}>✓</button>
                <button className="btn b-rd b-sm" onClick={() => reject(r.id)}>✗</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sec" style={{ marginTop: 16 }}>⏱ SLA Timer — Complaints</div>
      <table className="dtbl">
        <thead><tr><th>Complaint</th><th>Citizen</th><th>Filed</th><th>Progress</th><th>Time Left</th><th>Action</th></tr></thead>
        <tbody>
          {complaints.map((c, i) => (
            <tr key={i} style={{ background: c.bg || "" }}>
              <td><div style={{ fontSize: 12, fontWeight: 700 }}>{c.issue}</div>{c.note && <div style={{ fontSize: 10, color: "var(--rd)" }}>{c.note}</div>}</td>
              <td style={{ fontSize: 12 }}>{c.citizen}</td>
              <td style={{ fontSize: 11, color: "var(--t3)" }}>{c.filed}</td>
              <td><div className="sla-b"><div className={`sla-f sla-${c.leftClr === "rd" ? "c" : c.leftClr === "am" ? "w" : "ok"}`} style={{ width: c.sla + "%" }}></div></div><div style={{ fontSize: "9.5px", color: `var(--${c.leftClr})` }}>{c.days}</div></td>
              <td><span style={{ fontWeight: 700, color: `var(--${c.leftClr})`, fontSize: 13 }}>{c.left}</span></td>
              <td><div style={{ display: "flex", gap: 4 }}>
                <button className="btn b-gn b-sm">Resolve</button>
                <button className="btn b-gh b-sm">Assign</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ── STATE ─────────────────────────────────────────────────────────────────────
function StateSidebar() {
  return (
    <>
      <div className="s-lbl">Maharashtra State</div>
      <div className="si on"><span className="si-ic">🗺</span>District Overview</div>
      <div className="si"><span className="si-ic">📢</span>Escalated Complaints <span className="sbadge">8</span></div>
      <div className="si"><span className="si-ic">📊</span>Scheme Analytics</div>
      <div className="si"><span className="si-ic">💰</span>Fund Allocation</div>
      <div className="sb-profile" style={{ margin: "12px 8px 0", background: "var(--sf-l)", borderRadius: "var(--r)", padding: 11 }}>
        <div className="sbp-name" style={{ color: "var(--sf)" }}>Maharashtra</div>
        <div className="sbp-sub">36 Districts · State CS Office</div>
      </div>
    </>
  );
}

function StateMain() {
  const districts = [
    { name: "Pune", val: 94, cls: "hi" }, { name: "Nashik", val: 91, cls: "hi" }, { name: "Nagpur", val: 89, cls: "hi" },
    { name: "Latur", val: 74, cls: "mi" }, { name: "Solapur", val: 66, cls: "mi" },
    { name: "Nandurbar", val: 41, cls: "lo" }, { name: "Osmanabad", val: 38, cls: "lo" }, { name: "Gadchiroli", val: 29, cls: "lo" },
  ];
  return (
    <>
      <div className="bc">Admin › <span>Maharashtra State</span></div>
      <div className="ph"><h1>State Monitoring Dashboard</h1><p>Maharashtra · 36 districts · 12.47 Cr citizens</p></div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">State Beneficiaries</div><div className="sv">2.84Cr</div><div className="ss">▲ 3.2% this quarter</div></div>
        <div className="sc c-gn"><div className="sl">Delivery Rate</div><div className="sv">74%</div><div className="ss">Target: 85%</div></div>
        <div className="sc c-am"><div className="sl">Escalated from Districts</div><div className="sv">8</div><div className="ss">Awaiting state action</div></div>
        <div className="sc c-nv"><div className="sl">Unspent Funds</div><div className="sv">₹420Cr</div><div className="ss">Reallocation needed</div></div>
      </div>
      <div className="sec">District Performance</div>
      <div className="dg">
        {districts.map((d, i) => (
          <div key={i} className={`dt ${d.cls}`}>
            <div className="dt-name">{d.name}</div>
            <div className="dt-num">{d.val}%</div>
            <div className="dt-lbl">Delivery</div>
            <div className="dt-bar"><div className={`dt-fill ${d.cls}`} style={{ width: d.val + "%" }}></div></div>
          </div>
        ))}
      </div>
      <div className="sec">📢 Escalated Complaints (District Could Not Resolve)</div>
      <div className="complaint-card">
        <div className="c-icon" style={{ background: "#E3F2FD" }}>💧</div>
        <div className="c-body">
          <div className="c-title">Water supply — Latur Ward 4</div>
          <div className="c-meta">Escalated Feb 21 · Citizen: Ramesh Kumar · Day 4 of 14</div>
          <div className="sla-b" style={{ width: "100%", marginTop: 6 }}><div className="sla-f sla-w" style={{ width: "29%" }}></div></div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}><button className="btn b-nv b-sm">Take Action</button><button className="btn b-am b-sm">Assign to Dept</button></div>
        </div>
      </div>
    </>
  );
}

// ── CENTRAL ───────────────────────────────────────────────────────────────────
function CentralSidebar() {
  return (
    <>
      <div className="s-lbl">Central</div>
      <div className="si on"><span className="si-ic">🇮🇳</span>National Overview</div>
      <div className="si"><span className="si-ic">🤖</span>AI Predictions</div>
      <div className="si"><span className="si-ic">📊</span>State Analytics</div>
      <div className="si"><span className="si-ic">📢</span>Critical Escalations <span className="sbadge">2</span></div>
      <div className="si"><span className="si-ic">💰</span>Budget Planner</div>
    </>
  );
}

function CentralMain() {
  const states = [
    { name: "Kerala", val: 96, cls: "hi" }, { name: "Tamil Nadu", val: 92, cls: "hi" }, { name: "Karnataka", val: 88, cls: "hi" },
    { name: "Maharashtra", val: 74, cls: "mi" }, { name: "Rajasthan", val: 62, cls: "mi" },
    { name: "Bihar", val: 44, cls: "lo" }, { name: "UP", val: 41, cls: "lo" }, { name: "Jharkhand", val: 33, cls: "lo" },
    { name: "Chhattisgarh", val: 31, cls: "lo" }, { name: "MP", val: 38, cls: "lo" },
  ];
  return (
    <>
      <div className="bc">Admin › <span>Central Command</span></div>
      <div className="ph"><h1>National Scheme Command</h1><p>All India · 28 States · 742 Districts · AI-powered intelligence</p></div>
      <div className="pred-card">
        <div className="pred-lbl">🤖 AI Budget Prediction — FY 2025–26</div>
        <div className="pred-val">₹2,14,800 Cr</div>
        <div className="pred-sub">Recommended total scheme funding · 94.2% model confidence</div>
        <div className="pred-metrics">
          <div><div className="pm-v">₹48,200Cr</div><div className="pm-l">Agriculture gap</div></div>
          <div><div className="pm-v">32.4M</div><div className="pm-l">Near-deadline citizens</div></div>
          <div><div className="pm-v">18 states</div><div className="pm-l">Underperforming</div></div>
        </div>
      </div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">Total Beneficiaries</div><div className="sv">4.82Cr</div><div className="ss">▲ 12% vs last yr</div></div>
        <div className="sc c-gn"><div className="sl">States On Track</div><div className="sv">10/28</div><div className="ss">Delivery ≥ 80%</div></div>
        <div className="sc c-am"><div className="sl">Near-Deadline</div><div className="sv">32.4M</div><div className="ss">Not yet applied</div></div>
        <div className="sc c-nv"><div className="sl">Unspent Funds</div><div className="sv">₹18,400Cr</div><div className="ss">Reallocation needed</div></div>
      </div>
      <div className="sec">State Performance</div>
      <div className="dg" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {states.map((s, i) => (
          <div key={i} className={`dt ${s.cls}`}>
            <div className="dt-name">{s.name}</div>
            <div className="dt-num">{s.val}%</div>
            <div className="dt-bar"><div className={`dt-fill ${s.cls}`} style={{ width: s.val + "%" }}></div></div>
          </div>
        ))}
      </div>
      <div className="sec">📢 Critical Escalations</div>
      <div className="complaint-card" style={{ background: "var(--rd-l)", borderColor: "var(--rd)" }}>
        <div className="c-icon" style={{ background: "#fff" }}>⚠️</div>
        <div className="c-body">
          <div className="c-title" style={{ color: "var(--rd)" }}>Farmer compensation delay — Vidarbha Region, Maharashtra</div>
          <div className="c-meta">21 days unresolved · 4,200 farmers affected · Escalated from State</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn b-nv b-sm">Central Intervention</button>
            <button className="btn b-gh b-sm">Direct to PMO</button>
          </div>
        </div>
      </div>
    </>
  );
}