'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Button/Button';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function JobsPage() {
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  const [accessMessage, setAccessMessage] = useState('Checking access...');
  const [projects, setProjects] = useState<Array<{
    id: string;
    title: string;
    description: string | null;
    budget_min: number;
    budget_max: number;
    deadline: string | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setAccessState('blocked');
        setAccessMessage('Please sign in to view available jobs.');
        return;
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleRow?.role !== 'artist') {
        setAccessState('blocked');
        setAccessMessage('Only 3D artists can view and quote on jobs.');
        return;
      }

      setAccessState('allowed');
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (accessState !== 'allowed') return;

    const loadProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, budget_min, budget_max, deadline, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (!error) {
        setProjects(data || []);
      }
    };

    loadProjects();
  }, [accessState]);

  if (accessState === 'blocked') {
    return (
      <Layout>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>{accessMessage}</h1>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Button onClick={() => (window.location.href = ROUTES.signIn)}>Sign In</Button>
            <Button variant="outline" onClick={() => (window.location.href = ROUTES.home)}>
              Back Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Find 3D Work</h1>
          <p className={styles.pageDescription}>
            Browse client projects and submit your quote.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No jobs yet</h2>
              <p>Client projects will appear here once they post briefs.</p>
              <Button variant="outline" onClick={() => (window.location.href = ROUTES.home)}>
                Back Home
              </Button>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {projects.map((project) => (
                <article key={project.id} className={styles.jobCard}>
                  <div>
                    <p className={styles.jobMeta}>Budget: {project.budget_min} - {project.budget_max}</p>
                    <h3 className={styles.jobTitle}>{project.title}</h3>
                    <p className={styles.jobDescription}>
                      {project.description || 'No description provided yet.'}
                    </p>
                    <p className={styles.jobMeta}>Deadline: {project.deadline || 'Flexible'}</p>
                  </div>
                  <div className={styles.jobActions}>
                    <Button onClick={() => (window.location.href = ROUTES.jobDetail(project.id))}>
                      Submit Quote
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = ROUTES.jobDetail(project.id))}>
                      View Details
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
