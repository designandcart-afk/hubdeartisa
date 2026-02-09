'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function ClientAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [agreementText, setAgreementText] = useState('');
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAgreement = async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('id, title, selected_artist_id, selected_quote_id, status')
        .eq('id', projectId)
        .single();

      if (!project?.selected_artist_id || !project.selected_quote_id) {
        setMessage('Select an artist quote first.');
        return;
      }

      const { data: quote } = await supabase
        .from('project_quotes')
        .select('amount, timeline_days')
        .eq('id', project.selected_quote_id)
        .single();

      const text = `Agreement Summary\n\nProject: ${project.title}\nSelected Quote: ₹${quote?.amount || 0}\nTimeline: ${quote?.timeline_days || 0} days\n\nTerms:\n1. De'Artisa Hub will mediate payments and release funds after client approval.\n2. Artist will deliver milestones on agreed timeline.\n3. Client agrees to provide timely feedback.\n4. All communications should happen through the platform.\n5. Any dispute will be handled by De'Artisa Hub mediation.`;

      setAgreementText(text);

      const { data: existingAgreement } = await supabase
        .from('project_agreements')
        .select('id, status')
        .eq('project_id', projectId)
        .single();

      if (existingAgreement?.id) {
        setAgreementId(existingAgreement.id);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!clientProfile?.id) return;

      const { data: agreement, error } = await supabase
        .from('project_agreements')
        .insert({
          project_id: projectId,
          client_id: clientProfile.id,
          artist_id: project.selected_artist_id,
          terms_text: text,
          status: 'pending',
        })
        .select('id')
        .single();

      if (!error && agreement?.id) {
        setAgreementId(agreement.id);
      }
    };

    if (projectId) {
      loadAgreement();
    }
  }, [projectId]);

  const handleAccept = async () => {
    if (!agreementId) return;
    const now = new Date().toISOString();

    const { data: currentAgreement } = await supabase
      .from('project_agreements')
      .select('artist_accepted_at, artist_id')
      .eq('id', agreementId)
      .single();

    const nextStatus = currentAgreement?.artist_accepted_at ? 'signed' : 'client_accepted';

    const { error } = await supabase
      .from('project_agreements')
      .update({
        status: nextStatus,
        client_accepted_at: now,
      })
      .eq('id', agreementId);

    if (error) {
      setMessage(error.message);
    } else {
      if (currentAgreement?.artist_id) {
        const { data: artist } = await supabase
          .from('artist_profiles')
          .select('user_id, email, phone')
          .eq('id', currentAgreement.artist_id)
          .single();

        if (artist?.user_id) {
          await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: artist.user_id,
              email: artist.email,
              whatsapp: artist.phone,
              message: 'Client accepted the agreement. Please review and accept in your dashboard.',
            }),
          });
        }
      }
      router.push(ROUTES.clientProjectPayment(projectId));
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
          <p className={styles.pageDescription}>Review and accept the project agreement.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.card}>
            <pre className={styles.agreementText}>{agreementText || 'Preparing agreement...'}</pre>
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
              Accept and Continue to Payment
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
