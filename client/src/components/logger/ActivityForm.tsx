import React, { useState, useEffect } from 'react';
import { EMISSION_FACTORS, calculateCO2 } from '../../utils/emissionFactors';
import { CategoryPicker } from './CategoryPicker';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category } from '../../types';
import { formatCO2 } from '../../utils/formatters';
import { getIcon } from '../../utils/icons';

interface ActivityFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function ActivityForm({ onSubmit, isSubmitting }: ActivityFormProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [activityType, setActivityType] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const [predictedCO2, setPredictedCO2] = useState<number>(0);

  useEffect(() => {
    if (category && activityType && typeof quantity === 'number' && quantity > 0) {
      setPredictedCO2(calculateCO2(category, activityType, quantity));
    } else {
      setPredictedCO2(0);
    }
  }, [category, activityType, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !activityType || !quantity || quantity <= 0) return;

    const unit = EMISSION_FACTORS[category][activityType].unit;

    await onSubmit({
      category,
      activityType,
      quantity,
      unit,
      date,
      notes
    });

    setQuantity('');
    setNotes('');
  };

  const getUnitForType = () => {
    if (!category || !activityType) return '';
    return EMISSION_FACTORS[category]?.[activityType]?.unit || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in">
      <div>
        <label className="field-label text-lg mb-3">1. Select Category</label>
        <CategoryPicker selected={category} onSelect={(c) => { setCategory(c); setActivityType(''); }} />
      </div>

      {category && (
        <div className="space-y-6 animate-in">
          <div>
            <label className="field-label text-lg mb-3">2. What did you do?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(EMISSION_FACTORS[category]).map(([key, factor]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivityType(key)}
                  className={`flex items-center p-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                    activityType === key 
                      ? 'bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)] ring-1 ring-[var(--accent)]' 
                      : 'bg-white/40 border-[var(--border-glass)] text-[var(--text-primary)] hover:bg-white/60 hover:shadow-sm'
                  }`}
                  aria-pressed={activityType === key}
                >
                  <span className="w-5 h-5 mr-2" aria-hidden="true">{getIcon(key, category)}</span>
                  <span className="text-sm font-medium">{factor.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activityType && (
            <div className="space-y-6 animate-in">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label={`3. How much? (${getUnitForType()})`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? parseFloat(e.target.value) : '')}
                    required
                    placeholder={`e.g. 10`}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {predictedCO2 > 0 && (
                <div className="bg-[var(--accent-dim)] border border-[var(--accent)] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--accent)] font-semibold uppercase tracking-wider mb-1">Estimated Impact</p>
                    <p className="text-[var(--text-muted)] text-sm">This activity will add to your footprint.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono text-[var(--accent)] font-bold">{formatCO2(predictedCO2).split(' ')[0]}</span>
                    <span className="text-[var(--accent)] ml-1 font-semibold">{formatCO2(predictedCO2).split(' ')[1]}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="field-label mb-1">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field min-h-[80px]"
                  rows={2}
                  maxLength={200}
                  placeholder="Any details to remember..."
                />
              </div>

              <div className="pt-4 border-t border-[var(--border-glass)]">
                <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={predictedCO2 === 0}>
                  {isSubmitting ? 'Calculating AI Footprint...' : `Log Activity — ${formatCO2(predictedCO2)}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
