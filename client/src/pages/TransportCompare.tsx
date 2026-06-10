import React, { useState, useEffect } from 'react';
import { EMISSION_FACTORS } from '../utils/emissionFactors';
import { useScrollReveal } from '../hooks/useScrollReveal';

type Mode = 'transport' | 'food' | 'energy';

interface CompareItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  detail?: string;
}

function getTransportData(km: number): CompareItem[] {
  const f = EMISSION_FACTORS.transport;
  return [
    { label: 'Walk / Bike',    value: 0,                            icon: '🚲', color: '#16a34a', detail: 'Zero emissions' },
    { label: 'Electric Train', value: f.train.factor * km,          icon: '🚆', color: '#0891b2', detail: `${(f.train.factor * 1000).toFixed(0)}g/km` },
    { label: 'Bus',            value: f.bus.factor * km,            icon: '🚌', color: '#7c3aed', detail: `${(f.bus.factor * 1000).toFixed(0)}g/km` },
    { label: 'Electric Car',   value: f.car_electric.factor * km,   icon: '⚡', color: '#4f46e5', detail: `${(f.car_electric.factor * 1000).toFixed(0)}g/km` },
    { label: 'Hybrid Car',     value: f.car_hybrid.factor * km,     icon: '🔋', color: '#9333ea', detail: `${(f.car_hybrid.factor * 1000).toFixed(0)}g/km` },
    { label: 'Motorcycle',     value: f.motorcycle.factor * km,     icon: '🏍️', color: '#d97706', detail: `${(f.motorcycle.factor * 1000).toFixed(0)}g/km` },
    { label: 'Petrol Car',     value: f.car_petrol.factor * km,     icon: '🚗', color: '#f59e0b', detail: `${(f.car_petrol.factor * 1000).toFixed(0)}g/km` },
    { label: 'Diesel Car',     value: f.car_diesel.factor * km,     icon: '🚙', color: '#ef4444', detail: `${(f.car_diesel.factor * 1000).toFixed(0)}g/km` },
    { label: 'Short Flight',   value: f.flight_short.factor * km,   icon: '✈️', color: '#dc2626', detail: `${(f.flight_short.factor * 1000).toFixed(0)}g/km` },
  ].sort((a, b) => a.value - b.value);
}

function getFoodData(qty: number): CompareItem[] {
  const f = EMISSION_FACTORS.food;
  return [
    { label: 'Legumes',      value: f.legumes.factor * qty,     icon: '🫘', color: '#16a34a', detail: `${f.legumes.factor} kg CO₂/kg` },
    { label: 'Vegan Meal',   value: f.vegan_meal.factor * qty,  icon: '🌱', color: '#22c55e', detail: `${f.vegan_meal.factor} kg CO₂/meal` },
    { label: 'Vegetables',   value: f.vegetables.factor * qty,  icon: '🥦', color: '#84cc16', detail: `${f.vegetables.factor} kg CO₂/kg` },
    { label: 'Dairy',        value: f.dairy.factor * qty,       icon: '🥛', color: '#eab308', detail: `${f.dairy.factor} kg CO₂/kg` },
    { label: 'Eggs',         value: f.eggs.factor * qty,        icon: '🥚', color: '#f59e0b', detail: `${f.eggs.factor} kg CO₂/kg` },
    { label: 'Mixed Meal',   value: f.omni_meal.factor * qty,   icon: '🍽️', color: '#f97316', detail: `${f.omni_meal.factor} kg CO₂/meal` },
    { label: 'Chicken',      value: f.chicken.factor * qty,     icon: '🍗', color: '#ef4444', detail: `${f.chicken.factor} kg CO₂/kg` },
    { label: 'Pork',         value: f.pork.factor * qty,        icon: '🐷', color: '#dc2626', detail: `${f.pork.factor} kg CO₂/kg` },
    { label: 'Beef',         value: f.beef.factor * qty,        icon: '🥩', color: '#991b1b', detail: `${f.beef.factor} kg CO₂/kg` },
  ].sort((a, b) => a.value - b.value);
}

function getEnergyData(qty: number): CompareItem[] {
  const f = EMISSION_FACTORS.energy;
  return [
    { label: 'Solar',        value: f.solar.factor * qty,       icon: '☀️', color: '#16a34a', detail: `${f.solar.factor} kg CO₂/kWh` },
    { label: 'Grid Electric',value: f.electricity.factor * qty, icon: '💡', color: '#f59e0b', detail: `${f.electricity.factor} kg CO₂/kWh` },
    { label: 'Natural Gas',  value: f.natural_gas.factor * qty, icon: '🔥', color: '#f97316', detail: `${f.natural_gas.factor} kg CO₂/L` },
    { label: 'Heating Oil',  value: f.heating_oil.factor * qty, icon: '🛢️', color: '#ef4444', detail: `${f.heating_oil.factor} kg CO₂/L` },
  ].sort((a, b) => a.value - b.value);
}

