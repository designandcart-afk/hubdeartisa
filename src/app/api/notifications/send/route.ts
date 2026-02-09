import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { userId, email, whatsapp, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing userId or message.' }, { status: 400 });
    }

    const tasks: Promise<any>[] = [];
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin is not configured.' }, { status: 500 });
    }

    if (email && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      tasks.push(
        resend.emails.send({
          from: 'DeArtisa Hub <noreply@deartisahub.com>',
          to: email,
          subject: 'New Project Update',
          text: message,
        })
      );
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        channel: 'email',
        destination: email,
        message,
        status: 'sent',
      });
    }

    if (whatsapp && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      tasks.push(
        client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${whatsapp}`,
          body: message,
        })
      );
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        channel: 'whatsapp',
        destination: whatsapp,
        message,
        status: 'sent',
      });
    }

    await Promise.all(tasks);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Notification failed.' }, { status: 500 });
  }
}