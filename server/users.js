import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db, { getAvailability, setAvailability, getBlockedDates, setBlockedDates } from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hourly-dev-secret-change-in-prod';

// Middleware: authenticate request and attach userId
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

async function buildPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || null,
    timezone: row.timezone,
    availability: await getAvailability(row.id),
    blockedDates: await getBlockedDates(row.id),
    createdAt: row.created_at,
  };
}

// GET /api/users/me/profile
router.get('/me/profile', authenticate, async (req, res) => {
  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('id', req.userId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || '',
    bio: user.bio || '',
    avatarUrl: user.avatar_url || null,
    timezone: user.timezone,
    availability: await getAvailability(user.id),
    blockedDates: await getBlockedDates(user.id),
    createdAt: user.created_at,
  });
});

// PUT /api/users/me/profile
router.put('/me/profile', authenticate, async (req, res) => {
  const { name, bio, timezone } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });

  const { error: updateError } = await db
    .from('users')
    .update({ name: name.trim(), bio: (bio || '').trim(), timezone: timezone || 'Asia/Kolkata' })
    .eq('id', req.userId);

  if (updateError) return res.status(500).json({ error: updateError.message });

  const { data: user } = await db.from('users').select('*').eq('id', req.userId).single();
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || '',
    bio: user.bio || '',
    avatarUrl: user.avatar_url || null,
    timezone: user.timezone,
    availability: await getAvailability(user.id),
    blockedDates: await getBlockedDates(user.id),
    createdAt: user.created_at,
  });
});

// PUT /api/users/me/username
router.put('/me/username', authenticate, async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required.' });

  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (clean.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters.' });

  const { data: conflict, error: findError } = await db
    .from('users')
    .select('id')
    .eq('username', clean)
    .neq('id', req.userId)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (conflict) return res.status(409).json({ error: 'That username is already taken.' });

  const { error: updateError } = await db.from('users').update({ username: clean }).eq('id', req.userId);
  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ username: clean });
});

// GET /api/users/me/availability
router.get('/me/availability', authenticate, async (req, res) => {
  res.json({ availability: await getAvailability(req.userId) });
});

// PUT /api/users/me/availability
router.put('/me/availability', authenticate, async (req, res) => {
  const { availability } = req.body;
  if (!availability) return res.status(400).json({ error: 'Availability is required.' });
  await setAvailability(req.userId, availability);
  res.json({ availability: await getAvailability(req.userId) });
});

// GET /api/users/me/blocked-dates
router.get('/me/blocked-dates', authenticate, async (req, res) => {
  res.json({ blockedDates: await getBlockedDates(req.userId) });
});

// PUT /api/users/me/blocked-dates
router.put('/me/blocked-dates', authenticate, async (req, res) => {
  const { blockedDates } = req.body;
  if (!Array.isArray(blockedDates)) return res.status(400).json({ error: 'blockedDates must be an array.' });
  await setBlockedDates(req.userId, blockedDates);
  res.json({ blockedDates: await getBlockedDates(req.userId) });
});

// GET /api/users/check-username?username=foo  (public)
router.get('/check-username', async (req, res) => {
  const { username, excludeUserId } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required.' });
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

  let query = db.from('users').select('id').eq('username', clean);
  if (excludeUserId) query = query.neq('id', excludeUserId);

  const { data: conflict } = await query.maybeSingle();
  res.json({ available: !conflict });
});

// GET /api/users/:username  (public profile lookup)
router.get('/:username', async (req, res) => {
  const { data: row, error } = await db
    .from('users')
    .select('*')
    .eq('username', req.params.username.toLowerCase())
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!row) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: await buildPublicUser(row) });
});

export default router;
