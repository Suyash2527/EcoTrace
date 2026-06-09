import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { getStorage } from 'firebase-admin/storage';
import { Activity, UserProfile } from './gemini';

export async function generateAndUploadPDF(
  userId: string,
  profile: UserProfile,
  activities: Activity[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('error', (err) => reject(err));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          const bucket = getStorage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
          const filename = `exports/${userId}/ecotrace_report_${Date.now()}.pdf`;
          const file = bucket.file(filename);
          
          await file.save(pdfBuffer, {
            metadata: { contentType: 'application/pdf' }
          });
          
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          });
          
          resolve(url);
        } catch (e) {
          reject(e);
        }
      });
      
      // Build the PDF content
      doc.fontSize(24).fillColor('#388f51').text('EcoTrace Impact Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(14).fillColor('#1a1a1a').text(`User: ${profile.displayName || 'Eco Warrior'}`);
      doc.text(`Location: ${profile.location}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);
      
      doc.fontSize(18).fillColor('#388f51').text('Recent Activities');
      doc.moveDown();
      
      const recentActivities = activities.slice(0, 50);
      let totalEmissions = 0;
      
      for (const act of recentActivities) {
        totalEmissions += act.co2Kg;
        doc.fontSize(12).fillColor('#333333').text(
          `${act.date} | ${act.category.toUpperCase()} - ${act.activityType}: ${act.quantity} ${act.unit} => ${act.co2Kg.toFixed(2)} kg CO2`
        );
      }
      
      doc.moveDown(2);
      doc.fontSize(16).fillColor('#f59e0b').text(`Total Emissions (Sample): ${totalEmissions.toFixed(2)} kg CO2`);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
