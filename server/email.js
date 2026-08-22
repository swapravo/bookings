import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'no-reply@emails.emaavy.ai';

export async function sendBookingEmails({ host, guest, booking }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is not set. Skipping email sending.');
    return;
  }

  const dateStr = booking.date; // e.g., 2026-08-25
  const timeStr = `${booking.start_time} - ${booking.end_time}`;
  const noteStr = booking.guest_note ? `\n\nMessage/Link: ${booking.guest_note}` : '';

  try {
    // 1. Email to the Guest (the person who booked)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: guest.email,
      subject: `Booking Confirmed with ${host.name}`,
      text: `Hi ${guest.name},

Your meeting with ${host.name} is confirmed!

Date: ${dateStr}
Time: ${timeStr}
${noteStr}

Thanks,
Booktime`
    });

    // 2. Email to the Host (the owner of the booking page)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: host.email,
      subject: `New Booking: ${guest.name}`,
      text: `Hi ${host.name},

You have a new booking from ${guest.name} (${guest.email}).

Date: ${dateStr}
Time: ${timeStr}
${noteStr}

Thanks,
Booktime`
    });

    console.log(`✅ Booking emails sent successfully for booking ${booking.id}`);
  } catch (error) {
    console.error('❌ Failed to send booking emails:', error);
  }
}
