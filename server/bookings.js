import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from './db.js';
import { authenticate } from './users.js';

const router = Router();

// GET /api/bookings  — all bookings for the logged-in user
router.get('/', authenticate, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM bookings WHERE user_id = ? ORDER BY date ASC, start_time ASC
  `).all(req.userId);

  const bookings = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    guestName: r.guest_name,
    guestEmail: r.guest_email,
    guestNote: r.guest_note || '',
    status: r.status,
    createdAt: r.created_at,
  }));

  res.json({ bookings });
});

// POST /api/bookings  — create a new booking (public, no auth needed)
router.post('/', (req, res) => {
  const { userId, date, startTime, endTime, guestName, guestEmail, guestNote } = req.body;

  if (!userId || !date || !startTime || !endTime || !guestName || !guestEmail) {
    return res.status(400).json({ error: 'Missing required booking fields.' });
  }

  // Check if slot is already taken
  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE user_id = ? AND date = ? AND start_time = ? AND status != 'cancelled'
  `).get(userId, date, startTime);

  if (conflict) {
    return res.status(409).json({ error: 'That time slot is already booked.' });
  }

  const id = 'b_' + nanoid(10);
  db.prepare(`
    INSERT INTO bookings (id, user_id, date, start_time, end_time, guest_name, guest_email, guest_note, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'upcoming')
  `).run(id, userId, date, startTime, endTime, guestName.trim(), guestEmail.trim(), (guestNote || '').trim());

  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  res.status(201).json({
    booking: {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      guestNote: row.guest_note || '',
      status: row.status,
      createdAt: row.created_at,
    }
  });
});

// PUT /api/bookings/:id/cancel  — cancel a booking (owner only)
router.put('/:id/cancel', authenticate, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden.' });

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// GET /api/bookings/check?userId=X&date=Y&startTime=Z  (public — for slot availability check)
router.get('/check', (req, res) => {
  const { userId, date, startTime } = req.query;
  if (!userId || !date || !startTime) return res.status(400).json({ error: 'Missing params.' });

  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE user_id = ? AND date = ? AND start_time = ? AND status != 'cancelled'
  `).get(userId, date, startTime);

  res.json({ booked: !!conflict });
});

export default router;
