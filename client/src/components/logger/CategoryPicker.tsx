import React from 'react';
import { Category } from '../../types';
import { CategoryIcons } from '../../utils/icons';

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const categories: { id: Category; label: string }[] = [
  { id: 'transport', label: 'Transport' },
  { id: 'food', label: 'Food' },
  { id: 'energy', label: 'Energy' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'travel', label: 'Travel' },
];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
            selected === cat.id 
              ? 'bg-[var(--accent-dim)] border-[var(--accent)] text-[var(--accent)] scale-105 shadow-md' 
              : 'glass-card text-[var(--text-primary)] hover:border-[var(--accent)] hover:shadow-md'
          }`}
          aria-pressed={selected === cat.id}
        >
          <span className="w-8 h-8 mb-2" aria-hidden="true">{CategoryIcons[cat.id]}</span>
          <span className="text-sm font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
