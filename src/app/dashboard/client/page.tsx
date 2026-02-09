'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function ClientDashboardPage() {
  const [name, setName] = useState('');
  const [stats, setStats] = useState<Array<{ label: string; value: number; change: string }>>([]);
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    due: string;
    budget: string;
    artists: number;
    category: string;
    accent: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const getStatusClass = (status: string) => {
    if (status === 'COMPLETED') return styles.statusCompleted;
    if (status === 'ASSIGNED') return styles.statusReview;
    if (status === 'OPEN') return styles.statusDraft;
    return styles.statusActive;
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('client_profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

      if (data?.full_name) setName(data.full_name);
    };

    const loadProjects = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!clientProfile?.id) return;

      const { data: projectRows } = await supabase
        .from('projects')
        .select('id, title, status, deadline, budget_min, budget_max, category')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      const projectIds = (projectRows || []).map((row) => row.id);
      const { data: quoteRows } = projectIds.length
        ? await supabase
            .from('project_quotes')
            .select('project_id')
            .in('project_id', projectIds)
        : { data: [] };

      const quotesByProject = new Map<string, number>();
      (quoteRows || []).forEach((row: any) => {
        quotesByProject.set(row.project_id, (quotesByProject.get(row.project_id) || 0) + 1);
      });

      const statusProgress: Record<string, number> = {
        open: 20,
        assigned: 40,
        in_progress: 65,
        completed: 100,
      };

      const accentPalette = [
        'linear-gradient(135deg, #1b62ff, #6c5ce7)',
        'linear-gradient(135deg, #00b894, #0984e3)',
        'linear-gradient(135deg, #f39c12, #e84393)',
        'linear-gradient(135deg, #2d3436, #636e72)',
        'linear-gradient(135deg, #6c5ce7, #00cec9)',
        'linear-gradient(135deg, #ff7675, #fdcb6e)',
      ];

      const mapped = (projectRows || []).map((project, index) => ({
        id: project.id,
        name: project.title,
        status: project.status.replace('_', ' ').toUpperCase(),
        progress: statusProgress[project.status] ?? 30,
        due: project.deadline || 'Flexible',
        budget: `$${project.budget_max || 0}`,
        artists: quotesByProject.get(project.id) || 0,
        category: project.category || 'General',
        accent: accentPalette[index % accentPalette.length],
      }));

      const statsData = [
        { label: 'Active Projects', value: mapped.filter((p) => p.status === 'IN_PROGRESS').length, change: 'In production' },
        { label: 'Completed Works', value: mapped.filter((p) => p.status === 'COMPLETED').length, change: 'Delivered' },
        { label: 'Assigned', value: mapped.filter((p) => p.status === 'ASSIGNED').length, change: 'Awaiting quote' },
        { label: 'Open Briefs', value: mapped.filter((p) => p.status === 'OPEN').length, change: 'Receiving quotes' },
      ];

      setProjects(mapped);
      setStats(statsData);
      setLoading(false);
    };

    loadProfile();
    loadProjects();
  }, []);

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Client Dashboard</h1>
          <p className={styles.pageDescription}>
            Welcome{name ? `, ${name}` : ''}! Post projects and manage your collaborations.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <p className={styles.statLabel}>{stat.label}</p>
                <div className={styles.statValueRow}>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                  <span className={styles.statChange}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.mainLayout}>
            <div className={styles.mainContent}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Your Projects</h2>
                  <p className={styles.sectionSubtitle}>
                    Manage briefs, compare proposals, and track every milestone in one place.
                  </p>
                </div>
                <div className={styles.filterRow}>
                  <button className={styles.filterChip}>All</button>
                  <button className={styles.filterChip}>Active</button>
                  <button className={styles.filterChip}>In Review</button>
                  <button className={styles.filterChip}>Completed</button>
                </div>
              </div>

              <div className={styles.projectGrid}>
                {loading && <p className={styles.sectionSubtitle}>Loading projects...</p>}
                {!loading && projects.length === 0 && (
                  <p className={styles.sectionSubtitle}>No projects yet. Post your first brief.</p>
                )}
                {projects.map((project) => (
                  <article key={project.id} className={styles.projectCard}>
                    <div className={styles.thumbnail} style={{ background: project.accent }}>
                      <span className={`${styles.statusPill} ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className={styles.projectBody}>
                      <div className={styles.projectHeader}>
                        <div>
                          <p className={styles.projectCategory}>{project.category}</p>
                          <h3 className={styles.projectTitle}>{project.name}</h3>
                        </div>
                        <p className={styles.projectId}>#{project.id.slice(0, 6)}</p>
                      </div>
                      <div className={styles.progressRow}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className={styles.progressValue}>{project.progress}%</span>
                      </div>
                      <div className={styles.projectMeta}>
                        <div>
                          <p className={styles.metaLabel}>Due</p>
                          <p className={styles.metaValue}>{project.due}</p>
                        </div>
                        <div>
                          <p className={styles.metaLabel}>Budget</p>
                          <p className={styles.metaValue}>{project.budget}</p>
                        </div>
                        <div>
                          <p className={styles.metaLabel}>Quotes</p>
                          <p className={styles.metaValue}>{project.artists}</p>
                        </div>
                      </div>
                      <div className={styles.projectActions}>
                        <button
                          className={styles.primaryButton}
                          onClick={() => (window.location.href = ROUTES.clientProjects)}
                        >
                          Open Project
                        </button>
                        <button
                          className={styles.ghostButton}
                          onClick={() => (window.location.href = ROUTES.clientProjects)}
                        >
                          View Brief
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Quick Actions</h3>
                <button
                  className={styles.primaryButtonFull}
                  onClick={() => (window.location.href = ROUTES.newClientProject)}
                >
                  Post Work
                </button>
                <button
                  className={styles.secondaryButtonFull}
                  onClick={() => (window.location.href = ROUTES.visualizers)}
                >
                  Browse Artists
                </button>
                <button
                  className={styles.secondaryButtonFull}
                  onClick={() => (window.location.href = ROUTES.clientProjects)}
                >
                  Compare Quotes
                </button>
                <button className={styles.secondaryButtonFull}>Message Center</button>
              </div>

              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Workflow Snapshot</h3>
                <div className={styles.snapshotItem}>
                  <span>Avg. proposal time</span>
                  <strong>18 hrs</strong>
                </div>
                <div className={styles.snapshotItem}>
                  <span>Avg. revision rounds</span>
                  <strong>2.3</strong>
                </div>
                <div className={styles.snapshotItem}>
                  <span>On-time delivery</span>
                  <strong>94%</strong>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Recommended Next Steps</h3>
                <ul className={styles.sidebarList}>
                  <li>Invite your favorite artists to active briefs.</li>
                  <li>Upload reference images to speed up proposals.</li>
                  <li>Set milestone dates for every delivery stage.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
