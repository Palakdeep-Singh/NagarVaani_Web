import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';

const STATS = [
  { value: '1,000+', label: 'Verified Citizens Enrolled', icon: '🛡️' },
  { value: '124', label: 'Active State Initiatives', icon: '🏛️' },
  { value: '₹4.8 Cr', label: 'Capital Disbursed via DBT', icon: '💰' },
  { value: '7,045', label: 'Audited Transactions', icon: '⚡' },
];

const LEADERSHIP = [
  {
    level: 'Central Government',
    title: 'Hon\'ble Prime Minister',
    name: 'Shri Narendra Modi',
    img: '/pm-modi.png',
    desc: 'Driving national digital infrastructure and nationwide Direct Benefit Transfer (DBT) policies for 1.4 billion citizens.',
    color: '#FF9933'
  },
  {
    level: 'State Government',
    title: 'Hon\'ble Chief Minister',
    name: 'State Leadership',
    img: '/state-cm.png',
    desc: 'Executing state-specific welfare schemes, allocating jurisdictional budgets, and monitoring district-level civic progress.',
    color: '#1A2B4A'
  },
  {
    level: 'District Administration',
    title: 'District Magistrate / DC',
    name: 'Regional Executive',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    desc: 'Ensuring last-mile delivery, verifying localized applicant milestones, and resolving granular civic grievances directly.',
    color: '#138808'
  }
];

interface LandingPageProps {
  onCitizen: () => void;
  onAdmin: () => void;
}

