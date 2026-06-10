import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAnnouncer } from '../../hooks/useAnnouncer';

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { announce } = useAnnouncer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        announce('Signed in successfully');
      } else {
        await signUpWithEmail(email, password);
        announce('Account created successfully');
      }
    } catch (err: unknown) {
      const e = err as Error;
      const raw = e.message ?? 'Authentication failed';
      const clean = raw.replace('Firebase: ', '').replace(/ \(auth\/.*?\)\.?$/, '');
      setError(clean);
      announce(`Error: ${clean}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden" style={{ borderRadius: 28 }}>
      {/* ── Coloured top bar ── */}
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-brand)' }} />

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 8px 24px var(--accent-glow)' }}>
            {/* Leaf + pulse icon */}
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3C12 3 19 6.5 19 13.5C19 18 16 21 12 21C12 21 12 16 8 12C5 9 6 4.5 12 3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V24" />
            </svg>
          </div>
          <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome back' : 'Get started free'}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isLogin
              ? 'Sign in to your EcoTrace account'
              : 'Create your account and start tracking'}
          </p>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor={isLogin ? 'login-email' : 'signup-email'}>Email address</label>
            <input
              id={isLogin ? 'login-email' : 'signup-email'}
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? 'auth-error' : undefined}
            />
          </div>

          <div>
            <label className="field-label" htmlFor={isLogin ? 'login-password' : 'signup-password'}>Password</label>
            <div className="relative">
              <input
                id={isLogin ? 'login-password' : 'signup-password'}
                className="input-field"
                style={{ paddingRight: 48 }}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                aria-invalid={!!error}
                aria-describedby={error ? 'auth-error' : undefined}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 transition-colors p-3 flex items-center justify-center min-w-[48px] min-h-[48px]"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div id="auth-error" className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
              role="alert">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <button
            id={isLogin ? 'login-submit' : 'signup-submit'}
            type="submit"
            disabled={loading}
            className="btn btn-primary py-3.5 mt-1"
            style={{ fontSize: 15, borderRadius: 12 }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isLogin ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <button
            id="auth-toggle-btn"
            onClick={() => { setIsLogin(v => !v); setError(''); }}
            className="font-semibold transition-colors"
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up — it\'s free' : 'Sign in'}
          </button>
        </p>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-5 mt-6 pt-5"
          style={{ borderTop: '1px solid rgba(22,163,74,0.1)' }}>
          {[
            { icon: '🔒', text: 'Secure' },
            { icon: '🔥', text: 'Firebase' },
            { icon: '⚡', text: 'Instant' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
