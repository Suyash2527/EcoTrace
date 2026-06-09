import React, { useState, useEffect } from 'react';
import { EMISSION_FACTORS, calculateCO2 } from '../../utils/emissionFactors';
import { CategoryPicker } from './CategoryPicker';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category, Unit } from '../../types';
import { formatCO2 } from '../../utils/formatters';

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

    // Reset form partially
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
        <label className="block text-lg font-medium text-cream-100 mb-3">1. Select Category</label>
        <CategoryPicker selected={category} onSelect={(c) => { setCategory(c); setActivityType(''); }} />
      </div>

      {category && (
        <div className="space-y-6 animate-in">
          <div>
            <label className="block text-lg font-medium text-cream-100 mb-3">2. What did you do?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(EMISSION_FACTORS[category]).map(([key, factor]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivityType(key)}
                  className={`flex items-center p-3 rounded-xl border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    activityType === key 
                      ? 'bg-forest-700 border-amber-400 text-cream-100 ring-1 ring-amber-400' 
                      : 'bg-forest-900 border-forest-600 text-cream-200 hover:bg-forest-800'
                  }`}
                  aria-pressed={activityType === key}
                >
                  <span className="text-xl mr-2" aria-hidden="true">{factor.icon}</span>
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
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-400/80 font-medium uppercase tracking-wider mb-1">Estimated Impact</p>
                    <p className="text-forest-200 text-sm">This activity will add to your footprint.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono text-amber-400 font-bold">{formatCO2(predictedCO2).split(' ')[0]}</span>
                    <span className="text-amber-400/80 ml-1 font-medium">{formatCO2(predictedCO2).split(' ')[1]}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-cream-200 mb-1">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-forest-900 border border-forest-600 rounded-md py-2 px-3 text-cream-100 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div className="pt-4 border-t border-forest-400/20">
                <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={predictedCO2 === 0}>
                  Log Activity — {formatCO2(predictedCO2)}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
