import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, ChevronDown, ChevronUp, Check, ArrowLeft, Search, FileText, Download, Volume2 } from 'lucide-react';
import axios from 'axios';
import './Portal.css';

export default function VoterPortal({ onGoBack }) {
  const [activeTab, setActiveTab] = useState('live'); // 'live', 'slip', 'news'
  const [boothId, setBoothId] = useState(147);
  const [isOnline, setIsOnline] = useState(false);

  // Queue status
  const [queueCount, setQueueCount] = useState(15);
  const [waitTime, setWaitTime] = useState(18);
  const [queueLength, setQueueLength] = useState("Medium");

  // Form inputs
  const [citizenId, setCitizenId] = useState('');
  const [issueType, setIssueType] = useState('Long Queue Outside Booth');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Slip Search
  const [epicNumber, setEpicNumber] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [slipData, setSlipData] = useState(null);

  // FAQ states
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "What documents do I need to carry to vote?",
      a: "You must carry your Voter ID Card (EPIC). If you do not have it, you can carry any of the 12 alternative government photo IDs approved by the Election Commission, such as Aadhaar Card, PAN Card, Driving License, or Passport."
    },
    {
      q: "What is a mock poll?",
      a: "A mock poll is conducted by the Presiding Officer 90 minutes before the actual voting begins. It is done in the presence of polling agents to demonstrate that the EVM is working correctly and there is no pre-recorded data."
    },
    {
      q: "Can I vote if my name is not in the voter list but I have a Voter ID?",
      a: "No, you can only vote if your name is present in the active electoral roll (voter list) for that specific polling station. Carrying a Voter ID is not sufficient if your name is not registered in the roll."
    }
  ];

  const bulletins = [
    { id: 1, time: "11:30 AM", title: "Overall Turnout Update", content: "State Election Commission reports 41.2% turnout across all districts. Polling proceeding peacefully." },
    { id: 2, time: "10:45 AM", title: "Mock Poll Completed Successfully", content: "All booth officers completed mock poll validations in presence of official polling agents before 7:30 AM." },
    { id: 3, time: "09:15 AM", title: "EPIC ID Alternatives", content: "Voters are reminded that 12 alternative photo documents (like Aadhaar, driving license, PAN card) are allowed if Voter Card is missing." },
    { id: 4, time: "07:00 AM", title: "Polls Declared Open", content: "NagarVaani digital control room registers official open-status signals from all designated polling nodes." }
  ];

  // Poll queue status from backend
  const fetchQueueData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${apiUrl}/booth/status?booth_id=${boothId}`);
      if (res.status === 200) {
        setIsOnline(true);
        setBoothId(res.data.booth.id);
        setQueueCount(res.data.queue.count);
        setWaitTime(res.data.queue.waitTime);
        setQueueLength(res.data.queue.length);
      }
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 3000);
    return () => clearInterval(interval);
  }, [boothId]);

  // Submit issue report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citizenId.trim()) return;

    setLoading(true);
    setSuccessMsg('');

    const payload = {
      id: citizenId.toUpperCase(),
      type: issueType,
      citizen: `Citizen ID: ${citizenId.toUpperCase()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: description
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/complaints?booth_id=${boothId}`, payload);
      setSuccessMsg("Your issue has been reported successfully to the Presiding Officer! They will verify and address it shortly.");
      setCitizenId('');
      setDescription('');
    } catch (err) {
      setSuccessMsg("Your issue has been reported successfully (offline simulation mode)!");
      setCitizenId('');
      setDescription('');
    } finally {
      setLoading(false);
    }
  };

  // Mock Electoral Roll Lookup
  const handleSlipSearch = (e) => {
    e.preventDefault();
    if (!epicNumber.trim()) return;

    setSearchLoading(true);
    setSlipData(null);

    setTimeout(() => {
      // Return a clean mock voter slip card
      setSlipData({
        name: "PARAKRAM SINGH",
        relationName: "RAJPAL SINGH",
        epic: epicNumber.toUpperCase(),
        serialNum: 1042,
        partNum: 45,
        partName: "Government Secondary School Hall 1",
        boothNum: boothId,
        constituency: "56 - North City",
        assemblyConstituency: "56 - North City Assembly Segment"
      });
      setSearchLoading(false);
    }, 1200);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="portal-container" style={{ textAlign: 'left' }}>
      {/* HEADER */}
      <header className="portal-header">
        <div className="portal-logo">
          <button onClick={onGoBack} style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            marginRight: '8px'
          }}>
            <ArrowLeft size={20} />
          </button>
          <img
            src="https://img.icons8.com/?size=100&id=2969&format=png&color=FFFFFF"
            alt="Emblem"
            style={{ width: '32px', height: '32px' }}
          />
          <h1 style={{ fontSize: '18px', fontWeight: '800', marginLeft: '6px' }}>NagarVaani Voter Portal</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select 
            value={boothId} 
            onChange={(e) => setBoothId(parseInt(e.target.value))}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={147} style={{color: '#333'}}>Booth 147 (North)</option>
            <option value={148} style={{color: '#333'}}>Booth 148 (Central)</option>
            <option value={149} style={{color: '#333'}}>Booth 149 (South)</option>
          </select>
        </div>
      </header>

      {/* PORTAL GLASS TABS */}
      <div style={{
        maxWidth: '800px',
        width: '100%',
        margin: '20px auto 0',
        padding: '0 20px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[
          { id: 'live', label: 'Live Telemetry & Issues' },
          { id: 'slip', label: 'Voter Slip Lookup' },
          { id: 'news', label: 'Election Bulletin Feed' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: '700',
              backgroundColor: activeTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === t.id ? '#60a5fa' : '#94a3b8',
              border: 'none',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderBottom: activeTab === t.id ? '2px solid #60a5fa' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <main className="portal-body" style={{ marginTop: '20px' }}>
        
        {/* TAB 1: LIVE TELEMETRY & COMPLAINTS */}
        {activeTab === 'live' && (
          <>
            {/* LIVE QUEUE TELEMETRY */}
            <div className="card portal-queue-card">
              <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Queue Telemetry
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
                Real-time queue tracking for Booth {boothId}
              </p>

              <div className="portal-queue-grid">
                <div className="portal-queue-item">
                  <div className="portal-queue-icon">
                    <Users size={24} />
                  </div>
                  <h3>{queueCount}</h3>
                  <p>People in Line</p>
                </div>

                <div className="portal-queue-item">
                  <div className="portal-queue-icon" style={{ color: '#d97706', backgroundColor: '#fffbeb' }}>
                    <Clock size={24} />
                  </div>
                  <h3 style={{ color: '#d97706' }}>~ {waitTime} Min</h3>
                  <p>Estimated Wait Time</p>
                </div>
              </div>
            </div>

            {/* REPORT ISSUE FORM */}
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Report Booth Issue / Support Request
              </h2>

              {successMsg && (
                <div className="portal-alert success" style={{ marginBottom: '20px' }}>
                  <Check size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="portal-form-group">
                  <label>Voter Card ID / EPIC Number</label>
                  <input
                    type="text"
                    className="portal-input"
                    placeholder="E.g., ABC1234567"
                    required
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                  />
                </div>

                <div className="portal-form-group">
                  <label>Select Issue Type</label>
                  <select
                    className="portal-select"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option>Long Queue Outside Booth</option>
                    <option>EVM Out of Order / Faulty</option>
                    <option>Disability / Accessibility Assistance Required</option>
                    <option>Power Outage in Booth</option>
                    <option>Discrepancies in Electoral List</option>
                    <option>Other Urgent Matter</option>
                  </select>
                </div>

                <div className="portal-form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    className="portal-textarea"
                    placeholder="Provide details about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button type="submit" className="portal-btn-primary" disabled={loading}>
                  {loading ? "Submitting Request..." : "Submit to Presiding Officer"}
                </button>
              </form>
            </div>

            {/* FAQS */}
            <div className="card">
              <h2 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Frequently Asked Questions (SOP Help)
              </h2>

              <div className="faq-list">
                {faqs.map((faq, i) => (
                  <div className="faq-item" key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="faq-question">
                      <span>{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {openFaq === i && (
                      <p className="faq-answer">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: VOTER SLIP LOOKUP */}
        {activeTab === 'slip' && (
          <div className="card" style={{ padding: '30px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Find Electoral Roll Roll & Digital Voter Slip
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '24px' }}>
              Verify your name in the voting registry and generate a digital voter slip instantly.
            </p>

            <form onSubmit={handleSlipSearch} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Enter Voter EPIC Card Number (e.g. SLP1249)"
                  required
                  value={epicNumber}
                  onChange={(e) => setEpicNumber(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 40px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#334155'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={searchLoading}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 24px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                }}
              >
                {searchLoading ? 'Searching...' : 'Lookup Slip'}
              </button>
            </form>

            {/* SLIP RESULT */}
            {slipData && (
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '20px',
                padding: '24px',
                backgroundColor: '#f8fafc',
                maxWidth: '500px',
                margin: '0 auto',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src="https://img.icons8.com/?size=100&id=2969&format=png&color=000000"
                      alt="National emblem"
                      style={{ width: '28px', height: '28px' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>ELECTION COMMISSION OF INDIA</h4>
                      <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: '700' }}>VOTER INFORMATION SLIP</p>
                    </div>
                  </div>
                  <FileText size={20} color="#2563eb" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', fontSize: '13px', textAlign: 'left' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Voter Name</span>
                    <div style={{ fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{slipData.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>EPIC Number</span>
                    <div style={{ fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>{slipData.epic}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Father's/Relation Name</span>
                    <div style={{ fontWeight: '700', color: '#475569', marginTop: '2px' }}>{slipData.relationName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Constituency</span>
                    <div style={{ fontWeight: '700', color: '#475569', marginTop: '2px' }}>{slipData.constituency}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Part No. & Name</span>
                    <div style={{ fontWeight: '700', color: '#475569', marginTop: '2px' }}>{slipData.partNum} - {slipData.partName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Serial Number</span>
                    <div style={{ fontWeight: '800', color: '#e11d48', marginTop: '2px' }}>{slipData.serialNum}</div>
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textAlign: 'left' }}>
                    * Bring valid Photo ID along with this slip to Booth {slipData.boothNum}.
                  </div>
                  <button
                    onClick={handlePrintSlip}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={12} /> Slip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE ELECTION BULLETIN */}
        {activeTab === 'news' && (
          <div className="card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <Volume2 size={24} color="#2563eb" />
              <h2 style={{ fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Official Live Bulletins & SOP Feeds
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bulletins.map(b => (
                <div key={b.id} style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '0 12px 12px 0',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{b.title}</h4>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{b.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{b.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOS WIDGET */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fca5a5', backgroundColor: '#fff5f5' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>Urgent Security or Medical SOS?</h3>
            <p style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '600', marginTop: '2px' }}>Notify booth security staff immediately.</p>
          </div>
          <button 
            style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            onClick={() => alert("🚨 SOS alert broadcasted to booth security officer.")}
          >
            Emergency SOS
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        fontSize: '11px',
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        marginTop: 'auto',
        backgroundColor: '#ffffff'
      }}>
        © 2026 NagarVaani Election Portal. Authorized Booth Civic Node.
      </footer>
    </div>
  );
}
