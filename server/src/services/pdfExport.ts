import PDFDocument from 'pdfkit';
import { Activity, UserProfile } from './gemini';

// Rough country averages (monthly kg * 12)
const GLOBAL_AVG_ANNUAL = 391 * 12;
const averages: Record<string, number> = {
  'USA': 1250 * 12, 'United States': 1250 * 12, 'Canada': 1250 * 12, 'Australia': 1250 * 12,
  'UK': 458 * 12, 'United Kingdom': 458 * 12, 'Germany': 700 * 12, 'France': 400 * 12,
  'Japan': 700 * 12, 'China': 666 * 12, 'India': 158 * 12, 'Brazil': 175 * 12, 'South Africa': 600 * 12,
};

function getAnnualAverage(location?: string): { country: string, kg: number } {
  if (!location) return { country: 'Global Avg', kg: GLOBAL_AVG_ANNUAL };
  const locLower = location.toLowerCase();
  for (const [country, kg] of Object.entries(averages)) {
    if (locLower.includes(country.toLowerCase())) return { country: `${country} Avg`, kg };
  }
  return { country: 'Global Avg', kg: GLOBAL_AVG_ANNUAL };
}

export async function generatePDFBuffer(
  userId: string,
  profile: UserProfile,
  activities: Activity[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('error', (err) => reject(err));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      // Header
      doc.fontSize(24).fillColor('#10b981').text('EcoTrace Annual Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).fillColor('#374151').text(`Prepared for: ${profile.displayName || 'Eco Warrior'}`);
      doc.text(`Location: ${profile.location}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      // Compute Total Emissions
      let userTotal = 0;
      activities.forEach(act => { userTotal += (Number(act.co2Kg) || 0); });
      
      // Comparison Data
      const national = getAnnualAverage(profile.location);
      const global = { country: 'Global Avg', kg: GLOBAL_AVG_ANNUAL };
      
      const chartData = [
        { label: 'You', value: userTotal, color: '#10b981' },
        { label: national.country, value: national.kg, color: '#3b82f6' },
      ];
      if (national.country !== 'Global Avg') {
        chartData.push({ label: global.country, value: global.kg, color: '#f59e0b' });
      }

      // Draw Bar Chart
      doc.fontSize(18).fillColor('#10b981').text('Impact Comparison (kg CO2 / year)', { align: 'left' });
      doc.moveDown(1);

      const startX = 50;
      const startY = doc.y;
      const chartWidth = 400;
      const chartHeight = 150;
      const maxVal = Math.max(...chartData.map(d => d.value), 100);

      // Draw background grid
      doc.lineWidth(1).strokeColor('#e5e7eb');
      for (let i = 0; i <= 4; i++) {
        const y = startY + (chartHeight * (i / 4));
        doc.moveTo(startX, y).lineTo(startX + chartWidth, y).stroke();
      }

      // Draw bars
      const barWidth = 60;
      const spacing = (chartWidth - (barWidth * chartData.length)) / (chartData.length + 1);
      
      chartData.forEach((d, i) => {
        const h = Math.max((d.value / maxVal) * chartHeight, 5);
        const x = startX + spacing + (i * (barWidth + spacing));
        const y = startY + chartHeight - h;
        
        doc.rect(x, y, barWidth, h).fill(d.color);
        
        // Label
        doc.fontSize(10).fillColor('#374151').text(d.label, x, startY + chartHeight + 10, { width: barWidth, align: 'center' });
        // Value
        doc.fontSize(10).fillColor('#111827').text(`${Math.round(d.value)}`, x, y - 15, { width: barWidth, align: 'center' });
      });

      doc.y = startY + chartHeight + 50;
      doc.moveDown(2);

      // Activities List
      doc.fontSize(18).fillColor('#10b981').text('Recent Logged Activities');
      doc.moveDown();
      
      const recentActivities = activities.slice(0, 30);
      
      for (const act of recentActivities) {
        doc.fontSize(11).fillColor('#4b5563').text(
          `${act.date} | ${act.category.toUpperCase()} - ${act.activityType}: ${act.quantity} ${act.unit} => ${Number(act.co2Kg).toFixed(2)} kg CO2`
        );
      }
      
      if (activities.length === 0) {
        doc.fontSize(11).fillColor('#9ca3af').text('No activities logged this year.');
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
