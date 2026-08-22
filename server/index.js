import express from 'express';
import cors from 'cors';
import authRouter from './auth.js';
import usersRouter from './users.js';
import bookingsRouter from './bookings.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`\n  API server running at http://localhost:${PORT}\n`);
});
