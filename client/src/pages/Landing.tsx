import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

/* ── Leaf SVG icon (tiny, rotated randomly) ── */
function LeafIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
      <path d="M12 21C12 21 10 17 9 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Particle layers: near (fast+big) and far (slow+small) ── */
const NEAR_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: `near-${i}`,
  size: Math.random() * 10 + 10,        // 10–20px
  left: Math.random() * 90 + 5,         // 5–95%
  delay: Math.random() * 8,
  duration: Math.random() * 10 + 18,   // 18–28s
  rotate: Math.random() * 360,
  rotateSpeed: (Math.random() - 0.5) * 2,
  color: ['#16a34a', '#22c55e', '#15803d'][Math.floor(Math.random() * 3)],
  opacity: Math.random() * 0.35 + 0.2,
  depth: 1, // near
}));

const FAR_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: `far-${i}`,
  size: Math.random() * 5 + 4,          // 4–9px
  left: Math.random() * 90 + 5,
  delay: Math.random() * 14,
  duration: Math.random() * 18 + 28,   // 28–46s
  rotate: Math.random() * 360,
  rotateSpeed: (Math.random() - 0.5) * 1,
  color: ['#16a34a', '#4ade80', '#bbf7d0'][Math.floor(Math.random() * 3)],
  opacity: Math.random() * 0.2 + 0.08,
  depth: 0.3, // far (moves less with parallax)
}));

const ALL_PARTICLES = [...NEAR_PARTICLES, ...FAR_PARTICLES];

/* ── Feature pills data ── */
const FEATURES = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    label: 'Gemini AI Coach',
    desc: 'Personalized sustainability tips from Google AI',
    color: '#16a34a',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Real-time CO₂ tracking',
    desc: 'Instant calculations for every activity you log',
    color: '#d97706',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Community Leaderboard',
    desc: 'Compare with others and stay motivated',
    color: '#7c3aed',
  },
];

