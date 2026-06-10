export interface CountryAverage {
  country: string;
  monthlyKg: number;
}

// Global average is ~4.7 tonnes / year -> ~391 kg / month
export const GLOBAL_AVERAGE_MONTHLY = 391;

// Estimates of monthly CO2 emissions per capita (in kg)
const averages: Record<string, number> = {
  'USA': 1250,
  'United States': 1250,
  'Canada': 1250,
  'Australia': 1250,
  'UK': 458,
  'United Kingdom': 458,
  'Germany': 700,
  'France': 400,
  'Japan': 700,
  'China': 666,
  'India': 158,
  'Brazil': 175,
  'South Africa': 600,
};

/**
 * Extracts the country from a location string (e.g., "Nashik, India" -> "India")
 * and returns the average monthly CO2 footprint in kg.
 */
export function getCountryAverage(location?: string): CountryAverage {
  if (!location) {
    return { country: 'Global', monthlyKg: GLOBAL_AVERAGE_MONTHLY };
  }

  // Simple heuristic: check if any known country is mentioned in the location string
  const locLower = location.toLowerCase();
  
  for (const [country, monthlyKg] of Object.entries(averages)) {
    if (locLower.includes(country.toLowerCase())) {
      return { country, monthlyKg };
    }
  }

  // Fallback if country is not recognized
  return { country: 'Global', monthlyKg: GLOBAL_AVERAGE_MONTHLY };
}
