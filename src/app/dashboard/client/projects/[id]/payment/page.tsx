'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function ClientPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [amount, setAmount] = useState(0);
  const [amountINR, setAmountINR] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(83);
  const [projectTitle, setProjectTitle] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('id, title, selected_quote_id')
        .eq('id', projectId)
        .single();

      if (!project?.selected_quote_id) {
        setMessage('Please select a quote first.');
        return;
      }

      const { data: quote } = await supabase
        .from('project_quotes')
        .select('amount')
        .eq('id', project.selected_quote_id)
        .single();

      setAmount(quote?.amount || 0);
      setProjectTitle(project.title || '');
    };

    if (projectId) {
      load();
    }
  }, [projectId]);

  const handlePayment = async () => {
    setLoading(true);
    setMessage(null);

    const orderResponse = await fetch('/api/payments/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, amount }),
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      setMessage(orderData.error || 'Unable to create payment order.');
      setLoading(false);
      return;
    }

    // Update INR amount and exchange rate for display
    if (orderData.amountINR) {
      setAmountINR(orderData.amountINR);
      setExchangeRate(orderData.exchangeRate || 83);
    }

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'DeArtisa Hub',
      description: `Payment for ${projectTitle}`,
      order_id: orderData.orderId,
      handler: async (response: any) => {
        const verifyResponse = await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            orderId: orderData.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });

        if (verifyResponse.ok) {
          router.push(ROUTES.clientProjects);
        } else {
          setMessage('Payment verification failed.');
        }
      },
      theme: {
        color: '#092B2F',
      },
    };

    if (!window.Razorpay) {
      setMessage('Razorpay SDK not loaded.');
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Secure Payment</h1>
          <p className={styles.pageDescription}>Fund the project to start delivery.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.card}>
            <div>
              <p className={styles.label}>Project</p>
              <h2 className={styles.projectTitle}>{projectTitle}</h2>
            </div>
            <div className={styles.amountBox}>
              <p>Total due</p>
              <h3>${amount}</h3>
              {amountINR > 0 && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  ≈ ₹{amountINR.toLocaleString('en-IN')}
                  <br />
                  <small>(Rate: 1 USD = ₹{exchangeRate.toFixed(2)})</small>
                </p>
              )}
            </div>
            {message && <p className={styles.notice}>{message}</p>}
            <button className={styles.primaryButton} onClick={handlePayment} disabled={loading}>
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </div>
        </div>
      </section>

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </Layout>
  );
}
