import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { projectId, amount } = await request.json();

    if (!projectId || !amount) {
      return NextResponse.json({ error: 'Missing projectId or amount.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin is not configured.' }, { status: 500 });
    }

    const clientId = await getClientId(supabaseAdmin, projectId);
    if (!clientId) {
      return NextResponse.json({ error: 'Project client not found.' }, { status: 400 });
    }

    const razorpayKey = process.env.RAZORPAY_KEY_ID || '';
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!razorpayKey || !razorpaySecret) {
      return NextResponse.json({ error: 'Razorpay keys are missing.' }, { status: 500 });
    }

    const client = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });

    const order = await client.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `project_${projectId}`,
    });

    await supabaseAdmin.from('project_payments').insert({
      project_id: projectId,
      client_id: clientId,
      amount: Number(amount),
      provider: 'razorpay',
      status: 'created',
      order_id: order.id,
    });

    return NextResponse.json({
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Order creation failed.' }, { status: 500 });
  }
}

async function getClientId(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>, projectId: string) {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single();

  return data?.client_id || null;
}