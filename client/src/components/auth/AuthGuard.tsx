import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-forest-900">
        <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full" aria-label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is logged in but hasn't completed onboarding, force them to onboarding
  // unless they are already on the settings/onboarding page
  if (profile && !profile.onboardingComplete && location.pathname !== '/settings') {
     // For this hackathon, we might just route them to settings to complete profile
     return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}
