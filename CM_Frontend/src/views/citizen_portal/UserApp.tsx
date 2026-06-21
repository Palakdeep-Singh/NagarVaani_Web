/**
 * UserApp.jsx — Complete with EditProfile + Mobile + Realtime
 * Place: client/src/pages/UserApp.jsx
 */
import { useState, useEffect, useContext, useRef } from "react";
import { API, AuthContext, subscribeToNotifications } from "./mockHelpers";
import "./citizen.css";
import SchemesPage from "./SchemesPage";
import ComplaintsPage from "./ComplaintsPage";
import DocumentLocker from "./DocumentLocker";
import ActiveSchemes from "./ActiveSchemes";
import EditProfile from "./EditProfile";
import FamilySection from "./FamilySection";

import Logo from "../../components/Logo";

const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
const maskAadhaar = (a) => a ? "XXXX-XXXX-" + String(a).slice(-4) : "Not provided";
const fmtIncome = (v) => v ? "₹" + Number(v).toLocaleString("en-IN") : "Not provided";

const renderStatusBadge = (status) => {
  const s = String(status).toLowerCase();
  if (s === "submitted" || s === "applied") return <span className="badge-status badge-submitted">Submitted</span>;
  if (s === "approved" || s === "completed" || s === "active") return <span className="badge-status badge-approved">Approved</span>;
  if (s === "pending" || s === "in progress") return <span className="badge-status badge-pending">Pending</span>;
  if (s === "under review" || s === "under_review") return <span className="badge-status badge-under-review">Under Review</span>;
  if (s === "escalated") return <span className="badge-status badge-escalated">Escalated</span>;
  if (s === "rejected" || s === "error" || s === "failed") return <span className="badge-status badge-rejected">Rejected</span>;
  return <span className="badge-status badge-inactive">Inactive</span>;
};

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
  const [lang, setLang] = useState("English");
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        
        // Live update the dashboard statistics when a new notification arrives
        API.get("/api/user/dashboard").then(r => setDashboard(r.data)).catch(() => { });
        API.get("/api/user/profile").then(r => login({ user: r.data, token: localStorage.getItem("nc_token") })).catch(() => { });
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
  const activeSchemes = dashboard?.schemes?.filter(s => s.status !== "completed" && s.status !== "matched") || [];
  const activeCount = activeSchemes.length;
  const complaints = dashboard?.complaints || [];

  const SIDEBAR_ITEMS = [
    { id: "p-home", icon: "🏠", label: "My Dashboard", section: "Dashboard" },
    { id: "p-schemes", icon: "🏛️", label: "Apply for Schemes", section: "Schemes" },
    { id: "p-active", icon: "📋", label: "Active Tracking", count: activeCount },
    { id: "p-past", icon: "📁", label: "Completed", section: null },
    { id: "p-docs", icon: "🔐", label: "Document Locker", section: "Tools" },
    { id: "p-family", icon: "👨‍👩‍👧", label: "Family Section" },
    { id: "p-complaints", icon: "📢", label: "Complaints", count: complaints.filter(c => c.status !== 'resolved').length || 0 },
    { id: "p-edit", icon: "✏️", label: "Edit Profile", section: null },
  ];

  return (
    <div className="citizen-scope">
      <div id="app-user" className="app on" style={{ flexDirection: 'row' }}>

        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay open"
            onClick={() => setSidebar(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sidebar-brand-header" style={{ padding: '0px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <Logo size={28} color="#2563EB" />
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              NagarVaani
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 500, marginTop: '-2px' }}>Citizen Portal</div>
            </div>
          </div>

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
                  {item.count > 0 && (
                    <span className="sbadge">{item.count}</span>
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
        <div className="layout" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
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
              
              {/* Search Bar inside header brand area, next to hamburger */}
              <div className="nav-search" style={{ marginLeft: 0 }}>
                <input
                  type="text"
                  placeholder="Search schemes, services, complaints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="nav-r">
              {/* Language Selector */}
              <div className="nav-lang">
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select">
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी</option>
                </select>
              </div>

              {/* Help & Support */}
              <div className="nav-help" style={{ position: "relative" }}>
                <button className="help-btn" onClick={() => setHelpOpen(!helpOpen)}>
                  ❓ Help Desk
                </button>
                {helpOpen && (
                  <div className="help-dropdown">
                    <h4>Help Desk Support</h4>
                    <p>📞 Toll-Free: 1800-123-4567</p>
                    <p>📧 Email: support@nagarvaani.gov.in</p>
                    <div className="help-divider"></div>
                    <a href="#faqs" onClick={() => { setHelpOpen(false); alert("FAQs Section: Navigating to Help center."); }}>View FAQ Document</a>
                  </div>
                )}
              </div>

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
              
              {/* Citizen Profile */}
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

        {/* ── MAIN CONTENT ── */}
        <main className="main" onClick={() => { if (sidebarOpen) setSidebar(false); }}>
          <div className="dashboard-container">
            {page !== 'p-home' && page !== 'p-schemes' && page !== 'p-active' && page !== 'p-past' && page !== 'p-family' && page !== 'p-complaints' && page !== 'p-edit' && page !== 'p-docs' && (
              <div className="page-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--nv)', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ opacity: 0.8 }}>{SIDEBAR_ITEMS.find(item => item.id === page)?.icon}</span>
                  {SIDEBAR_ITEMS.find(item => item.id === page)?.label || 'Dashboard'}
                </h1>
              </div>
            )}
            {page === "p-home" && <HomeDash user={dashboard?.user || u} d={dashboard} maskAadhaar={maskAadhaar} fmtIncome={fmtIncome} goPage={goPage} appliedCount={activeCount} />}
            {page === "p-schemes" && <SchemesPage user={u} goPage={goPage} />}
            {page === "p-active" && <ActiveSchemes user={u} filterState="active" />}
            {page === "p-past" && <ActiveSchemes user={u} filterState="completed" />}
            {page === "p-docs" && <DocumentLocker user={u} />}
            {page === "p-family" && <FamilySection user={u} />}
            {page === "p-complaints" && <ComplaintsPage user={u} />}
            {page === "p-edit" && (
              <EditProfile
                onBack={() => goPage("p-home")}
                onComplaints={() => goPage("p-complaints")}
                onSaved={(updated) => {
                  login({ user: updated, token: localStorage.getItem("nc_token") });
                  goPage("p-home");
                }}
              />
            )}
          </div>
        </main>
        </div>

      {/* ── CHATBOT FAB ── */}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="AI Assistant">🤖</button>

      {chatOpen && (
        <div className="chat-win op">
          <div className="chat-hdr">
            <div className="chat-hdr-av">🤖</div>
            <div className="chat-hdr-info">
              <div className="chat-hdr-name">NagarVaani AI</div>
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
    </div>
  );
}

// ── HOME DASHBOARD ─────────────────────────────────────────────────────────────
function HomeDash({ user: u, d, maskAadhaar, fmtIncome, goPage, appliedCount }) {
  const documentsVerified = 4; // Mock value
  const complaints = d?.complaints || [];

  return (
    <div className="page on">
      {/* ── HERO SECTION ── */}
      <div className="hero-modern-saas" style={{ marginBottom: 32 }}>
        <div className="hero-saas-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <span>🏠</span> Dashboard Overview
          </div>
          <h1 className="hero-saas-title">
            Welcome back, {u.full_name?.split(' ')[0] || "Citizen"}! 👋
          </h1>
          <p className="hero-saas-desc">
            Your personalized civic dashboard. Track applications, view benefits, and discover AI-matched schemes tailored to your profile.
          </p>
          <div className="hero-saas-stats">
            <div className="hero-saas-stat-card">
              <span>💳</span> ₹{(u.total_benefits || 0).toLocaleString('en-IN')} Received
            </div>
            <div className="hero-saas-stat-card">
              <span>📋</span> {appliedCount} Active Apps
            </div>
            <div className="hero-saas-stat-card">
              <span>⭐</span> {u.civic_score || 74} Beneficiary Score
            </div>
          </div>
        </div>

        <div className="hero-saas-visual">
          <div className="hero-floating-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Identity Verification</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Govt verified details</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#10B981', fontSize: 14 }}>✅</span>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Aadhaar Linked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: u.voter_id ? '#10B981' : '#94A3B8', fontSize: 14 }}>{u.voter_id ? '✅' : '⏳'}</span>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Voter ID {u.voter_id ? 'Linked' : 'Pending'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: documentsVerified > 0 ? '#10B981' : '#94A3B8', fontSize: 14 }}>{documentsVerified > 0 ? '✅' : '⏳'}</span>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{documentsVerified} Docs in Locker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: "🤖", title: "AI Matched Schemes", sub: "See your eligible schemes", page: "p-schemes", color: "#F59E0B", bg: "#FFFBEB" },
          { icon: "📋", title: "Active Tracking", sub: "Track real-time progress", page: "p-active", color: "#2563EB", bg: "#EFF6FF" },
          { icon: "📢", title: "File Complaint", sub: "Auto-escalation to State", page: "p-complaints", color: "#DC2626", bg: "#FEF2F2" },
          { icon: "🔐", title: "Document Locker", sub: "Secure vault", page: "p-docs", color: "#7C3AED", bg: "#FAF5FF" },
        ].map(card => (
          <div key={card.page}
            onClick={() => goPage(card.page)}
            style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: `5px solid ${card.color}`,
              borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 3: Recommendations & Active Apps ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* AI Recommendations */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 24,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>AI Scheme Matches</span>
            </div>
            <button onClick={() => goPage("p-schemes")} style={{ background: '#F1F5F9', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>98% Match</span>
                <span style={{ fontSize: 18 }}>🌾</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>PM Kisan Samman Nidhi</div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16, lineHeight: 1.4 }}>Based on your rural land holding.</div>
              <button className="btn-apply-modern" style={{ width: '100%', padding: '8px', fontSize: 13 }}>Apply Now</button>
            </div>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>85% Match</span>
                <span style={{ fontSize: 18 }}>🏥</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>Ayushman Bharat PMJAY</div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16, lineHeight: 1.4 }}>Free health coverage up to 5 Lakhs.</div>
              <button className="btn-apply-modern" style={{ width: '100%', padding: '8px', fontSize: 13 }}>Apply Now</button>
            </div>
          </div>
        </div>

        {/* Active Applications */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 24,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Active Applications</span>
            </div>
            <button onClick={() => goPage("p-active")} style={{ background: '#F1F5F9', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Details</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {d?.schemes?.length > 0 ? d.schemes.slice(0, 4).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: i !== Math.min(d.schemes.length-1, 3) ? "1px solid #F1F5F9" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{s.schemes?.name || s.scheme_name || "Scheme"}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Last updated: Today</div>
                </div>
                {s.status && <span className={`status-badge-modern ${s.status}`}>{s.status}</span>}
              </div>
            )) : (
              <div style={{ fontSize: 13, color: "#64748B", padding: "16px 0", textAlign: "center", background: "#F8FAFC", borderRadius: 12 }}>No active applications</div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Details & Family ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingBottom: 32 }}>
        {/* Personal Info */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 24,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Personal Profile</span>
            </div>
            <button onClick={() => goPage("p-edit")} style={{ background: '#F1F5F9', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Full Name</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{u.full_name || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Date of Birth</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{u.date_of_birth || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Aadhaar</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{maskAadhaar(u.aadhaar_number)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Income</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{fmtIncome(u.annual_income)}</div>
            </div>
          </div>
        </div>

        {/* Complaints Mini */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 24,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📢</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Complaints</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, flex: 1 }}>
            You have <strong style={{color: '#0F172A'}}>{complaints.filter(c => c.status !== 'resolved').length} active complaints</strong>. If you are facing issues with any state service, log a grievance directly with the CM office for auto-escalation.
          </div>
          <button className="btn-apply-modern" style={{ width: '100%', padding: '10px', fontSize: 13, marginTop: 16 }} onClick={() => goPage("p-complaints")}>File a Complaint</button>
        </div>

        {/* Family Mini */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 24,
          boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍👩‍👧</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Family Registry</span>
            </div>
            <button onClick={() => goPage("p-family")} style={{ background: '#F1F5F9', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Manage</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ fontSize: 48, background: '#F8FAFC', padding: '12px', borderRadius: '50%' }}>👪</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>0 Members</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Add dependents to claim family schemes.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}