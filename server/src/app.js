/**
 * app.js — COMPLETE with ALL routes
 * Place: server/src/app.js
 */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import schemeRoutes from './routes/scheme.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import milestonesRoutes from './routes/milestones.routes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/milestones', milestonesRoutes);

app.get('/', (_req, res) => res.send('NagarikConnect API Running ✅'));

app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;