export function Landing() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Mouse parallax state
  const mouseRef = useRef({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Scroll reveal for social proof section
  const { ref: socialRef, visible: socialVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.5 });
  const userCount = useCountUp(2400, socialVisible, { duration: 1800, easing: 'easeOut' });

  // Hero stagger state
  const [heroStage, setHeroStage] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Stagger hero elements
    const timers = [
      setTimeout(() => setHeroStage(1), 100),
      setTimeout(() => setHeroStage(2), 250),
      setTimeout(() => setHeroStage(3), 450),
      setTimeout(() => setHeroStage(4), 680),
      setTimeout(() => setHeroStage(5), 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (clientX / width - 0.5) * 2,   // -1 to 1
      y: (clientY / height - 0.5) * 2,
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setParallax({ x: mouseRef.current.x * 18, y: mouseRef.current.y * 12 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => setParallax({ x: 0, y: 0 }));
  }, []);

  if (loading) return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'var(--gradient-brand)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading EcoTrace…</p>
      </div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;

  const staggerStyle = (stage: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    opacity: heroStage >= stage ? 1 : 0,
    transform: heroStage >= stage ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1)',
    ...extra,
  });

  return (
    <div
      className="min-h-svh relative overflow-hidden flex items-center justify-center py-10 px-5"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* ── Background decorative blobs (parallax layer 0.5x) ── */}
      <div className="absolute pointer-events-none" style={{
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.14) 0%, transparent 70%)',
        top: -280, left: -200,
        transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.4}px)`,
        transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1)',
        animation: 'blob-drift 12s ease-in-out infinite',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
        bottom: -200, right: -100,
        transform: `translate(${-parallax.x * 0.3}px, ${-parallax.y * 0.3}px)`,
        transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1)',
        animation: 'blob-drift 16s ease-in-out infinite reverse',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        top: '40%', left: '55%',
        transform: `translate(${parallax.x * 0.7}px, ${parallax.y * 0.5}px)`,
        transition: 'transform 600ms cubic-bezier(0.4,0,0.2,1)',
        animation: 'blob-drift 10s ease-in-out infinite 2s',
      }} />

      {/* ── Leaf particles ── */}
      {mounted && ALL_PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
            opacity: p.opacity,
            // Parallax offset scaled by depth
            transform: `translate(${parallax.x * p.depth * 8}px, ${parallax.y * p.depth * 5}px)`,
            transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)',
            animation: `float-particle ${p.duration}s linear ${p.delay}s infinite, leaf-spin ${Math.abs(p.rotateSpeed) * 12 + 8}s linear ${p.delay}s infinite ${p.rotateSpeed < 0 ? 'reverse' : ''}`,
          }}
        >
          <LeafIcon size={p.size} color={p.color} />
        </div>
      ))}

      {/* ── Grid dot pattern (parallax 0.2x) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(22,163,74,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          transform: `translate(${parallax.x * 0.2}px, ${parallax.y * 0.15}px)`,
          transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-14">

        {/* ── LEFT: Hero copy ── */}
        <div className="flex-1 max-w-lg text-center lg:text-left">

          {/* Logo lockup */}
          <div style={staggerStyle(1, { display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 32 })}>
            <div className="relative">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/80"
                style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 8px 24px var(--accent-glow)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V24M7.5 14l1.5-1.5 1 2 1.5-3 1.5 2 1.5-1" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black tracking-tight text-white">EcoTrace</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                AI-Powered
              </span>
            </div>
          </div>

          {/* Headline — word-by-word stagger */}
          <h1 className="hero-title mb-5" style={{ lineHeight: 1.05 }}>
            {/* "Track what" */}
            <span style={staggerStyle(2, { display: 'inline-block' })}>Track what</span>
            <br />
            {/* "matters most." with gradient underline draw-on */}
            <span
              className="hero-accent relative"
              style={{
                ...staggerStyle(3, { display: 'inline-block' }),
                transition: 'opacity 700ms cubic-bezier(0.4,0,0.2,1) 0ms, transform 700ms cubic-bezier(0.4,0,0.2,1) 0ms',
              }}
            >
              matters most.
              {/* Animated underline */}
              <span
                className="absolute left-0 bottom-0 h-[3px] rounded-full"
                style={{
                  background: 'var(--gradient-brand)',
                  width: heroStage >= 4 ? '100%' : '0%',
                  transition: 'width 800ms cubic-bezier(0.4,0,0.2,1) 200ms',
                  bottom: '-4px',
                }}
              />
            </span>
          </h1>

          <p
            className="text-base mb-10"
            style={{
              ...staggerStyle(3, { color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 400, margin: '0 auto 2.5rem' }),
            }}
          >
            EcoTrace uses Gemini AI to understand your carbon habits and gives you precise, actionable steps to reduce them — not just graphs, real change.
          </p>

          {/* Feature pills — each staggered */}
          <div
            className="flex flex-col gap-3 mb-10"
            style={{ maxWidth: 380, margin: '0 auto 2.5rem', ...staggerStyle(4) }}
          >
            {FEATURES.map(({ icon, label, desc, color }, i) => (
              <div
                key={label}
                className="feature-pill"
                style={{
                  opacity: heroStage >= 4 ? 1 : 0,
                  transform: heroStage >= 4 ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 500ms ease ${i * 100}ms, transform 500ms cubic-bezier(0.4,0,0.2,1) ${i * 100}ms`,
                }}
              >
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

          {/* Social proof — count-up */}
          <div
            ref={socialRef}
            className="flex items-center gap-3 justify-center lg:justify-start"
            style={staggerStyle(5)}
          >
            <div className="flex -space-x-2">
              {['#16a34a', '#d97706', '#7c3aed', '#0891b2'].map(c => (
                <div key={c} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ background: `${c}20`, borderColor: '#fff' }}>
                  <svg className="w-4 h-4" fill={c} viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {socialVisible ? userCount.toLocaleString() : '2,400'}+
              </span>{' '}
              eco-warriors tracking daily
            </p>
          </div>
        </div>

        {/* ── RIGHT: Auth card ── */}
        <div
          className="w-full lg:w-[430px]"
          style={{
            opacity: heroStage >= 2 ? 1 : 0,
            transform: heroStage >= 2
              ? 'translateY(0)'
              : 'translateY(24px)',
            transition: 'opacity 700ms cubic-bezier(0.4,0,0.2,1), transform 700ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