/* Animated bar */
function Bar({ item, max, delay }: { item: CompareItem; max: number; delay: number }) {
  const pct = max > 0 ? (item.value / max) * 100 : 0;
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setWidth(pct), delay);
      return () => clearTimeout(t);
    }
  }, [visible, pct, delay]);

  return (
    <div
      ref={ref}
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-16px)',
        transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{item.icon}</span>
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {item.label}
          </span>
          {item.value === 0 && (
            <span className="badge badge-green text-xs">Zero emission</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {item.detail && (
            <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {item.detail}
            </span>
          )}
          <span className="text-sm font-black tabular-nums" style={{ color: item.color, minWidth: 60, textAlign: 'right' }}>
            {item.value === 0 ? '0' : item.value.toFixed(2)} kg
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div className="relative h-3 rounded-full overflow-visible" style={{ background: 'rgba(22,163,74,0.06)' }}>
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: item.value === 0
              ? 'rgba(22,163,74,0.3)'
              : `linear-gradient(90deg, ${item.color}99, ${item.color})`,
            boxShadow: hovered ? `0 0 12px ${item.color}55` : 'none',
            minWidth: item.value === 0 ? 0 : 4,
          }}
        />
        {/* Hover tooltip */}
        {hovered && item.value > 0 && (
          <div
            className="absolute -top-8 pointer-events-none z-10 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-lg whitespace-nowrap"
            style={{
              left: `${Math.min(width, 80)}%`,
              transform: 'translateX(-50%)',
              background: item.color,
            }}
          >
            {item.value.toFixed(3)} kg CO₂
          </div>
        )}
      </div>
    </div>
  );
}

const MODES: { key: Mode; label: string; icon: string; inputLabel: string; defaultVal: number; unit: string }[] = [
  { key: 'transport', label: 'Transport',  icon: '🚗', inputLabel: 'Journey distance', defaultVal: 10,  unit: 'km' },
  { key: 'food',      label: 'Food',       icon: '🥗', inputLabel: 'Quantity',          defaultVal: 1,   unit: 'kg / meal' },
  { key: 'energy',    label: 'Energy',     icon: '⚡', inputLabel: 'Consumption',       defaultVal: 100, unit: 'kWh / litres' },
];

export function TransportCompare() {
  const [mode, setMode] = useState<Mode>('transport');
  const [quantity, setQuantity] = useState(10);
  const { ref: titleRef, visible: titleVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  const modeConfig = MODES.find(m => m.key === mode)!;

  const items: CompareItem[] = mode === 'transport'
    ? getTransportData(quantity)
    : mode === 'food'
    ? getFoodData(quantity)
    : getEnergyData(quantity);

  const max = Math.max(...items.map(i => i.value), 0.001);

  // Savings vs worst option
  const worst = items[items.length - 1]?.value || 0;
  const best  = items[0]?.value || 0;
  const saving = worst - best;

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setQuantity(MODES.find(x => x.key === m)!.defaultVal);
  };

  return (
    <div className="p-5 md:p-10 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div
        ref={titleRef}
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 4px 14px rgba(8,145,178,0.35)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Emissions Compare
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          See the real carbon cost of your choices across transport, food, and energy.
        </p>
      </div>

      {/* Mode tabs + input */}
      <div className="glass-card space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(22,163,74,0.06)' }}>
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => handleModeChange(m.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: mode === m.key ? 'white' : 'transparent',
                color: mode === m.key ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === m.key ? 'var(--shadow-sm)' : 'none',
                transform: mode === m.key ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:block">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Quantity input */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="field-label">{modeConfig.inputLabel} ({modeConfig.unit})</label>
            <input
              type="number"
              min={0.1}
              step={mode === 'food' ? 0.1 : 1}
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="input-field"
            />
          </div>
          {/* Quick presets */}
          <div className="shrink-0 pt-5">
            <div className="flex gap-1.5">
              {(mode === 'transport' ? [5, 20, 50, 200] : mode === 'food' ? [0.1, 0.5, 1, 2] : [10, 50, 100, 500])
                .map(v => (
                  <button
                    key={v}
                    onClick={() => setQuantity(v)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                    style={{
                      background: quantity === v ? 'var(--accent-dim)' : 'rgba(255,255,255,0.6)',
                      color: quantity === v ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${quantity === v ? 'var(--accent)' : 'rgba(22,163,74,0.15)'}`,
                    }}
                  >
                    {v}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saving banner */}
      {quantity > 0 && saving > 0.001 && (
        <div
          className="glass-card flex items-center gap-4 animate-in"
          style={{ background: 'rgba(240,253,244,0.8)', border: '1px solid rgba(22,163,74,0.2)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'rgba(22,163,74,0.1)' }}>
            💚
          </div>
          <div>
            <p className="font-black text-base" style={{ color: '#15803d', letterSpacing: '-0.02em' }}>
              Best choice saves <span style={{ color: 'var(--accent)' }}>{saving.toFixed(2)} kg CO₂</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              vs. the highest-emission option for {quantity} {modeConfig.unit}
            </p>
          </div>
          <div className="ml-auto text-right shrink-0 hidden sm:block">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Equivalent to</p>
            <p className="font-black text-sm" style={{ color: 'var(--accent)' }}>
              {(saving / 0.021).toFixed(0)} km not driven
            </p>
          </div>
        </div>
      )}

      {/* Bar chart */}
      {quantity > 0 && (
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
              {modeConfig.icon} {modeConfig.label} emissions for{' '}
              <span style={{ color: 'var(--accent)' }}>{quantity} {modeConfig.unit}</span>
            </h2>
            <span className="label">kg CO₂</span>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <Bar key={item.label} item={item} max={max} delay={i * 60} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
