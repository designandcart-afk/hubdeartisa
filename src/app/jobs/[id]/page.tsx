'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function JobDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<any>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', timeline: '', notes: '' });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setMessage('Please sign in to submit a quote.');
        setLoading(false);
        return;
      }

      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      setArtistId(artistProfile?.id || null);

      const { data } = await supabase
        .from('projects')
        .select('id, title, description, category, budget_min, budget_max, deadline, status, reference_links')
        .eq('id', projectId)
        .single();

      setProject(data);
      setLoading(false);
    };

    if (projectId) {
      load();
    }
  }, [projectId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!artistId) {
      setMessage('Complete your artist profile before submitting quotes.');
      return;
    }

    const { error } = await supabase.from('project_quotes').insert({
      project_id: projectId,
      artist_id: artistId,
      amount: Number(form.amount),
      timeline_days: Number(form.timeline),
      notes: form.notes,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Quote submitted! The client will review your offer.');
      setForm({ amount: '', timeline: '', notes: '' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.pageTitle}>Loading...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className={styles.pageHeader}>
          <div className="container">
            <h1 className={styles.pageTitle}>Project not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => window.history.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>{project.title}</h1>
          <p className={styles.pageDescription}>{project.description}</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.layout}>
            <div className={styles.detailsCard}>
              <h2 className={styles.sectionTitle}>Project Details</h2>
              <div className={styles.detailRow}>
                <span>Category</span>
                <strong>{project.category || 'General'}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Budget</span>
                <strong>{project.budget_min} - {project.budget_max}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Deadline</span>
                <strong>{project.deadline || 'Flexible'}</strong>
              </div>
              {project.reference_links?.length > 0 && (
                <div className={styles.referenceBlock}>
                  <h3>Reference Links</h3>
                  <ul>
                    {project.reference_links.map((link: string) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.quoteCard}>
              <h2 className={styles.sectionTitle}>Submit a Quote</h2>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Quote Amount</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Timeline (days)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Notes</label>
                  <textarea
                    className={styles.textarea}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={5}
                  />
                </div>
                {message && <p className={styles.notice}>{message}</p>}
                <button className={styles.primaryButton} type="submit">
                  Submit Quote
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
