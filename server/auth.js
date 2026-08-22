import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import db, { getAvailability, setAvailability, getBlockedDates } from './db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'hourly-dev-secret-change-in-prod';
const DEFAULT_AVAILABILITY = {
  mon: { enabled: true,  start: '09:00', end: '17:00' },
  tue: { enabled: true,  start: '09:00', end: '17:00' },
  wed: { enabled: true,  start: '09:00', end: '17:00' },
  thu: { enabled: true,  start: '09:00', end: '17:00' },
  fri: { enabled: true,  start: '09:00', end: '15:00' },
  sat: { enabled: false, start: '09:00', end: '17:00' },
  sun: { enabled: false, start: '09:00', end: '17:00' },
};

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

async function buildUserResponse(row) {
  const availability = await getAvailability(row.id);
  const blockedDates = await getBlockedDates(row.id);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || null,
    timezone: row.timezone,
    availability,
    blockedDates,
    createdAt: row.created_at,
  };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const { data: existing, error: findError } = await db
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const id = 'u_' + nanoid(10);
  const passwordHash = await bcrypt.hash(password, 12);

  const { error: insertError } = await db.from('users').insert({
    id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    username: null,
    bio: '',
    timezone: 'Asia/Kolkata'
  });

  if (insertError) return res.status(500).json({ error: insertError.message });

  // Seed default availability
  await setAvailability(id, DEFAULT_AVAILABILITY);

  const { data: user } = await db.from('users').select('*').eq('id', id).single();
  const token = makeToken(id);

  return res.status(201).json({ token, user: await buildUserResponse(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!user) {
    return res.status(401).json({ error: 'No account found with that email. Try signing up.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const token = makeToken(user.id);
  return res.json({ token, user: await buildUserResponse(user) });
});

// GET /api/auth/me  — requires Authorization: Bearer <token>
router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) return res.status(401).json({ error: 'User not found.' });
    return res.json({ user: await buildUserResponse(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
});

export default router;
