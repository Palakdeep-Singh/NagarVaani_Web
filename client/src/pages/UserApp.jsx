/**
 * UserApp.jsx — Complete with EditProfile + Mobile + Realtime
 * Place: client/src/pages/UserApp.jsx
 */
import { useState, useEffect, useContext, useRef } from "react";
import API from "../api/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import SchemesPage from "./SchemesPage.jsx";
import ComplaintsPage from "./ComplaintsPage.jsx";
import DocumentLocker from "./DocumentLocker.jsx";
import ActiveSchemes from "./ActiveSchemes.jsx";
import EditProfile from "./EditProfile.jsx";
import { subscribeToNotifications } from "../services/realtime.js";

const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const maskAadhaar = (a) => a ? "XXXX-XXXX-" + String(a).slice(-4) : "Not provided";
const fmtIncome = (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "Not provided";

export default function UserApp() {
  const { user, logout, login } = useContext(AuthContext);
  const [page, setPage] = useState("p-home");
  const [dashboard, setDashboard] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifs] = useState([]);
  const [unreadCount, setUnread] = useState(0);
  const [sidebarOpen, setSidebar] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { bot: true, text: "Namaste " + (user?.full_name?.split(" ")[0] || "ji") + "! 🙏 Main aapka scheme assistant hoon. Kya poochhna hai?", opts: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    API.get("/api/user/dashboard").then(r => setDashboard(r.data)).catch(() => { });
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  // 🔴 REALTIME: live notifications
  useEffect(() => {
    if (!user?.id) return;
    API.get("/api/user/notifications").then(r => {
      const n = r.data || [];
      setNotifs(n);
      setUnread(n.filter(x => !x.is_read).length);
    }).catch(() => { });

    const unsub = subscribeToNotifications(user.id, (payload) => {
      if (payload.eventType === "INSERT") {
        setNotifs(n => [payload.new, ...n]);
        setUnread(c => c + 1);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(payload.new.title, { body: payload.new.message });
        }
      }
    });
    return unsub;
  }, [user?.id]);

  const markAllRead = async () => {
    try { await API.post("/api/user/notifications/read-all"); } catch { }
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    setUnread(0);
  };

  const goPage = (id) => {
    setPage(id);
    setNotifOpen(false);
    setSidebar(false); // close mobile sidebar on nav
  };

  // chatbot
  const ANSWERS = {
    paisa: "Scheme instalments 'Active Schemes' tab mein track karein. Real-time milestone status dikhta hai!",
    scheme: "AI Matched Schemes tab mein aapke liye 100+ schemes analyse ki gayi hain!",
    reject: "Rejected document ko 'Document Locker' mein re-upload karein. Admin verify karenge real-time update milega.",
    complaint: "'Complaints' tab mein apni complaint ka live status aur timeline dekh sakte hain.",
  };
  const addMsg = (text, isUser) => setChatMsgs(m => [...m, { bot: !isUser, text, opts: false }]);
  const botAnswer = (key, q) => { addMsg(q, true); setTimeout(() => addMsg(ANSWERS[key], false), 500); };
  const sendChat = () => {
    const v = chatInput.trim(); if (!v) return;
    addMsg(v, true); setChatInput("");
    const l = v.toLowerCase();
    let a = '"Paisa", "scheme", "document" ya "complaint" ke baare mein poochh sakte hain.';
    if (l.includes("paisa") || l.includes("paise")) a = ANSWERS.paisa;
    else if (l.includes("scheme") || l.includes("yojan")) a = ANSWERS.scheme;
    else if (l.includes("reject") || l.includes("document")) a = ANSWERS.reject;
    else if (l.includes("complaint")) a = ANSWERS.complaint;
    setTimeout(() => addMsg(a, false), 600);
  };

  const u = user || {};

  const SIDEBAR_ITEMS = [
    { id: "p-home", icon: "🏠", label: "My Dashboard", section: "Dashboard" },
    { id: "p-schemes", icon: "🤖", label: "AI Matched Schemes", section: "Schemes" },
    { id: "p-active", icon: "📋", label: "Active Schemes", section: null },
    { id: "p-past", icon: "📁", label: "Completed", section: null },
    { id: "p-docs", icon: "🔐", label: "Document Locker", section: "Tools" },
    { id: "p-complaints", icon: "📢", label: "Complaints", section: null },
    { id: "p-edit", icon: "✏️", label: "Edit Profile", section: null },
  ];

  return (
    <div id="app-user" className="app on">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand">
          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            onClick={() => setSidebar(o => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <div className="nav-logo">🇮🇳</div>
          <div className="nav-brand-txt">NagarikConnect <span>Citizen Portal</span></div>
        </div>
        <div className="nav-r">
          {/* Notification bell */}
          <button
            className="notif-btn"
            onClick={() => { setNotifOpen(o => !o); setSidebar(false); }}
            style={{ position: "relative" }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -3, right: -3,
                background: "var(--rd)", color: "#fff", borderRadius: "50%",
                width: 16, height: 16, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: 1,
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <div className="nav-user" onClick={() => goPage("p-edit")} style={{ cursor: "pointer" }}>
            <div className="nav-av">{initials(u.full_name)}</div>
            <div className="nav-uname">{u.full_name || "Citizen"}</div>
          </div>
          <button className="nav-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ── NOTIFICATION PANEL ── */}
      {notifOpen && (
        <div className="notif-panel op">
          <div className="notif-hdr">
            Notifications
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {unreadCount > 0 && <span className="pill p-sf">{unreadCount} new</span>}
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  style={{ fontSize: 10, color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--t3)", fontSize: 12 }}>
              No notifications yet
            </div>
          ) : notifications.slice(0, 10).map((n, i) => (
            <div key={i}
              className={`ni${!n.is_read ? " unread" : ""}`}
              onClick={() => { if (n.link) goPage(n.link); setNotifOpen(false); }}
              style={{ cursor: n.link ? "pointer" : "default" }}
            >
              <div className="ni-ic" style={{
                background:
                  n.type === "success" ? "var(--gn-l)" :
                    n.type === "error" ? "var(--rd-l)" :
                      n.type === "warning" ? "var(--am-l)" : "var(--bl-l)"
              }}>
                {n.type === "success" ? "✅" : n.type === "error" ? "❌" : n.type === "warning" ? "⚠️" : "🔔"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                <div className="ni-txt">{n.message}</div>
                <div className="ni-time">{new Date(n.created_at).toLocaleString("en-IN")}</div>
              </div>
              {!n.is_read && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      )}

      <div className="layout">

        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay open"
            onClick={() => setSidebar(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {SIDEBAR_ITEMS.map((item, idx) => {
            const prevSection = idx > 0 ? SIDEBAR_ITEMS[idx - 1].section : null;
            return (
              <span key={item.id}>
                {item.section && item.section !== prevSection && (
                  <div className="s-lbl">{item.section}</div>
                )}
                <div
                  className={`si${page === item.id ? " on" : ""}`}
                  onClick={() => goPage(item.id)}
                >
                  <span className="si-ic">{item.icon}</span>
                  {item.label}
                  {item.id === "p-complaints" && unreadCount > 0 && (
                    <span className="sbadge">{unreadCount}</span>
                  )}
                </div>
              </span>
            );
          })}

          {/* Sidebar profile mini */}
          <div className="sb-profile">
            <div className="sbp-name">{u.full_name || "—"}</div>
            <div className="sbp-sub">{u.occupation || "Citizen"} · {u.district || u.state || "—"}</div>
            <div className="sbp-score">
              <div className="sbp-score-lbl">Beneficiary Score</div>
              <div className="sbp-bar-row">
                <div className="sbp-bar">
                  <div className="sbp-fill" style={{ width: (u.civic_score || 74) + "%" }}></div>
                </div>
                <div className="sbp-val">{u.civic_score || 74}/100</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main" onClick={() => { if (sidebarOpen) setSidebar(false); }}>
          {page === "p-home" && <HomeDash user={u} d={dashboard} maskAadhaar={maskAadhaar} fmtIncome={fmtIncome} goPage={goPage} />}
          {page === "p-schemes" && <SchemesPage user={u} />}
          {page === "p-active" && <ActiveSchemes user={u} />}
          {page === "p-past" && <PastSchemes />}
          {page === "p-docs" && <DocumentLocker user={u} />}
          {page === "p-complaints" && <ComplaintsPage user={u} />}
          {page === "p-edit" && (
            <EditProfile
              onBack={() => goPage("p-home")}
              onSaved={(updated) => {
                login({ user: updated, token: localStorage.getItem("token") });
                goPage("p-home");
              }}
            />
          )}
        </main>
      </div>

      {/* ── CHATBOT FAB ── */}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="AI Assistant">🤖</button>

      {chatOpen && (
        <div className="chat-win op">
          <div className="chat-hdr">
            <div className="chat-hdr-av">🤖</div>
            <div className="chat-hdr-info">
              <div className="chat-hdr-name">NagarikConnect AI</div>
              <div className="chat-hdr-sub">Scheme assistant · Hindi/English</div>
            </div>
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
                    <span className="copt" onClick={() => botAnswer("reject", "Document reject?")}>Doc reject?</span>
                    <span className="copt" onClick={() => botAnswer("complaint", "Complaint status?")}>Complaint status?</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <div className="chat-inp-row">
            <input
              className="chat-input"
              placeholder="Kuch bhi poochho..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
            />
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
      <div className="ph" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1>Namaste, {u.full_name?.split(" ")[0] || "Citizen"} 🙏</h1>
          <p>Aapka personal governance dashboard — schemes, voter info, documents sab ek jagah</p>
        </div>
        <button className="btn b-gh b-sm" onClick={() => goPage("p-edit")} style={{ flexShrink: 0 }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Profile Banner */}
      <div className="profile-card">
        <div className="pc-top">
          <div className="pc-av">{initials(u.full_name)}</div>
          <div style={{ flex: 1 }}>
            <div className="pc-name">{u.full_name || "—"}</div>
            <div className="pc-sub">{u.occupation || "Citizen"} · {u.district || "—"}, {u.state || "—"}</div>
            <div className="pc-badges">
              {u.state && <span className="pc-badge">📍 {u.state}</span>}
              {u.aadhaar_number && <span className="pc-badge">🪪 Aadhaar ✓</span>}
              {u.voter_id && <span className="pc-badge">🗳 Voter ID ✓</span>}
              {u.category && <span className="pc-badge">🏷 {u.category}</span>}
              {u.occupation && <span className="pc-badge">💼 {u.occupation?.split(" ")[0]}</span>}
            </div>
          </div>
        </div>
        <div className="pc-grid">
          <div className="pc-cell">
            <div className="pc-val">{u.active_schemes || 0}</div>
            <div className="pc-lbl">Total Schemes</div>
          </div>
          <div className="pc-cell">
            <div className="pc-val">₹{(u.total_benefits || 0).toLocaleString("en-IN")}</div>
            <div className="pc-lbl">Benefits Received</div>
          </div>
          <div className="pc-cell">
            <div className="pc-val">{u.civic_score || 74}/100</div>
            <div className="pc-lbl">Beneficiary Score</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { icon: "🤖", title: "AI Matched Schemes", sub: "See your eligible schemes", page: "p-schemes", color: "var(--sf)" },
          { icon: "📋", title: "Active Milestones", sub: "Track real-time progress", page: "p-active", color: "var(--nv)" },
          { icon: "📢", title: "File Complaint", sub: "Auto-escalation to State", page: "p-complaints", color: "var(--gn)" },
        ].map(card => (
          <div key={card.page}
            onClick={() => goPage(card.page)}
            style={{
              background: "var(--wh)", border: ".5px solid var(--gy-m)",
              borderRadius: "var(--r)", padding: 14, cursor: "pointer",
              transition: "all .2s", borderLeft: `3px solid ${card.color}`,
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--sh)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Details + Voter */}
      <div className="two-col">
        <div>
          <div className="detail-card">
            <div className="detail-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Personal Details
              <button className="btn b-gh b-sm" onClick={() => goPage("p-edit")} style={{ fontSize: 10 }}>✏️ Edit</button>
            </div>
            {[
              ["Full Name", u.full_name || "—"],
              ["Date of Birth", u.date_of_birth || "—"],
              ["Gender", u.gender || "—"],
              ["Aadhaar", maskAadhaar(u.aadhaar_number)],
              ["Mobile", u.phone || "—"],
              ["Occupation", u.occupation || "—"],
              ["Annual Income", fmtIncome(u.annual_income)],
              ["Caste Category", u.category || "—"],
              ["Land Holding", u.land_acres ? u.land_acres + " Acres" : "—"],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}>
                <span className="dr-key">{k}</span>
                <span className="dr-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="detail-card">
            <div className="detail-label">Address</div>
            {[
              ["Village / Area", u.village || "—"],
              ["Ward", u.ward || "—"],
              ["District", u.district || "—"],
              ["State", u.state || "—"],
              ["PIN Code", u.pincode || "—"],
              ["Area Type", u.area_type || "Rural"],
            ].map(([k, v]) => (
              <div className="detail-row" key={k}>
                <span className="dr-key">{k}</span>
                <span className="dr-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="voter-card">
            <div className="vc-hdr">
              <div className="vc-title"><span className="vc-flag"></span>Voter / Electoral Information</div>
              {u.voter_id
                ? <span className="pill p-gn">✓ Verified</span>
                : <span className="pill p-gy">Not added</span>}
            </div>
            {[
              ["Voter ID", u.voter_id || "Not provided"],
              ["District", u.district || "—"],
              ["State", u.state || "—"],
            ].map(([k, v]) => (
              <div className="vc-row" key={k}>
                <span className="vc-key">{k}</span>
                <span className="vc-val">{v}</span>
              </div>
            ))}
            <div className="vote-reminder">🗳 Keep voter ID updated for election notifications</div>
            {!u.voter_id && (
              <button className="btn b-nv b-sm" onClick={() => goPage("p-edit")} style={{ marginTop: 10 }}>
                + Add Voter ID
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-hdr">
              <div className="card-title">📋 Scheme Quick Status</div>
            </div>
            {d?.schemes?.length > 0 ? d.schemes.slice(0, 4).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: ".5px solid var(--gy-l)", fontSize: 12 }}>
                <span>{s.schemes?.name || s.scheme_name || "Scheme"}</span>
                <span className={`pill ${s.status === "active" ? "p-gn" : s.status === "error" ? "p-rd" : "p-am"}`}>
                  {s.status === "active" ? "✓ Active" : s.status === "error" ? "⚠ Error" : "Pending"}
                </span>
              </div>
            )) : (
              <>
                <div style={{ fontSize: 12, color: "var(--t3)", padding: "8px 0" }}>No active schemes yet.</div>
                <button className="btn b-sf b-sm" onClick={() => goPage("p-schemes")} style={{ marginTop: 6 }}>
                  🤖 Find Schemes →
                </button>
              </>
            )}
          </div>

          <div className="card">
            <div className="card-hdr"><div className="card-title">⚡ Quick Actions</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn b-sf" onClick={() => goPage("p-schemes")}>🤖 View AI-Matched Schemes</button>
              <button className="btn b-nv" onClick={() => goPage("p-docs")}>🔐 Open Document Locker</button>
              <button className="btn b-gh" onClick={() => goPage("p-complaints")}>📢 File a Complaint</button>
              <button className="btn b-gh" onClick={() => goPage("p-edit")}>✏️ Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPLETED SCHEMES ──────────────────────────────────────────────────────────
function PastSchemes() {
  return (
    <div className="page on">
      <div className="bc">Dashboard › <span>Completed</span></div>
      <div className="ph"><h1>📁 Completed Schemes</h1></div>
      <div style={{ textAlign: "center", padding: "52px 0", color: "var(--t3)" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx)", marginBottom: 6 }}>
          No completed schemes yet
        </div>
        <div style={{ fontSize: 12 }}>
          Applied schemes appear here once all milestones are completed
        </div>
      </div>
    </div>
  );
}