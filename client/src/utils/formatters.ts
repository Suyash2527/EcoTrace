export function formatCO2(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
