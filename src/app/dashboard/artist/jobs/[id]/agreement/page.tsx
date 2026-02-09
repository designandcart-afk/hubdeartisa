'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function ArtistAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [agreement, setAgreement] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAgreement = async () => {
      const { data } = await supabase
        .from('project_agreements')
        .select('id, terms_text, status')
        .eq('project_id', projectId)
        .single();

      setAgreement(data || null);
    };

    if (projectId) {
      loadAgreement();
    }
  }, [projectId]);

  const handleAccept = async () => {
    if (!agreement?.id) return;
    const now = new Date().toISOString();

    const { data: currentAgreement } = await supabase
      .from('project_agreements')
      .select('client_accepted_at, client_id')
      .eq('id', agreement.id)
      .single();

    const nextStatus = currentAgreement?.client_accepted_at ? 'signed' : 'artist_accepted';

    const { error } = await supabase
      .from('project_agreements')
      .update({
        status: nextStatus,
        artist_accepted_at: now,
      })
      .eq('id', agreement.id);

    if (error) {
      setMessage(error.message);
    } else {
      if (currentAgreement?.client_id) {
        const { data: client } = await supabase
          .from('client_profiles')
          .select('user_id, email, phone')
          .eq('id', currentAgreement.client_id)
          .single();

        if (client?.user_id) {
          await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: client.user_id,
              email: client.email,
              whatsapp: client.phone,
              message: 'Artist accepted the agreement. You can proceed to payment.',
            }),
          });
        }
      }
      router.push('/dashboard/artist/jobs');
    }
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Agreement</h1>
          <p className={styles.pageDescription}>Review and accept the agreement to begin work.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.card}>
            <pre className={styles.agreementText}>{agreement?.terms_text || 'Agreement pending.'}</pre>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              I agree to the terms above.
            </label>
            {message && <p className={styles.notice}>{message}</p>}
            <button
              className={styles.primaryButton}
              onClick={handleAccept}
              disabled={!checked}
            >
              Accept Agreement
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
