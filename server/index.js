import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './auth.js';
import usersRouter from './users.js';
import bookingsRouter from './bookings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

// In development allow the Vite dev server origin
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// --- API routes ---
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- Serve built frontend (production) ---
import { existsSync } from 'fs';
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA fallback — let React Router handle all non-API routes
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n  API server running at http://localhost:${PORT}\n`);
});
