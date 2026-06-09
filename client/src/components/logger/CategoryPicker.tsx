import React from 'react';
import { Category } from '../../types';

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            selected === cat.id 
              ? 'bg-amber-400/10 border-amber-400 text-amber-400 scale-105' 
              : 'bg-forest-800 border-forest-600 text-cream-200 hover:border-forest-400 hover:bg-forest-700'
          }`}
          aria-pressed={selected === cat.id}
        >
          <span className="text-3xl mb-2" aria-hidden="true">{cat.icon}</span>
          <span className="text-sm font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
