import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './hooks/useAuth';
import { LiveRegion } from './components/a11y/LiveRegion';
import { SkipNav } from './components/a11y/SkipNav';

const Landing = React.lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const LogActivity = React.lazy(() => import('./pages/LogActivity').then(m => ({ default: m.LogActivity })));
const Insights = React.lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));
const Analysis = React.lazy(() => import('./pages/Analysis').then(m => ({ default: m.Analysis })));
const TransportCompare = React.lazy(() => import('./pages/TransportCompare').then(m => ({ default: m.TransportCompare })));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AnnualReport = React.lazy(() => import('./pages/AnnualReport').then(m => ({ default: m.AnnualReport })));

/* ── SVG Icons ── */
const NavIcons: Record<string, React.ReactNode> = {
  dashboard: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  log: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  insights: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  analysis: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
  report: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  compare: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
  leaderboard: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
  settings: <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const NAV_LINKS = [
  { path: '/dashboard',     label: 'Dashboard', key: 'dashboard' },
  { path: '/annual-report', label: 'Report',    key: 'report' },
  { path: '/log',           label: 'Log',       key: 'log' },
  { path: '/insights',      label: 'Insights',  key: 'insights' },
  { path: '/analysis',      label: 'Deep Dive', key: 'analysis' },
  { path: '/compare',       label: 'Compare',   key: 'compare' },
  { path: '/leaderboard',   label: 'Rank',      key: 'leaderboard' },
  { path: '/settings',      label: 'Settings',  key: 'settings' },
] as const;

function LogoMark() {
  return (
    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg border border-green-300/30 relative overflow-hidden shrink-0"
      style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', boxShadow: '0 4px 20px rgba(16,185,129,0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}>
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      
      {/* Leaf SVG */}
      <svg className="w-5 h-5 text-white drop-shadow-md relative z-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.5 2C15.5 2 12 3 9.5 5.5C6.5 8.5 5 13 5 17L3 19L4.5 20.5L6.5 18.5C10.5 18.5 15 17 18 14C20.5 11.5 21.5 8 21.5 6C21.5 4 20 2 17.5 2Z" />
      </svg>
    </div>
  );
}

function Sidebar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  if (!user || location.pathname === '/') return null;

  return (
    <aside className="sidebar hidden md:flex flex-col w-60 min-h-screen flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'rgba(22,163,74,0.1)' }}>
        <LogoMark />
        <div>
          <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>EcoTrace</span>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="glow-dot" style={{ width: 5, height: 5 }} />
            <span className="text-xs" style={{ color: 'var(--accent)', fontWeight: 600 }}>AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="label px-3 mb-3">Menu</p>
        {NAV_LINKS.map(link => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link key={link.path} to={link.path} className={`nav-link ${isActive ? 'active' : ''}`}>
              {NavIcons[link.key]}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: 'rgba(22,163,74,0.1)' }}>
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(22,163,74,0.06)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'var(--gradient-brand)' }}>
            {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.displayName || 'Eco Warrior'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <button onClick={() => logout?.()}
            className="flex-shrink-0 transition-colors"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}
            title="Sign out" aria-label="Sign out">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || location.pathname === '/') return null;

  const mobileLinks = NAV_LINKS.slice(0, 5);
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-2 py-1">
      {mobileLinks.map(link => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link key={link.path} to={link.path} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
            <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', display: 'flex' }}>
              {NavIcons[link.key]}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AppContent() {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <main id="main-content" className="flex-1 min-w-0 pb-20 md:pb-0 overflow-y-auto relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        }>
          <Routes>
            <Route path="/"               element={<Landing />} />
            <Route path="/dashboard"      element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/annual-report"  element={<AuthGuard><AnnualReport /></AuthGuard>} />
            <Route path="/log"            element={<AuthGuard><LogActivity /></AuthGuard>} />
            <Route path="/insights"       element={<AuthGuard><Insights /></AuthGuard>} />
            <Route path="/analysis"       element={<AuthGuard><Analysis /></AuthGuard>} />
            <Route path="/compare"        element={<AuthGuard><TransportCompare /></AuthGuard>} />
            <Route path="/leaderboard"    element={<AuthGuard><Leaderboard /></AuthGuard>} />
            <Route path="/settings"       element={<AuthGuard><Settings /></AuthGuard>} />
          </Routes>
        </Suspense>
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SkipNav />
      <LiveRegion />
      <AppContent />
    </Router>
  );
}
