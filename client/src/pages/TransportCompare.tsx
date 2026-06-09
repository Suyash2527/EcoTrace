import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { BarComparison } from '../components/charts/BarComparison';
import { EMISSION_FACTORS } from '../utils/emissionFactors';

export function TransportCompare() {
  const [distance, setDistance] = useState<number>(10);

  const getTransportEmissions = (km: number) => {
    const factors = EMISSION_FACTORS.transport;
    return [
      { label: 'Walk / Bike', value: 0, color: 'bg-green-400' },
      { label: 'Train / Tram', value: factors.train.factor * km, color: 'bg-teal-400' },
      { label: 'Bus', value: factors.bus.factor * km, color: 'bg-blue-400' },
      { label: 'Electric Car', value: factors.car_electric.factor * km, color: 'bg-indigo-400' },
      { label: 'Hybrid Car', value: factors.car_hybrid?.factor * km || 0.11 * km, color: 'bg-purple-400' },
      { label: 'Petrol Car', value: factors.car_petrol.factor * km, color: 'bg-amber-500' },
      { label: 'Diesel Car', value: factors.car_diesel.factor * km, color: 'bg-red-500' },
      { label: 'Short Flight', value: factors.flight_short?.factor * km || 0.255 * km, color: 'bg-red-600' }
    ].sort((a, b) => a.value - b.value);
  };

  const comparisonData = getTransportEmissions(distance);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Transport Compare</h1>
        <p className="text-forest-300">See the impact of different travel choices for your journey.</p>
      </header>

      <Card className="bg-forest-800/80 mb-8">
        <div className="max-w-xs">
          <Input
            label="Journey Distance (km)"
            type="number"
            min="1"
            value={distance || ''}
            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
          />
        </div>
      </Card>

      {distance > 0 && (
        <BarComparison 
          title={`Emissions for a ${distance} km journey`}
          items={comparisonData} 
        />
      )}
    </div>
  );
}
