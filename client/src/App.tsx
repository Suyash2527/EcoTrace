import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuth } from './hooks/useAuth';
import { LiveRegion } from './components/a11y/LiveRegion';
import { SkipNav } from './components/a11y/SkipNav';

import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { LogActivity } from './pages/LogActivity';
import { Insights } from './pages/Insights';
import { Analysis } from './pages/Analysis';
import { TransportCompare } from './pages/TransportCompare';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';

function Navigation() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user || location.pathname === '/') return null;

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/log', label: 'Log', icon: '✏️' },
    { path: '/insights', label: 'Insights', icon: '💡' },
    { path: '/analysis', label: 'Deep Dive', icon: '🔍' },
    { path: '/compare', label: 'Compare', icon: '⚖️' },
    { path: '/leaderboard', label: 'Rank', icon: '🏆' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="nav fixed bottom-0 left-0 right-0 md:relative md:w-64 h-16 md:h-screen flex md:flex-col items-center md:items-stretch justify-around md:justify-start overflow-x-auto md:overflow-visible z-40 pb-safe">
      <div className="hidden md:flex items-center p-6 border-b border-forest-400/20 mb-4">
        <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-forest-950 font-bold mr-3">
          E
        </div>
        <span className="font-bold text-cream-100 text-xl tracking-tight">EcoTrace</span>
      </div>
      
      {links.map((link) => {
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex md:w-full flex-col md:flex-row items-center md:px-6 py-2 md:py-3 transition-colors ${
              isActive ? 'nav-item-active bg-forest-800' : 'text-forest-300 hover:text-cream-100 hover:bg-forest-800/50'
            }`}
          >
            <span className="text-xl md:mr-3 mb-1 md:mb-0">{link.icon}</span>
            <span className="text-xs md:text-sm font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AppContent() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Navigation />
      <main id="main-content" className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/log" element={<AuthGuard><LogActivity /></AuthGuard>} />
          <Route path="/insights" element={<AuthGuard><Insights /></AuthGuard>} />
          <Route path="/analysis" element={<AuthGuard><Analysis /></AuthGuard>} />
          <Route path="/compare" element={<AuthGuard><TransportCompare /></AuthGuard>} />
          <Route path="/leaderboard" element={<AuthGuard><Leaderboard /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        </Routes>
      </main>
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
