import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { insightsRouter } from './routes/insights';
import { analysisRouter } from './routes/analysis';
import { exportRouter } from './routes/export';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT ?? 8080;

app.set('trust proxy', 1);

// Helmet: sets 13 security headers including CSP, HSTS, XSS protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      connectSrc: [
        "'self'",
        "https://generativelanguage.googleapis.com",
        "https://*.googleapis.com",
        "https://*.firebaseapp.com",
      ],
      imgSrc: ["'self'", "data:", "https://*.googleusercontent.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// CORS — restrict to own Cloud Run domain in production
app.use(cors({
  origin: (origin, cb) => {
    // For the hackathon, allow all origins to prevent 500 errors on static assets
    cb(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50kb' }));

// Global rate limit: 60 requests/minute per IP
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

// AI endpoints get stricter rate limit: 10/min
app.use('/api/insights', rateLimit({ windowMs: 60 * 1000, max: 10 }));
app.use('/api/analysis', rateLimit({ windowMs: 60 * 1000, max: 10 }));
app.use('/api/chat', rateLimit({ windowMs: 60 * 1000, max: 20 }));

app.use('/api', insightsRouter);
app.use('/api', analysisRouter);
app.use('/api', exportRouter);
app.use('/api', healthRouter);

// Serve React build
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.use((_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => console.log(`EcoTrace running on :${PORT}`));