export default function LandingPage({ onCitizen, onAdmin }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Animation states
  const [typedTitle, setTypedTitle] = useState('');
  const [showTagline, setShowTagline] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const fullTitle = "NAGARVAANI";

  useEffect(() => {
    // Scroll listener
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    
    // Looping Typing Animation
    let currentText = '';
    let loopTimeout: NodeJS.Timeout;

    const typeLoop = () => {
      if (currentText.length < fullTitle.length) {
        // Typing forward
        currentText = fullTitle.substring(0, currentText.length + 1);
        setTypedTitle(currentText);
        
        if (currentText.length === fullTitle.length) {
          setShowTagline(true);
          setAnimationComplete(true);
          return; // Stop permanently after first writing
        }
        
        loopTimeout = setTimeout(typeLoop, 150); // Typing speed
      }
    };

    // Start typing loop
    loopTimeout = setTimeout(typeLoop, 500);

    return () => {
      window.removeEventListener('scroll', handler);
      clearTimeout(loopTimeout);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── Dynamic Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all .3s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={36} color={scrolled ? '#0F172A' : '#fff'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              color: scrolled ? '#0F172A' : '#fff', 
              fontWeight: 400, fontSize: 24, 
              fontFamily: "'Great Vibes', cursive",
              letterSpacing: '0', 
              transition: 'all .3s' 
            }}>NagarVaani</span>
            <span style={{ color: scrolled ? '#64748B' : 'rgba(255,255,255,0.7)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .3s' }}>Govt. of India Initiative</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCitizen} style={{
            background: 'transparent', color: scrolled ? '#0F172A' : '#fff', border: `1px solid ${scrolled ? '#E2E8F0' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: 30, padding: '9px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'all .25s', letterSpacing: '.02em',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = scrolled ? '#F1F5F9' : 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >Citizen Login</button>
          
          <button onClick={onAdmin} style={{
            background: 'linear-gradient(135deg, #FF6B35, #FF9500)', color: '#fff', border: 'none',
            borderRadius: 30, padding: '9px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,107,53,0.35)', transition: 'all .25s', letterSpacing: '.02em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,107,53,0.35)'; }}
          >👑 CM Dashboard →</button>
        </div>
      </nav>

      {/* ── Cinematic Hero ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.95)), url("https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=2000")',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '100px 20px 60px',
      }}>
        {/* Animated Particles/Orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,153,51,0.15) 0%, transparent 60%)', top: '10%', right: '-5%', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', bottom: '-10%', left: '-5%', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Ashoka Chakra Centerpiece */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/1/17/Ashoka_Chakra.svg" 
          alt="Ashoka Chakra" 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(70vh, 80vw)',
            height: 'min(70vh, 80vw)',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'invert(1) brightness(2)',
          }}
        />

        {/* Indian Flag Gradient Line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 30, padding: '8px 20px', marginBottom: 40,
          backdropFilter: 'blur(12px)', opacity: showTagline ? 1 : 0, transition: 'opacity 1s ease',
        }}>
          <span style={{ fontSize: 18 }}>🏛️</span>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Government Digital Ecosystem</span>
        </div>

        {/* Typing Animation */}
        <h1 style={{
          fontSize: 'clamp(60px, 12vw, 140px)', fontWeight: 400, color: '#fff',
          textAlign: 'center', lineHeight: 1, marginBottom: 16,
          fontFamily: "'Great Vibes', cursive",
          letterSpacing: '0.02em', textShadow: '0 15px 45px rgba(0,0,0,0.6)',
          minHeight: '160px', display: 'flex', alignItems: 'center'
        }}>
          {typedTitle.charAt(0).toUpperCase() + typedTitle.slice(1).toLowerCase()}
          {!animationComplete && (
            <span style={{ width: 4, height: 'clamp(50px, 9vw, 90px)', background: '#FF9933', display: 'inline-block', marginLeft: 5 }} />
          )}
        </h1>

        {/* Fade-in Tagline */}
        <div style={{ 
          opacity: showTagline ? 1 : 0, transform: showTagline ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)', textAlign: 'center' 
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 300, color: '#E2E8F0',
            marginBottom: 30, letterSpacing: '-0.01em',
          }}>
            Every Voice, <span style={{ fontWeight: 700, color: '#FF9933' }}>Heard.</span> Every Right, <span style={{ fontWeight: 700, color: '#138808' }}>Delivered.</span>
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.65)',
            maxWidth: 700, lineHeight: 1.7, marginBottom: 50, fontWeight: 400, margin: '0 auto 50px'
          }}>
            A highly secure, AES-256 encrypted framework unifying civic grievances, 
            algorithmic scheme distribution, and real-time biometric disbursements into a single authoritative protocol.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={onCitizen}
              style={{
                background: '#fff', color: '#0F172A',
                border: 'none', borderRadius: 30, padding: '18px 40px',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 10px 35px rgba(255,255,255,0.2)',
                transition: 'all .3s', display: 'flex', alignItems: 'center', gap: 12,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 45px rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(255,255,255,0.2)'; }}
            >
              Enter Citizen Portal <span style={{ fontSize: 18, color: '#FF9933' }}>→</span>
            </button>
            <button
              onClick={onAdmin}
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,149,0,0.2))', color: '#fff',
                border: '1px solid rgba(255,107,53,0.4)', borderRadius: 30, padding: '18px 40px',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all .3s', display: 'flex', alignItems: 'center', gap: 12,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.35), rgba(255,149,0,0.35))'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,149,0,0.2))'; }}
            >
              👑 CM Dashboard Portal
            </button>
          </div>
        </div>
      </section>

      {/* ── 3-Tier Multi-Level Governance ── */}
      <section style={{ padding: '100px 20px', background: '#fff', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: 16 }}>
              A Robust Three-Tier Architecture
            </h2>
            <p style={{ fontSize: 17, color: '#64748B', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
              Operating seamlessly across Central, State, and District levels to ensure granular execution and uncompromising transparency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30 }}>
            {LEADERSHIP.map((ldr, i) => (
              <div key={i} style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20,
                overflow: 'hidden', transition: 'all .3s ease', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(15,23,42,0.08)'; e.currentTarget.style.borderColor = ldr.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ padding: '40px 30px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-block', background: ldr.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>
                    {ldr.level}
                  </div>
                  <div style={{ fontSize: 13, color: ldr.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{ldr.title}</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>{ldr.name}</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{ldr.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics Impact ── */}
      <section style={{
        background: '#0F172A', borderTop: '4px solid #FF9933',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: '48px 20px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginTop: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer Directive ── */}
      <section style={{
        background: '#fff', padding: '100px 20px', textAlign: 'center', borderTop: '1px solid #E2E8F0'
      }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0F172A', marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to Experience Public Digital Goods?</h2>
        <p style={{ color: '#64748B', fontSize: 16, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Join the nation-wide ecosystem ensuring zero-latency benefit mapping and automated citizen grievance redressal.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onCitizen} style={{
            background: '#FF9933', color: '#fff',
            border: 'none', borderRadius: 30, padding: '16px 40px',
            fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: '.02em',
            boxShadow: '0 10px 25px rgba(255,153,51,0.3)', transition: 'all .3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(255,153,51,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(255,153,51,0.3)'; }}
          >Access Portal</button>
        </div>
        <div style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32, opacity: 0.8, marginBottom: 8 }}>🏛️</div>
           <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>
            NAGARVAANI · GOVERNMENT OF INDIA © 2026
          </div>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Great+Vibes&display=swap');
      `}</style>
    </div>
  );
}
