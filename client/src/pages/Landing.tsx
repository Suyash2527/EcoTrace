import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';

export function Landing() {
  const { user, loading } = useAuth();
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // Generate some stable particles for the float animation
    setParticles(Array.from({ length: 15 }, (_, i) => i));
  }, []);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-forest-900 overflow-hidden relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* CSS Float Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(i => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-400/20 blur-sm mix-blend-screen"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `-${Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="hero-title mb-6 animate-in">
            Track less.<br />
            Live <span className="hero-accent">greener.</span>
          </h1>
          <p className="text-xl text-forest-300 max-w-2xl mx-auto lg:mx-0 mb-10 animate-in" style={{ animationDelay: '100ms' }}>
            EcoTrace uses AI to understand your carbon habits and shows you exactly how to cut them. 
            No more guessing. Just actionable insights for a sustainable life.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in" style={{ animationDelay: '200ms' }}>
            <div className="p-6 bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-400/20">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-cream-100 mb-2">AI Coach</h3>
              <p className="text-sm text-forest-300">Personalized tips based on your exact habits.</p>
            </div>
            <div className="p-6 bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-400/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-cream-100 mb-2">Real-time</h3>
              <p className="text-sm text-forest-300">Instant CO2 calculations for every action.</p>
            </div>
            <div className="p-6 bg-forest-800/50 backdrop-blur-sm rounded-2xl border border-forest-400/20">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-cream-100 mb-2">Leaderboard</h3>
              <p className="text-sm text-forest-300">Compare with others and stay motivated.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[450px] animate-in" style={{ animationDelay: '300ms' }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
