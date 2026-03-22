import { useState, useEffect, useContext, useRef } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import SchemesPage from "./SchemesPage.jsx";

const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const maskAadhaar = (a) => a ? "XXXX-XXXX-" + String(a).slice(-4) : "Not provided";
const fmtIncome = (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "Not provided";

export default function UserApp() {
  const { user, logout } = useContext(AuthContext);
  const [page, setPage] = useState("p-home");
  const [dashboard, setDashboard] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { bot: true, text: "Namaste " + (user?.full_name?.split(" ")[0] || "ji") + "! 🙏 Main aapka scheme assistant hoon.", opts: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    API.get("/api/user/dashboard").then(r => setDashboard(r.data)).catch(() => { });
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const goPage = (id) => { setPage(id); setNotifOpen(false); };

  const ANSWERS = {
    paisa: "PM Kisan instalment April mein expected hai — Schemes tab mein check karein!",
    scheme: "Aapki profile ke liye AI ne schemes match ki hain. 'AI Schemes' tab mein dekho!",
    reject: "Document reject hua to Active Schemes mein error details check karein.",
    complaint: "Dashboard › Complaints mein apni complaints track kar sakte hain."
  };
  const addMsg = (text, isUser) => setChatMsgs(m => [...m, { bot: !isUser, text, opts: false }]);
  const botAnswer = (key, q) => { addMsg(q, true); setTimeout(() => addMsg(ANSWERS[key], false), 500); };
  const sendChat = () => {
    const v = chatInput.trim(); if (!v) return;
    addMsg(v, true); setChatInput("");
    const l = v.toLowerCase();
    let a = 'Mujhe samajh nahi aaya. "Paisa", "scheme", "document" ya "complaint" ke baare mein poochh sakte hain.';
    if (l.includes("paisa") || l.includes("paise")) a = ANSWERS.paisa;
    else if (l.includes("scheme") || l.includes("yojan")) a = ANSWERS.scheme;
    else if (l.includes("reject") || l.includes("document")) a = ANSWERS.reject;
    else if (l.includes("complaint")) a = ANSWERS.complaint;
    setTimeout(() => addMsg(a, false), 600);
  };

  const u = user || {};
  const d = dashboard;

  return (
    <div id="app-user" className="app on">
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">🇮🇳</div>
          <div className="nav-brand-txt">NagarikConnect <span>Citizen Portal</span></div>
        </div>
        <div className="nav-r">
          <button className="notif-btn" onClick={() => setNotifOpen(o => !o)}>🔔<span className="notif-dot"></span></button>
          <div className="nav-user">
            <div className="nav-av">{initials(u.full_name)}</div>
            <div className="nav-uname">{u.full_name || "Citizen"}</div>
          </div>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      {notifOpen && (
        <div className="notif-panel op">
          <div className="notif-hdr">Notifications <span className="pill p-sf">{d?.notifications?.length || 0} new</span></div>
          {d?.notifications?.length > 0 ? d.notifications.map((n, i) => (
            <div key={i} className="ni unread">
              <div className="ni-ic" style={{ background: "var(--gn-l)" }}>🔔</div>
              <div><div className="ni-txt">{n.message}</div><div className="ni-time">{new Date(n.created_at).toLocaleDateString("en-IN")}</div></div>
              <div className="unread-dot"></div>
            </div>
          )) : (
            <div className="ni"><div className="ni-ic" style={{ background: "var(--sf-l)" }}>🔔</div><div><div className="ni-txt">Complete your profile for scheme matching</div><div className="ni-time">Today</div></div></div>
          )}
        </div>
      )}

      <div className="layout">
        <aside className="sidebar">
          <div className="s-lbl">Dashboard</div>
          <div className={`si${page === "p-home" ? " on" : ""}`} onClick={() => goPage("p-home")}><span className="si-ic">🏠</span>My Dashboard</div>
          <div className="s-lbl">My Schemes</div>
          <div className={`si${page === "p-schemes" ? " on" : ""}`} onClick={() => goPage("p-schemes")}><span className="si-ic">🤖</span>AI Matched Schemes</div>
          <div className={`si${page === "p-active" ? " on" : ""}`} onClick={() => goPage("p-active")}><span className="si-ic">📋</span>Active Schemes <span className="sbadge">{d?.schemes?.filter(s => s.status === "active")?.length || 2}</span></div>
          <div className={`si${page === "p-upcoming" ? " on" : ""}`} onClick={() => goPage("p-upcoming")}><span className="si-ic">🔜</span>Upcoming</div>
          <div className={`si${page === "p-past" ? " on" : ""}`} onClick={() => goPage("p-past")}><span className="si-ic">📁</span>Completed</div>
          <div className="s-lbl">Tools</div>
          <div className={`si${page === "p-docs" ? " on" : ""}`} onClick={() => goPage("p-docs")}><span className="si-ic">🔐</span>Document Locker</div>
          <div className={`si${page === "p-complaints" ? " on" : ""}`} onClick={() => goPage("p-complaints")}><span className="si-ic">📢</span>Complaints <span className="sdot"></span></div>

          <div className="sb-profile">
            <div className="sbp-name">{u.full_name || "—"}</div>
            <div className="sbp-sub">{u.occupation || "Citizen"} · {u.district || u.state || "—"}</div>
            <div className="sbp-score">
              <div className="sbp-score-lbl">Beneficiary Score</div>
              <div className="sbp-bar-row">
                <div className="sbp-bar"><div className="sbp-fill" style={{ width: (u.civic_score || 74) + "%" }}></div></div>
                <div className="sbp-val">{u.civic_score || 74}/100</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          {page === "p-home" && <HomeDash user={u} d={d} maskAadhaar={maskAadhaar} fmtIncome={fmtIncome} goPage={goPage} />}
          {page === "p-schemes" && <SchemesPage user={u} />}
          {page === "p-active" && <ActiveSchemes d={d} />}
          {page === "p-upcoming" && <UpcomingSchemes user={u} />}
          {page === "p-past" && <PastSchemes />}
          {page === "p-docs" && <DocLocker documents={d?.documents} />}
          {page === "p-complaints" && <Complaints user={u} />}
        </main>
      </div>

      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="AI Assistant">🤖</button>
      {chatOpen && (
        <div className="chat-win op">
          <div className="chat-hdr">
            <div className="chat-hdr-av">🤖</div>
            <div className="chat-hdr-info"><div className="chat-hdr-name">NagarikConnect AI</div><div className="chat-hdr-sub">Scheme assistant · Hindi/English</div></div>
            <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-msgs">
            {chatMsgs.map((m, i) => (
              <div key={i}>
                <div className={`cb ${m.bot ? "cb-bot" : "cb-user"}`}>{m.text}</div>
                {m.opts && (
                  <div className="chat-opts">
                    <span className="copt" onClick={() => botAnswer("paisa", "Mera paisa kab?")}>Mera paisa kab?</span>
                    <span className="copt" onClick={() => botAnswer("scheme", "Kaunsi scheme?")}>Kaunsi scheme?</span>
                    <span className="copt" onClick={() => botAnswer("reject", "Document reject kyun?")}>Doc reject kyun?</span>
                    <span className="copt" onClick={() => botAnswer("complaint", "Complaint status?")}>Complaint status?</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <div className="chat-inp-row">
            <input className="chat-input" placeholder="Kuch bhi poochho..." value={chatInput}
              onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
            <button className="chat-send" onClick={sendChat}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HOME DASHBOARD ─────────────────────────────────────────────────────────────
function HomeDash({ user: u, d, maskAadhaar, fmtIncome, goPage }) {
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Home</span></div>
      <div className="ph"><h1>Namaste, {u.full_name?.split(" ")[0] || "Citizen"} 🙏</h1><p>Aapka personal governance dashboard</p></div>
      <div className="profile-card">
        <div className="pc-top">
          <div className="pc-av">{u.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2) || "?"}</div>
          <div>
            <div className="pc-name">{u.full_name || "—"}</div>
            <div className="pc-sub">{u.occupation || "Citizen"} · {u.district || "—"}, {u.state || "—"}</div>
            <div className="pc-badges">
              {u.state && <span className="pc-badge">📍 {u.state}</span>}
              {u.aadhaar_number && <span className="pc-badge">🪪 Aadhaar Verified</span>}
              {u.voter_id && <span className="pc-badge">🗳 Registered Voter</span>}
              {u.category && <span className="pc-badge">🏷 {u.category}</span>}
            </div>
          </div>
        </div>
        <div className="pc-grid">
          <div className="pc-cell"><div className="pc-val">{u.active_schemes || 0}</div><div className="pc-lbl">Total Schemes</div></div>
          <div className="pc-cell"><div className="pc-val">₹{(u.total_benefits || 0).toLocaleString("en-IN")}</div><div className="pc-lbl">Benefits Received</div></div>
          <div className="pc-cell"><div className="pc-val">{u.civic_score || 74}/100</div><div className="pc-lbl">Beneficiary Score</div></div>
        </div>
      </div>

      {/* Quick action to schemes */}
      <div className="notice" style={{ cursor: "pointer" }} onClick={() => goPage("p-schemes")}>
        🤖 Click to see AI-matched government schemes personalised for your profile →
      </div>

      <div className="two-col">
        <div>
          <div className="detail-card">
            <div className="detail-label">Personal Details</div>
            <div className="detail-row"><span className="dr-key">Full Name</span><span className="dr-val">{u.full_name || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Date of Birth</span><span className="dr-val">{u.date_of_birth || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Gender</span><span className="dr-val">{u.gender || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Aadhaar</span><span className="dr-val">{maskAadhaar(u.aadhaar_number)}</span></div>
            <div className="detail-row"><span className="dr-key">Mobile</span><span className="dr-val">{u.phone || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Occupation</span><span className="dr-val">{u.occupation || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Annual Income</span><span className="dr-val">{fmtIncome(u.annual_income)}</span></div>
            <div className="detail-row"><span className="dr-key">Category</span><span className="dr-val">{u.category || "—"}</span></div>
          </div>
          <div className="detail-card">
            <div className="detail-label">Address</div>
            <div className="detail-row"><span className="dr-key">Village/Area</span><span className="dr-val">{u.village || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">Ward</span><span className="dr-val">{u.ward || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">District</span><span className="dr-val">{u.district || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">State</span><span className="dr-val">{u.state || "—"}</span></div>
            <div className="detail-row"><span className="dr-key">PIN Code</span><span className="dr-val">{u.pincode || "—"}</span></div>
          </div>
        </div>
        <div>
          <div className="voter-card">
            <div className="vc-hdr">
              <div className="vc-title"><span className="vc-flag"></span>Voter / Electoral Information</div>
              {u.voter_id ? <span className="pill p-gn">✓ Verified</span> : <span className="pill p-gy">Not added</span>}
            </div>
            <div className="vc-row"><span className="vc-key">Voter ID</span><span className="vc-val">{u.voter_id || "Not provided"}</span></div>
            <div className="vc-row"><span className="vc-key">District</span><span className="vc-val">{u.district || "—"}</span></div>
            <div className="vc-row"><span className="vc-key">State</span><span className="vc-val">{u.state || "—"}</span></div>
            <div className="vote-reminder">🗳 Keep your voter ID updated for election notifications</div>
          </div>
          <div className="card">
            <div className="card-hdr"><div className="card-title">⚡ Quick Actions</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn b-sf" onClick={() => goPage("p-schemes")}>🤖 View AI-Matched Schemes</button>
              <button className="btn b-nv" onClick={() => goPage("p-docs")}>🔐 Open Document Locker</button>
              <button className="btn b-gh" onClick={() => goPage("p-complaints")}>📢 File a Complaint</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ACTIVE SCHEMES ─────────────────────────────────────────────────────────────
function ActiveSchemes({ d }) {
  const [open, setOpen] = useState({});
  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }));
  const schemes = [
    { id: "s1", icon: "🌾", name: "PM Kisan Samman Nidhi", desc: "₹6,000/year · Farmer income support", status: "error", progress: 67, progressLabel: "Milestone 4 of 6", progressAmt: "₹18,000 received", progressColor: "am", tags: [{ cls: "p-rd", txt: "⚠ Error at M3" }, { cls: "p-gn", txt: "Active" }], pill: { cls: "p-am", txt: "4/6 done" }, milestones: [{ dot: "md-ok", icon: "✓", name: "Registration & eKYC", date: "Jan 10, 2023" }, { dot: "md-ok", icon: "✓", name: "1st Instalment", date: "Feb 2023", amt: "₹2,000" }, { dot: "md-err", icon: "!", name: "3rd Instalment — Bank Mismatch", date: "Jun 2023", error: { title: "Bank account mismatch. Upload corrected passbook.", errors: 2, uploadId: "s1" } }, { dot: "md-ok", icon: "✓", name: "4th Instalment", date: "Dec 2023", amt: "₹2,000" }, { dot: "md-pend", icon: "○", name: "5th Instalment", date: "Expected Apr 2024", locked: true }, { dot: "md-pend", icon: "○", name: "6th Instalment", date: "Expected Aug 2024" }] },
    { id: "s2", icon: "🏥", name: "Ayushman Bharat PMJAY", desc: "₹5 lakh health cover", status: "error", progress: 20, progressLabel: "M1 of 5 — BLOCKED", progressAmt: "Error ×3", progressColor: "rd", tags: [{ cls: "p-rd", txt: "🔴 3× Error" }, { cls: "p-gn", txt: "Active" }], pill: { cls: "p-rd", txt: "BLOCKED" }, milestones: [{ dot: "md-ok", icon: "✓", name: "Enrolment Verified", date: "Mar 5, 2022" }, { dot: "md-err", icon: "!", name: "Hospital Card Photo — Rejected 3×", date: "Sep 2023", support: { ticket: "PMJAY-2024-0981", officer: "Dr. Meera Patil", sla: "Day 6 of 14" } }, { dot: "md-pend", icon: "○", name: "Health Card Activation", locked: true }, { dot: "md-pend", icon: "○", name: "First Claim Eligibility" }, { dot: "md-pend", icon: "○", name: "Annual Renewal", date: "Due Mar 2025" }] }
  ];
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Active Schemes</span></div>
      <div className="ph"><h1>Active Schemes</h1><p>Click to expand milestones. Upload documents at error stage.</p></div>
      <div className="sr">
        <div className="sc c-sf"><div className="sl">Active</div><div className="sv">2</div></div>
        <div className="sc c-gn"><div className="sl">Benefits</div><div className="sv">₹24,000</div></div>
        <div className="sc c-am"><div className="sl">Action Needed</div><div className="sv">1</div></div>
        <div className="sc c-nv"><div className="sl">Error Watch</div><div className="sv">3×</div></div>
      </div>
      {schemes.map(s => (
        <div key={s.id} className="sch s-active s-err">
          <div className="sch-hdr" onClick={() => toggle(s.id)}>
            <div className="sch-ic" style={{ background: s.id === "s1" ? "#E8F5E9" : "#E3F2FD" }}>{s.icon}</div>
            <div className="sch-info">
              <div className="sch-name">{s.name}</div>
              <div className="sch-desc">{s.desc}</div>
              <div className="sch-tags">{s.tags.map((t, i) => <span key={i} className={`tag ${t.cls}`}>{t.txt}</span>)}</div>
            </div>
            <div className="sch-right"><span className={`pill ${s.pill.cls}`}>{s.pill.txt}</span><span className={`tgl${open[s.id] ? " op" : ""}`}>▼</span></div>
          </div>
          <div className="prog-w">
            <div className="prog-b"><div className={`prog-f ${s.progressColor}`} style={{ width: s.progress + "%" }}></div></div>
            <div className="prog-m"><span>{s.progressLabel}</span><span style={{ color: `var(--${s.progressColor === "rd" ? "rd" : "gn"})`, fontWeight: 700 }}>{s.progressAmt}</span></div>
          </div>
          {open[s.id] && (
            <div className="ms-panel op">
              <div className="ms-lbl">All Milestones</div>
              <div className="ms-list">
                {s.milestones.map((m, i) => (
                  <div key={i} className="ms-item">
                    <div className={`ms-dot ${m.dot}`}>{m.icon}</div>
                    <div className="ms-body">
                      <div className="ms-name">{m.name}</div>
                      {m.date && <div className="ms-date">{m.date} {m.amt && <span className="ms-amt">{m.amt}</span>}</div>}
                      {m.locked && <div className="locked-info">🔒 Locked until error above is resolved</div>}
                      {m.error && <div className="err-box"><div className="err-lbl">Problem</div><div className="err-txt">{m.error.title}</div><div className="err-circles">{[1, 2, 3].map(n => <div key={n} className={`ec ${n <= m.error.errors ? "ec-on" : "ec-off"}`}>{n}</div>)}</div></div>}
                      {m.support && <div className="sup-alert"><div className="sup-title">🔴 Support Active · Ticket #{m.support.ticket}</div><div className="sup-desc">{m.support.officer} · SLA {m.support.sla}</div><div className="sup-btns"><button className="btn b-rd b-sm">📞 1800-111-565</button></div></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UpcomingSchemes({ user: u }) {
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Upcoming</span></div>
      <div className="ph"><h1>Upcoming Schemes</h1><p>Schemes with approaching deadlines</p></div>
      <div className="notice">🤖 Visit AI Matched Schemes for personalised recommendations →</div>
      <div className="sch s-up"><div className="sch-hdr"><div className="sch-ic" style={{ background: "#E8F5E9" }}>🌱</div><div className="sch-info"><div className="sch-name">PM Fasal Bima — Rabi 2025</div><div className="sch-desc">Crop Insurance · Deadline: March 31, 2025</div><div className="sch-tags"><span className="tag p-sf">🔥 Deadline Soon</span><span className="tag p-gn">96% Match</span></div></div><div className="sch-right"><button className="btn b-sf b-sm">Apply →</button></div></div></div>
      <div className="sch s-up"><div className="sch-hdr"><div className="sch-ic" style={{ background: "#FFF8E1" }}>🌞</div><div className="sch-info"><div className="sch-name">PM Kusum — Solar Pump</div><div className="sch-desc">90% subsidised solar irrigation pump</div><div className="sch-tags"><span className="tag p-gn">Open Now</span></div></div><div className="sch-right"><button className="btn b-gn b-sm">Apply →</button></div></div></div>
    </div>
  );
}

function PastSchemes() {
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Completed</span></div>
      <div className="ph"><h1>Completed Schemes</h1></div>
      <div className="sch s-done"><div className="sch-hdr"><div className="sch-ic" style={{ background: "#E8F5E9" }}>🎓</div><div className="sch-info"><div className="sch-name">National Scholarship 2021</div><div className="sch-desc">₹12,000 received · Completed</div><div className="sch-tags"><span className="tag p-nv">✓ Completed</span></div></div><div className="sch-right"><span className="pill p-nv">Done</span></div></div><div className="prog-w"><div className="prog-b"><div className="prog-f nv" style={{ width: "100%" }}></div></div><div className="prog-m"><span>All milestones completed</span><span style={{ color: "var(--nv)", fontWeight: 700 }}>₹12,000 received</span></div></div></div>
    </div>
  );
}

function DocLocker() {
  const docs = [
    { icon: "🪪", name: "Aadhaar Card", meta: "Issued by UIDAI", status: "verified", statusCls: "p-gn", statusTxt: "✓ Verified" },
    { icon: "🗳", name: "Voter ID Card", meta: "Issued by ECI", status: "verified", statusCls: "p-gn", statusTxt: "✓ Verified" },
    { icon: "🏦", name: "Bank Passbook", meta: "Account document", status: "verified", statusCls: "p-gn", statusTxt: "✓ Verified" },
    { icon: "📷", name: "Passport Photo", meta: "Under review", status: "pending", statusCls: "p-am", statusTxt: "⏳ Pending" },
    { icon: "🏠", name: "Ration Card", meta: "Required for BPL schemes", status: "missing", statusCls: "p-gy", statusTxt: "Not uploaded" },
  ];
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Document Locker</span></div>
      <div className="ph"><h1>🔐 Document Locker</h1><p>1-click attach to any scheme application</p></div>
      <div className="quick-attach-notice">⚡ Documents are auto-attached to scheme applications</div>
      <div className="doc-grid">
        {docs.map((doc, i) => (
          <div key={i} className={`doc-card${doc.status === "verified" ? " verified" : doc.status === "pending" ? " pending" : ""}`}>
            <span className={`doc-status ${doc.statusCls}`}>{doc.statusTxt}</span>
            <div className="doc-ic">{doc.icon}</div>
            <div className="doc-name">{doc.name}</div>
            <div className="doc-meta">{doc.meta}</div>
            {doc.status === "missing" && <div style={{ marginTop: 8 }}><button className="btn b-nv b-sm">+ Upload</button></div>}
            {doc.status === "pending" && <div style={{ marginTop: 8 }}><button className="btn b-am b-sm">Re-upload</button></div>}
          </div>
        ))}
        <div className="doc-card doc-add"><div className="doc-ic" style={{ color: "var(--t3)" }}>➕</div><div className="doc-name" style={{ color: "var(--t3)" }}>Add Document</div></div>
      </div>
    </div>
  );
}

function Complaints({ user: u }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", description: "" });
  const [complaints, setComplaints] = useState([
    { icon: "💧", title: "Water supply disruption — Ward 4", meta: "Filed: Feb 14, 2025 · #WTR-2025-441", steps: ["District ✓", "State — Active", "Central"], activeStep: 1 },
    { icon: "⚡", title: "Power outage — 14+ hours daily", meta: "Filed: Jan 28, 2025 · #PWR-2025-209", steps: ["District ✓", "State ✓", "Central"], activeStep: 2, resolved: true },
  ]);
  const submit = async () => {
    if (!form.title || !form.category) return alert("Fill required fields");
    try {
      await API.post("/api/user/complaints", { ...form });
      setComplaints(c => [...c, { icon: "📋", title: form.title, meta: "Filed: Today · New", steps: ["District — Active", "State", "Central"], activeStep: 0 }]);
      setForm({ title: "", category: "", description: "" }); setShowForm(false);
    } catch { alert("Failed"); }
  };
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Complaints</span></div>
      <div className="ph"><h1>📢 My Complaints</h1><p>Auto-escalation: District → State → Central</p></div>
      <button className="btn b-sf" onClick={() => setShowForm(o => !o)} style={{ marginBottom: 14 }}>+ New Complaint</button>
      {showForm && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 10 }}>📋 File New Complaint</div>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief description" /></div>
          <div className="form-group"><label className="form-label">Category *</label><select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}><option value="">Select</option><option>Water Supply</option><option>Electricity</option><option>Roads</option><option>Scheme Issue</option><option>Other</option></select></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} /></div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}><button className="btn b-sf" onClick={submit}>Submit</button><button className="btn b-gh" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {complaints.map((c, i) => (
        <div key={i} className="complaint-card">
          <div className="c-icon" style={{ background: "var(--bl-l)" }}>{c.icon}</div>
          <div className="c-body">
            <div className="c-title">{c.title}</div>
            <div className="c-meta">{c.meta}</div>
            <div className="esc-path">{c.steps.map((s, j) => <span key={j}><span className={`esc-step ${j < c.activeStep ? "es-done" : j === c.activeStep ? "es-active" : "es-pend"}`}>{s}</span>{j < c.steps.length - 1 && <span style={{ color: "var(--gy)" }}>›</span>}</span>)}</div>
            {c.resolved && <span className="pill p-gn" style={{ marginTop: 6, display: "inline-flex" }}>✓ Resolved</span>}
          </div>
        </div>
      ))}
    </div>
  );
}