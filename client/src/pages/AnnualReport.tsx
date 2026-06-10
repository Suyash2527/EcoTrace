import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { getCountryAverage } from '../utils/countryAverages';
import { ComparisonChart } from '../components/charts/ComparisonChart';

export function AnnualReport() {
  const { user, profile } = useAuth();
  const { activities } = useActivities(user?.uid);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const annualTotal = activities.reduce((acc, act) => acc + act.co2Kg, 0);
  const countryAvg = getCountryAverage(profile?.location);
  
  const comparisonData = [
    { label: 'You', value: annualTotal, color: '#10b981', subLabel: 'This year' },
    { label: countryAvg.country, value: countryAvg.monthlyKg * 12, color: '#3b82f6', subLabel: 'Avg year' },
    { label: 'Global', value: 391 * 12, color: '#f59e0b', subLabel: 'Avg year' },
  ];

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ activities, profile }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate report');
      }

      const data = await res.json();
      setReport(data.markdown);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Something went wrong');
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
      a.href = url; a.download = `ecotrace-annual-report-${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); a.remove();
    } catch { 
      alert('Export failed — try again later.'); 
    } finally { 
      setIsExporting(false); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-3 text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-brand)' }}>
          Annual Report Calculator
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          AI-powered analysis of your entire year's carbon footprint.
        </p>
      </header>

      {!report ? (
        <div className="glass-panel p-8 text-center rounded-3xl" style={{ borderRadius: 24 }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--gradient-brand)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Ready to audit your year?</h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            We'll crunch all your logged activities, apply our latest AI models, and build a comprehensive sustainability report just for you.
          </p>
          
          {error && <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded-xl">{error}</div>}
          
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary px-8 py-4 text-lg shadow-xl"
            style={{ borderRadius: 16 }}
          >
            {loading ? 'Generating Report...' : 'Generate My Annual Report'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end mb-2">
            <button 
              onClick={exportPdf} 
              disabled={isExporting}
              className="btn btn-glass px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              {isExporting ? 'Exporting...' : '↓ Export PDF'}
            </button>
          </div>

          <div className="glass-card mb-6 overflow-hidden">
            <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Your Year vs Averages</h3>
            <ComparisonChart data={comparisonData} />
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-3xl markdown-body" style={{ borderRadius: 24 }}>
            <ReactMarkdown>{report}</ReactMarkdown>
            <div className="mt-12 pt-8 border-t flex justify-center" style={{ borderColor: 'rgba(22,163,74,0.1)' }}>
              <button onClick={() => setReport(null)} className="btn btn-secondary px-8 py-2.5">
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
