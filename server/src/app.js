/**
 * app.js
 * Place: server/src/app.js
 *
 * Registers ALL routes. Import order matters for ES modules.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({
  status: 'running',
  service: 'NagarikConnect API v2.0',
  routes: ['/api/auth', '/api/user', '/api/admin', '/api/complaints', '/api/documents', '/api/milestones', '/api/schemes'],
}));

// ── API Routes ────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import milestonesRoutes from './routes/milestones.routes.js';
import schemeRoutes from './routes/scheme.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/schemes', schemeRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[APP ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;