// IPCC AR6 / Our World in Data based emission factors
import { Unit, Category } from '../types';

export interface EmissionFactor {
  factor: number;
  unit: Unit;
  label: string;
  icon: string;  // emoji
}

const TRANSPORT: Record<string, EmissionFactor> = {
  car_petrol:           { factor: 0.17,  unit: 'km',   label: 'Petrol Car',          icon: '🚗' },
  car_diesel:           { factor: 0.21,  unit: 'km',   label: 'Diesel Car',          icon: '🚙' },
  car_electric:         { factor: 0.05,  unit: 'km',   label: 'Electric Car',        icon: '⚡' },
  car_hybrid:           { factor: 0.11,  unit: 'km',   label: 'Hybrid Car',          icon: '🔋' },
  bus:                  { factor: 0.089, unit: 'km',   label: 'Bus',                 icon: '🚌' },
  train:                { factor: 0.041, unit: 'km',   label: 'Train',               icon: '🚆' },
  flight_short:         { factor: 0.255, unit: 'km',   label: 'Short Flight',        icon: '✈️' },
  flight_international: { factor: 0.195, unit: 'km',   label: 'International Flight',icon: '🌍' },
  motorcycle:           { factor: 0.114, unit: 'km',   label: 'Motorcycle',          icon: '🏍️' },
  bicycle:              { factor: 0,     unit: 'km',   label: 'Bicycle',             icon: '🚲' },
  walking:              { factor: 0,     unit: 'km',   label: 'Walking',             icon: '🚶' },
};

const FOOD: Record<string, EmissionFactor> = {
  beef:        { factor: 27.0, unit: 'kg',   label: 'Beef',         icon: '🥩' },
  lamb:        { factor: 39.2, unit: 'kg',   label: 'Lamb',         icon: '🐑' },
  pork:        { factor: 12.1, unit: 'kg',   label: 'Pork',         icon: '🐷' },
  chicken:     { factor: 6.9,  unit: 'kg',   label: 'Chicken',      icon: '🍗' },
  fish:        { factor: 6.1,  unit: 'kg',   label: 'Fish',         icon: '🐟' },
  eggs:        { factor: 4.5,  unit: 'kg',   label: 'Eggs',         icon: '🥚' },
  dairy:       { factor: 3.2,  unit: 'kg',   label: 'Dairy',        icon: '🥛' },
  vegetables:  { factor: 2.0,  unit: 'kg',   label: 'Vegetables',   icon: '🥦' },
  legumes:     { factor: 0.9,  unit: 'kg',   label: 'Legumes',      icon: '🫘' },
  vegan_meal:  { factor: 1.5,  unit: 'meal', label: 'Vegan Meal',   icon: '🌱' },
  omni_meal:   { factor: 3.8,  unit: 'meal', label: 'Mixed Meal',   icon: '🍽️' },
};

const ENERGY: Record<string, EmissionFactor> = {
  electricity: { factor: 0.233, unit: 'kWh',    label: 'Grid Electricity', icon: '💡' },
  natural_gas: { factor: 2.04,  unit: 'litres',  label: 'Natural Gas',     icon: '🔥' },
  heating_oil: { factor: 2.52,  unit: 'litres',  label: 'Heating Oil',     icon: '🛢️' },
  solar:       { factor: 0.02,  unit: 'kWh',    label: 'Solar',            icon: '☀️' },
};

const SHOPPING: Record<string, EmissionFactor> = {
  clothing:    { factor: 30.0,  unit: 'count', label: 'Clothing Item', icon: '👕' },
  phone:       { factor: 70.0,  unit: 'count', label: 'Smartphone',    icon: '📱' },
  laptop:      { factor: 400.0, unit: 'count', label: 'Laptop',        icon: '💻' },
  delivery:    { factor: 0.5,   unit: 'count', label: 'Online Parcel', icon: '📦' },
};

const TRAVEL: Record<string, EmissionFactor> = {
  hotel_stay: { factor: 15.0, unit: 'count', label: 'Hotel Night', icon: '🏨' }
};

export const EMISSION_FACTORS = { transport: TRANSPORT, food: FOOD, energy: ENERGY, shopping: SHOPPING, travel: TRAVEL };

export function calculateCO2(category: Category, activityType: string, quantity: number): number {
  if (quantity <= 0) return 0;
  const categoryFactors = EMISSION_FACTORS[category as keyof typeof EMISSION_FACTORS];
  if (!categoryFactors) return 0;
  const factor = categoryFactors[activityType];
  if (!factor) return 0;
  return Math.round(factor.factor * quantity * 1000) / 1000;
}
