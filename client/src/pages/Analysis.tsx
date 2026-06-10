import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useScrollReveal } from '../hooks/useScrollReveal';

/* Simple markdown → HTML renderer (no library needed) */
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/gs, (match) => `<ul class="md-ul">${match}</ul>`)
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/^(?!<[huli])(.+)$/gm, '<p class="md-p">$1</p>')
    .replace(/<p class="md-p"><\/p>/g, '');
}

export function Analysis() {
  const { user, profile } = useAuth();
  const { activities } = useActivities(user?.uid);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  const runDeepAnalysis = async (customQuestion?: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/analysis/deep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          activities,
          profile: {
            location: profile?.location || 'unknown',
            householdSize: profile?.householdSize || 1,
            carType: profile?.carType || 'none',
            dietType: profile?.dietType || 'omnivore',
            displayName: profile?.displayName || 'User',
          },
          question: customQuestion || question ||
            'Give me a comprehensive deep analysis of my carbon footprint with key patterns, comparisons to global averages, and a personalised action plan.',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ activities, profile }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `ecotrace-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch { alert('Export failed — try again later.'); }
    finally { setIsExporting(false); }
  };

  const PRESET_QUESTIONS = [
    'What is my biggest carbon problem area?',
    'How do I compare to the global average?',
    'Give me a 30-day action plan to reduce by 20%',
    'What lifestyle changes would have the biggest impact?',
  ];

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Deep Analysis
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Comprehensive Gemini AI evaluation of your full carbon lifestyle.
          </p>
        </div>
        <div className="flex gap-2">
          {analysis && (
            <button
              onClick={exportPdf}
              disabled={isExporting}
              className="btn btn-glass px-4 py-2.5 text-sm"
            >
              {isExporting ? 'Exporting…' : '↓ Export PDF'}
            </button>
          )}
          <button
            onClick={() => runDeepAnalysis()}
            disabled={loading}
            className="btn btn-primary px-5 py-2.5 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analysing…
              </span>
            ) : analysis ? 'Re-run Analysis' : 'Run Deep Analysis'}
          </button>
        </div>
      </div>

      {/* Custom question input */}
      <div className="glass-card">
        <p className="label mb-3">Ask a specific question (optional)</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. How can I reduce my food footprint by 30%?"
            className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && runDeepAnalysis()}
          />
          <button
            onClick={() => runDeepAnalysis()}
            disabled={loading}
            className="btn btn-primary px-4 py-2.5 text-sm shrink-0"
          >
            Ask
          </button>
        </div>
        {/* Preset questions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => { setQuestion(q); runDeepAnalysis(q); }}
              disabled={loading}
              className="text-xs py-1.5 px-3 rounded-full border transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderColor: 'rgba(124,58,237,0.25)',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.5)',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card" style={{ background: 'rgba(254,226,226,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm font-semibold text-red-700">Analysis failed</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Empty / prompt to run */}
      {!analysis && !loading && !error && (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.08))' }}>
            🧠
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Ready to dig deeper?
          </h3>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 2rem' }}>
            Gemini AI will analyse your entire activity history and generate a comprehensive long-form report on your environmental impact.
          </p>
          <button onClick={() => runDeepAnalysis()} className="btn btn-primary px-8 py-3 text-sm">
            Start Deep Analysis
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card py-16 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
          </div>
          <div className="text-center">
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Gemini AI is analysing your data…</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>This usually takes 10–20 seconds.</p>
          </div>
        </div>
      )}

      {/* Result */}
      {analysis && !loading && (
        <div className="glass-card">
          {/* Result header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(22,163,74,0.1)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Analysis Report</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generated {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Markdown content */}
          <div
            className="analysis-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
          />
        </div>
      )}

      {/* Inline styles for markdown */}
      <style>{`
        .analysis-content .md-h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 1.5rem 0 0.5rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid rgba(22,163,74,0.12);
        }
        .analysis-content .md-h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin: 1.25rem 0 0.375rem;
        }
        .analysis-content .md-p {
          font-size: 0.9rem;
          line-height: 1.75;
          color: var(--text-secondary);
          margin: 0.5rem 0;
        }
        .analysis-content .md-ul {
          list-style: none;
          margin: 0.5rem 0 0.5rem 0;
          padding: 0;
        }
        .analysis-content .md-ul li {
          font-size: 0.875rem;
          line-height: 1.7;
          color: var(--text-secondary);
          padding: 0.25rem 0 0.25rem 1.5rem;
          position: relative;
        }
        .analysis-content .md-ul li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--accent);
          font-size: 0.75rem;
          top: 0.35rem;
        }
        .analysis-content strong {
          color: var(--text-primary);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
