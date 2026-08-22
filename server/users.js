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

function buildPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || null,
    timezone: row.timezone,
    availability: getAvailability(row.id),
    blockedDates: getBlockedDates(row.id),
    createdAt: row.created_at,
  };
}

// GET /api/users/me/profile
router.get('/me/profile', authenticate, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || '',
    bio: user.bio || '',
    avatarUrl: user.avatar_url || null,
    timezone: user.timezone,
    availability: getAvailability(user.id),
    blockedDates: getBlockedDates(user.id),
    createdAt: user.created_at,
  });
});

// PUT /api/users/me/profile
router.put('/me/profile', authenticate, (req, res) => {
  const { name, bio, timezone } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });

  db.prepare(`
    UPDATE users SET name = ?, bio = ?, timezone = ? WHERE id = ?
  `).run(name.trim(), (bio || '').trim(), timezone || 'Asia/Kolkata', req.userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || '',
    bio: user.bio || '',
    avatarUrl: user.avatar_url || null,
    timezone: user.timezone,
    availability: getAvailability(user.id),
    blockedDates: getBlockedDates(user.id),
    createdAt: user.created_at,
  });
});

// PUT /api/users/me/username
router.put('/me/username', authenticate, (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required.' });

  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (clean.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters.' });

  const conflict = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(clean, req.userId);
  if (conflict) return res.status(409).json({ error: 'That username is already taken.' });

  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(clean, req.userId);
  res.json({ username: clean });
});

// GET /api/users/me/availability
router.get('/me/availability', authenticate, (req, res) => {
  res.json({ availability: getAvailability(req.userId) });
});

// PUT /api/users/me/availability
router.put('/me/availability', authenticate, (req, res) => {
  const { availability } = req.body;
  if (!availability) return res.status(400).json({ error: 'Availability is required.' });
  setAvailability(req.userId, availability);
  res.json({ availability: getAvailability(req.userId) });
});

// GET /api/users/me/blocked-dates
router.get('/me/blocked-dates', authenticate, (req, res) => {
  res.json({ blockedDates: getBlockedDates(req.userId) });
});

// PUT /api/users/me/blocked-dates
router.put('/me/blocked-dates', authenticate, (req, res) => {
  const { blockedDates } = req.body;
  if (!Array.isArray(blockedDates)) return res.status(400).json({ error: 'blockedDates must be an array.' });
  setBlockedDates(req.userId, blockedDates);
  res.json({ blockedDates: getBlockedDates(req.userId) });
});

// GET /api/users/check-username?username=foo  (public)
router.get('/check-username', (req, res) => {
  const { username, excludeUserId } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required.' });
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const conflict = db.prepare(
    'SELECT id FROM users WHERE username = ? AND id != ?'
  ).get(clean, excludeUserId || '');
  res.json({ available: !conflict });
});

// GET /api/users/:username  (public profile lookup)
router.get('/:username', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!row) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: buildPublicUser(row) });
});

export default router;
