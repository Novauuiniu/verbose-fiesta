import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Auto Moderation',
    desc: 'AI-powered filters that detect spam, raids, and toxic content before they spread.',
    gradient: 'linear-gradient(135deg, #5865F2, #8A5CF6)'
  },
  {
    icon: 'fa-solid fa-gavel',
    title: 'Case Management',
    desc: 'Full moderation history with cases, warnings, and appeals — all in one place.',
    gradient: 'linear-gradient(135deg, #ff66b2, #d4418e)'
  },
  {
    icon: 'fa-solid fa-chart-pie',
    title: 'Live Analytics',
    desc: 'Real-time charts & insights on server activity, member growth, and mod actions.',
    gradient: 'linear-gradient(135deg, #63b3ff, #00A8FC)'
  },
  {
    icon: 'fa-solid fa-terminal',
    title: 'Command Center',
    desc: 'Browse, search, and document every bot command with a powerful catalog UI.',
    gradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    icon: 'fa-solid fa-user-shield',
    title: 'Account Manager',
    desc: 'View and manage your Discord profile, linked servers, and session info.',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  {
    icon: 'fa-solid fa-signal',
    title: 'Status Page',
    desc: 'Monitor bot uptime, ping, and service health at a glance.',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  }
];

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '<50ms', label: 'Avg Latency' },
  { value: '24/7', label: 'Monitoring' },
  { value: '∞', label: 'Scalability' }
];

export default function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('zenith_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          navigate('/dashboard');
          return;
        }
      } catch { /* invalid token, stay on home */ }
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav" style={{
        background: scrollY > 50 ? 'rgba(8, 9, 17, 0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent'
      }}>
        <div className="home-nav-inner">
          <div className="home-nav-brand">
            <span className="home-nav-logo">Z</span>
            <span className="brand-text-glow" style={{ fontSize: '1.4rem' }}>zyntra</span>
          </div>
          <div className="home-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Performance</a>
            <a href="/api/auth/login" className="btn-discord home-nav-cta">
              <i className="fa-brands fa-discord"></i> Login
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-glow" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <i className="fa-solid fa-bolt"></i>
            <span>AI-Powered Discord Moderation</span>
          </div>
          <h1 className="home-hero-title">
            Protect your server.<br />
            <span className="home-hero-accent">Empower your community.</span>
          </h1>
          <p className="home-hero-subtitle">
            zyntra is the all-in-one moderation platform for Discord — smart automation,
            deep analytics, and a beautiful dashboard built for teams that care.
          </p>
          <div className="home-hero-actions">
            <a href="/api/auth/login" className="btn-primary home-hero-btn">
              <i className="fa-brands fa-discord"></i> Get Started with Discord
            </a>
            <a href="#features" className="btn-secondary home-hero-btn-alt">
              Explore Features <i className="fa-solid fa-arrow-down"></i>
            </a>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-mockup">
            <div className="home-mockup-bar">
              <span className="home-dot red" />
              <span className="home-dot yellow" />
              <span className="home-dot green" />
              <span className="home-mockup-title">zyntra Dashboard</span>
            </div>
            <div className="home-mockup-body">
              <div className="home-mockup-sidebar">
                <div className="home-mockup-nav-item active"><i className="fa-solid fa-chart-pie"></i></div>
                <div className="home-mockup-nav-item"><i className="fa-solid fa-gavel"></i></div>
                <div className="home-mockup-nav-item"><i className="fa-solid fa-shield-halved"></i></div>
                <div className="home-mockup-nav-item"><i className="fa-solid fa-terminal"></i></div>
              </div>
              <div className="home-mockup-content">
                <div className="home-mockup-stat-row">
                  <div className="home-mockup-stat"><span>128</span><small>Servers</small></div>
                  <div className="home-mockup-stat"><span>54K</span><small>Users</small></div>
                  <div className="home-mockup-stat"><span>99.9%</span><small>Uptime</small></div>
                </div>
                <div className="home-mockup-chart">
                  <svg viewBox="0 0 200 60" className="home-chart-svg">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,102,178,0.4)" />
                        <stop offset="100%" stopColor="rgba(255,102,178,0)" />
                      </linearGradient>
                    </defs>
                    <path d="M0,50 Q25,45 50,35 T100,20 T150,30 T200,10" fill="none" stroke="#ff66b2" strokeWidth="2" />
                    <path d="M0,50 Q25,45 50,35 T100,20 T150,30 T200,10 L200,60 L0,60 Z" fill="url(#chartGrad)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats" id="stats">
        <div className="home-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="home-stat-card">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home-features" id="features">
        <div className="home-features-header">
          <span className="home-section-badge">Features</span>
          <h2>Everything your server needs</h2>
          <p>From AI-powered moderation to live analytics — one platform, zero compromises.</p>
        </div>
        <div className="home-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="home-feature-card glass-panel">
              <div className="home-feature-icon" style={{ background: f.gradient }}>
                <i className={f.icon}></i>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-inner glass-panel">
          <h2>Ready to level up your server?</h2>
          <p>Join thousands of communities already using zyntra for safer, smarter moderation.</p>
          <a href="/api/auth/login" className="btn-primary home-hero-btn">
            <i className="fa-brands fa-discord"></i> Login with Discord
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <span className="brand-text-glow" style={{ fontSize: '1.2rem' }}>zyntra</span>
            <p>AI Moderation Platform for Discord</p>
          </div>
          <div className="home-footer-links">
            <a href="#features">Features</a>
            <a href="#stats">Performance</a>
            <a href="/login">Dashboard</a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>&copy; {new Date().getFullYear()} zyntra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
