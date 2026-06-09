import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function Analysis() {
  const { user, profile } = useAuth();
  const { activities } = useActivities(user?.uid);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const runDeepAnalysis = async () => {
    if (!user || !profile) {
      setError("Please ensure your profile is completely loaded.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/analysis/deep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ activities, profile })
      });

      if (!response.ok) throw new Error('Failed to run analysis');

      const data = await response.json();
      setAnalysis(data.result);
    } catch (err: any) {
      setError(err.message);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ activities, profile })
      });

      if (!response.ok) throw new Error('Export failed');

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecotrace-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cream-100 mb-2">Deep Analysis</h1>
          <p className="text-forest-300">Comprehensive Gemini 1.5 Pro evaluation of your lifestyle.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportPdf} isLoading={isExporting}>
             Export PDF Report
          </Button>
          <Button onClick={runDeepAnalysis} isLoading={loading}>
            {analysis ? 'Re-run Analysis' : 'Run Deep Analysis'}
          </Button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {!analysis && !loading && !error && (
        <Card className="text-center py-16">
          <div className="text-6xl mb-6">🧠</div>
          <h3 className="text-xl font-bold text-cream-100 mb-2">Ready to dig deeper?</h3>
          <p className="text-forest-300 max-w-lg mx-auto mb-6">
            Our AI will analyze your entire activity history, correlate it with your profile settings, and generate a comprehensive long-form report on your environmental impact.
          </p>
          <Button onClick={runDeepAnalysis}>Start Analysis</Button>
        </Card>
      )}

      {loading && (
        <Card className="py-16 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-amber-400 font-medium">Gemini 1.5 Pro is analyzing your data...</p>
            <p className="text-forest-400 text-sm mt-2">This usually takes 10-15 seconds.</p>
          </div>
        </Card>
      )}

      {analysis && !loading && (
        <Card className="prose prose-invert prose-amber max-w-none">
          <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
        </Card>
      )}
    </div>
  );
}
