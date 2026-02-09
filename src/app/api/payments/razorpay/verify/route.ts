import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { projectId, orderId, paymentId, signature } = await request.json();

    if (!projectId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification data.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    await supabaseAdmin
      .from('project_payments')
      .update({ status: 'paid', payment_id: paymentId })
      .eq('project_id', projectId)
      .eq('order_id', orderId);

    await supabaseAdmin
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('id', projectId);

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('selected_artist_id')
      .eq('id', projectId)
      .single();

    if (project?.selected_artist_id) {
      const { data: artist } = await supabaseAdmin
        .from('artist_profiles')
        .select('user_id, email, phone')
        .eq('id', project.selected_artist_id)
        .single();

      if (artist?.user_id) {
        const baseUrl = new URL(request.url).origin;
        await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: artist.user_id,
            email: artist.email,
            whatsapp: artist.phone,
            message: 'Client payment received. You can start work on the project.',
          }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed.' }, { status: 500 });
  }
}