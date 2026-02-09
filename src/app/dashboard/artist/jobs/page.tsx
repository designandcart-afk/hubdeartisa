'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function ArtistActiveJobsPage() {
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; status: string; deadline: string | null }>>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setMessage('Please sign in to view your jobs.');
        return;
      }

      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!artistProfile?.id) {
        setMessage('Complete your artist profile first.');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, deadline')
        .eq('selected_artist_id', artistProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setJobs(data || []);
      }
    };

    loadJobs();
  }, []);

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => window.history.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Active Jobs</h1>
          <p className={styles.pageDescription}>Track the projects you’re currently working on.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          {message && <p className={styles.jobMeta}>{message}</p>}
          <div className={styles.jobsGrid}>
            {jobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.jobMeta}>Status: {job.status}</p>
                <p className={styles.jobMeta}>Deadline: {job.deadline || 'Flexible'}</p>
                <div className={styles.jobActions}>
                  <button
                    className={styles.cardButton}
                    onClick={() => (window.location.href = `/dashboard/artist/jobs/${job.id}/agreement`)}
                  >
                    View Agreement
                  </button>
                  <button
                    className={styles.ghostButton}
                    onClick={() => (window.location.href = ROUTES.artistJobMessages(job.id))}
                  >
                    Messages
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
