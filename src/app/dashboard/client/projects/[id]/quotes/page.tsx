'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

type Quote = {
  id: string;
  amount: number;
  timeline_days: number;
  notes: string | null;
  status: string;
  artist_profiles: Array<{
    id: string;
    full_name: string;
    country: string;
  }>;
};

export default function ClientProjectQuotesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadQuotes = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setMessage('Please sign in to view quotes.');
        setLoading(false);
        return;
      }

      const { data: project } = await supabase
        .from('projects')
        .select('id, title')
        .eq('id', projectId)
        .single();

      setProjectTitle(project?.title || '');

      const { data, error } = await supabase
        .from('project_quotes')
        .select('id, amount, timeline_days, notes, status, artist_profiles(id, full_name, country)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        const normalized = (data || []).map((row: any) => ({
          ...row,
          artist_profiles: Array.isArray(row.artist_profiles) ? row.artist_profiles : row.artist_profiles ? [row.artist_profiles] : [],
        }));
        setQuotes(normalized);
      }
      setLoading(false);
    };

    if (projectId) {
      loadQuotes();
    }
  }, [projectId]);

  const handleSelect = async (quote: Quote) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    const artistProfile = quote.artist_profiles?.[0];
    if (!userId || !artistProfile?.id) {
      setMessage('Unable to select this quote yet.');
      return;
    }

    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!clientProfile?.id) {
      setMessage('Complete your client profile first.');
      return;
    }

    const { error } = await supabase
      .from('projects')
      .update({
        selected_artist_id: artistProfile.id,
        selected_quote_id: quote.id,
        status: 'assigned',
      })
      .eq('id', projectId);

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data: artistDetails } = await supabase
      .from('artist_profiles')
      .select('user_id, email, phone')
      .eq('id', artistProfile.id)
      .single();

    if (artistDetails?.user_id) {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: artistDetails.user_id,
          email: artistDetails.email,
          whatsapp: artistDetails.phone,
          message: `You have been selected for a project. Please review and accept the agreement in your dashboard.`,
        }),
      });
    }

    setMessage('Artist selected. Please review the agreement next.');
    router.push(ROUTES.clientProjectAgreement(projectId));
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Quotes for {projectTitle}</h1>
          <p className={styles.pageDescription}>Compare offers and choose your preferred artist.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          {message && <p className={styles.notice}>{message}</p>}
          {loading ? (
            <p className={styles.notice}>Loading quotes...</p>
          ) : (
            <div className={styles.quoteGrid}>
              {quotes.length === 0 && (
                <div className={styles.emptyState}>
                  <h2>No quotes yet</h2>
                  <p>Artists will appear here once they respond to your brief.</p>
                </div>
              )}
              {quotes.map((quote) => {
                const artist = quote.artist_profiles?.[0];
                return (
                <article key={quote.id} className={styles.quoteCard}>
                  <div>
                    <p className={styles.quoteArtist}>{artist?.full_name || 'Artist'}</p>
                    <h3 className={styles.quoteAmount}>₹{quote.amount}</h3>
                    <p className={styles.quoteMeta}>Timeline: {quote.timeline_days} days</p>
                    <p className={styles.quoteMeta}>Location: {artist?.country || 'Remote'}</p>
                    {quote.notes && <p className={styles.quoteNotes}>{quote.notes}</p>}
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.primaryButton} onClick={() => handleSelect(quote)}>
                      Select Artist
                    </button>
                    <button className={styles.ghostButton} onClick={() => router.push(ROUTES.clientProjectAgreement(projectId))}>
                      View Agreement
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
