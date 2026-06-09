import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  left: Math.random() * 100,
  delay: Math.random() * 15,
  duration: Math.random() * 18 + 22,
  opacity: Math.random() * 0.4 + 0.1,
}));

export function Landing() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (loading) return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'var(--gradient-brand)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading EcoTrace…</p>
      </div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-svh relative overflow-hidden flex items-center justify-center py-10 px-5"
      style={{ background: 'linear-gradient(160deg, #f0f9f4 0%, #e8f5ed 40%, #fef9ee 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute pointer-events-none" style={{
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.14) 0%, transparent 70%)',
        top: -280, left: -200, animation: 'blob-drift 12s ease-in-out infinite',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
        bottom: -200, right: -100, animation: 'blob-drift 16s ease-in-out infinite reverse',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        top: '40%', left: '55%', animation: 'blob-drift 10s ease-in-out infinite 2s',
      }} />

      {/* Floating particles */}
      {mounted && PARTICLES.map(p => (
        <div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            left: `${p.left}%`, bottom: '-10px',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s linear ${p.delay}s infinite`,
          }} />
      ))}

      {/* Grid dot pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(22,163,74,0.12) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-14">

        {/* ── LEFT: Hero copy ── */}
        <div className="flex-1 max-w-lg text-center lg:text-left">

          {/* Logo lockup */}
          <div className="inline-flex items-center gap-3 mb-8 animate-in">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--gradient-brand)', boxShadow: '0 8px 24px var(--accent-glow)' }}>
                {/* Leaf icon */}
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V24M7.5 14l1.5-1.5 1 2 1.5-3 1.5 2 1.5-1" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>EcoTrace</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="glow-dot" style={{ width: 6, height: 6 }} />
                <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="hero-title mb-5 animate-in delay-1">
            Track what<br />
            <span className="hero-accent">matters most.</span>
          </h1>

          <p className="text-base mb-10 animate-in delay-2"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 400, margin: '0 auto 2.5rem' }}>
            EcoTrace uses Gemini AI to understand your carbon habits and gives you precise, actionable steps to reduce them — not just graphs, real change.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-3 mb-10 animate-in delay-3" style={{ maxWidth: 380, margin: '0 auto 2.5rem' }}>
            {[
              {
                icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                label: 'Gemini AI Coach',
                desc: 'Personalized sustainability tips from Google AI',
                color: '#16a34a',
              },
              {
                icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                label: 'Real-time CO₂ tracking',
                desc: 'Instant calculations for every activity you log',
                color: '#d97706',
              },
              {
                icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                label: 'Community Leaderboard',
                desc: 'Compare with others and stay motivated',
                color: '#7c3aed',
              },
            ].map(({ icon, label, desc, color }) => (
              <div key={label} className="feature-pill">
                <div className="stat-icon" style={{ background: `${color}18`, color }}>
                  {icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 justify-center lg:justify-start animate-in delay-4">
            <div className="flex -space-x-2">
              {['#16a34a','#d97706','#7c3aed','#0891b2'].map(c => (
                <div key={c} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ background: `${c}20`, borderColor: '#fff' }}>
                  <svg className="w-4 h-4" fill={c} viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>2,400+</span> eco-warriors tracking daily
            </p>
          </div>
        </div>

        {/* ── RIGHT: Auth card ── */}
        <div className="w-full lg:w-[430px] animate-in delay-3">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
