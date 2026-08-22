import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from './db.js';
import { authenticate } from './users.js';
import { sendBookingEmails } from './email.js';

const router = Router();

// GET /api/bookings  — all bookings for the logged-in user
router.get('/', authenticate, async (req, res) => {
  const { data: rows, error } = await db
    .from('bookings')
    .select('*')
    .eq('user_id', req.userId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const bookings = (rows || []).map(r => ({
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
router.post('/', async (req, res) => {
  const { userId, date, startTime, endTime, guestName, guestEmail, guestNote } = req.body;

  if (!userId || !date || !startTime || !endTime || !guestName || !guestEmail) {
    return res.status(400).json({ error: 'Missing required booking fields.' });
  }

  // Check if slot is already taken
  const { data: conflict, error: checkError } = await db
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('start_time', startTime)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (checkError) return res.status(500).json({ error: checkError.message });
  if (conflict) {
    return res.status(409).json({ error: 'That time slot is already booked.' });
  }

  const id = 'b_' + nanoid(10);
  const { error: insertError } = await db.from('bookings').insert({
    id,
    user_id: userId,
    date,
    start_time: startTime,
    end_time: endTime,
    guest_name: guestName.trim(),
    guest_email: guestEmail.trim(),
    guest_note: (guestNote || '').trim(),
    status: 'upcoming'
  });

  if (insertError) return res.status(500).json({ error: insertError.message });

  const { data: row } = await db.from('bookings').select('*').eq('id', id).single();
  
  // Fetch host user details to send emails
  const { data: hostUser } = await db.from('users').select('name, email').eq('id', userId).single();
  if (hostUser) {
    // Send emails in the background (don't await)
    sendBookingEmails({
      host: hostUser,
      guest: { name: guestName.trim(), email: guestEmail.trim() },
      booking: row
    }).catch(e => console.error(e));
  }

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
router.put('/:id/cancel', authenticate, async (req, res) => {
  const { data: booking, error: fetchError } = await db
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (booking.user_id !== req.userId) return res.status(403).json({ error: 'Forbidden.' });

  const { error: updateError } = await db
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ success: true });
});

// GET /api/bookings/check?userId=X&date=Y&startTime=Z  (public — for slot availability check)
router.get('/check', async (req, res) => {
  const { userId, date, startTime } = req.query;
  if (!userId || !date || !startTime) return res.status(400).json({ error: 'Missing params.' });

  const { data: conflict, error } = await db
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('start_time', startTime)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ booked: !!conflict });
});

export default router;
