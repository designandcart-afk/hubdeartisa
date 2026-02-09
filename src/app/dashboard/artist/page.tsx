'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './page.module.css';

export default function ArtistDashboardPage() {
  const [name, setName] = useState('');
  const [artistId, setArtistId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [stats, setStats] = useState<Array<{ label: string; value: string; change: string }>>([]);
  const [activeJobs, setActiveJobs] = useState<Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    due: string;
    budget: string;
    client: string;
    accent: string;
  }>>([]);
  const [earningsSnapshot, setEarningsSnapshot] = useState({
    available: 0,
    escrow: 0,
    pending: 0,
  });

  const getJobStatusClass = (status: string) => {
    if (status === 'Revision') return styles.statusReview;
    if (status === 'Pending Review') return styles.statusPending;
    if (status.toLowerCase() === 'completed') return styles.statusCompleted;
    return styles.statusActive;
  };

  const [portfolio, setPortfolio] = useState<Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    image_url: string;
  }>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [pendingUploadUrl, setPendingUploadUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        setProfileLoaded(true);
        return;
      }

      const { data } = await supabase
        .from('artist_profiles')
        .select('id, full_name, state, country, experience, specialties, custom_specialty, languages, phone, bio, hourly_rate, min_rate, max_rate')
        .eq('user_id', userId)
        .single();

      if (data?.full_name) setName(data.full_name);
      if (data?.id) setArtistId(data.id);

      if (!data?.id) {
        setMessage('Please complete your artist profile before uploading work.');
      }

      setMessage(null);
      setProfileLoaded(true);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!artistId) return;

      const { data: assignedProjects } = await supabase
        .from('projects')
        .select('id, title, status, deadline, budget_min, budget_max, client_id')
        .eq('selected_artist_id', artistId)
        .order('created_at', { ascending: false });

      const clientIds = (assignedProjects || []).map((p: any) => p.client_id).filter(Boolean);
      const { data: clientRows } = clientIds.length
        ? await supabase
            .from('client_profiles')
            .select('id, full_name')
            .in('id', clientIds)
        : { data: [] };

      const clientMap = new Map<string, string>();
      (clientRows || []).forEach((row: any) => clientMap.set(row.id, row.full_name));

      const { data: paymentRows } = (assignedProjects || []).length
        ? await supabase
            .from('project_payments')
            .select('project_id, amount, status')
            .in('project_id', (assignedProjects || []).map((p: any) => p.id))
        : { data: [] };

      const paidTotal = (paymentRows || [])
        .filter((row: any) => row.status === 'paid')
        .reduce((sum: number, row: any) => sum + (row.amount || 0), 0);
      const escrowTotal = (paymentRows || [])
        .filter((row: any) => row.status === 'created')
        .reduce((sum: number, row: any) => sum + (row.amount || 0), 0);

      const completedCount = (assignedProjects || []).filter((p: any) => p.status === 'completed').length;
      const totalCount = (assignedProjects || []).length;
      const successRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

      const { data: openProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'open');

      const statusProgress: Record<string, number> = {
        assigned: 30,
        in_progress: 65,
        completed: 100,
      };

      const accentPalette = [
        'linear-gradient(135deg, #1b62ff, #6c5ce7)',
        'linear-gradient(135deg, #00b894, #0984e3)',
        'linear-gradient(135deg, #f39c12, #e84393)',
        'linear-gradient(135deg, #2d3436, #636e72)',
      ];

      const jobs = (assignedProjects || []).map((project: any, index: number) => ({
        id: project.id,
        title: project.title,
        status: project.status === 'assigned' ? 'Pending Review' : project.status.replace('_', ' '),
        progress: statusProgress[project.status] ?? 20,
        due: project.deadline || 'Flexible',
        budget: `₹${project.budget_min || 0} - ₹${project.budget_max || 0}`,
        client: clientMap.get(project.client_id) || 'Client',
        accent: accentPalette[index % accentPalette.length],
      }));

      setActiveJobs(jobs);
      setEarningsSnapshot({
        available: paidTotal,
        escrow: escrowTotal,
        pending: 0,
      });
      setStats([
        { label: 'Active Jobs', value: String(jobs.length), change: 'Assigned to you' },
        { label: 'Total Earnings', value: `₹${paidTotal}`, change: 'Paid by clients' },
        { label: 'Job Success', value: `${successRate}%`, change: 'Completed projects' },
        { label: 'New Leads', value: String(openProjects?.length || 0), change: 'Open briefs' },
      ]);
    };

    loadDashboard();
  }, [artistId]);

  const loadPortfolio = async () => {
      if (!artistId) return;
      const { data, error } = await supabase
        .from('artist_portfolio')
        .select('id, title, description, category, image_url')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setPortfolio(data || []);
    };

  useEffect(() => {
    loadPortfolio();
  }, [artistId]);

  useEffect(() => {
    const savePendingUpload = async () => {
      if (!artistId || !pendingUploadUrl) return;

      setUploading(true);
      setMessage(null);

      const { data, error } = await supabase
        .from('artist_portfolio')
        .insert({
          artist_id: artistId,
          title: 'Work',
          category: 'General',
          description: null,
          image_url: pendingUploadUrl,
        })
        .select('id, title, description, category, image_url')
        .single();

      if (error) {
        setMessage(error.message);
      } else if (data) {
        setPortfolio((prev) => [data, ...prev]);
        setLastUploadedUrl(pendingUploadUrl);
        setPendingUploadUrl(null);
        setMessage(null);
      }

      setUploading(false);
    };

    savePendingUpload();
  }, [artistId, pendingUploadUrl]);

  const handleUploadSuccess = async (result: any) => {
    if (result?.event && result.event !== 'success') return;

    setUploading(true);
    setMessage(null);

    const uploadInfo = result?.info || result?.data?.info || result?.data || result?.[0]?.info || result?.[0] || result;
    const imageUrl = uploadInfo?.secure_url || uploadInfo?.url;
    if (!imageUrl) {
      setMessage('Upload completed, but image URL was missing.');
      setUploading(false);
      return;
    }

    if (!artistId) {
      setPendingUploadUrl(imageUrl);
      setMessage('Upload completed. Finishing setup...');
      setUploading(false);
      return;
    }

    if (lastUploadedUrl === imageUrl) {
      setMessage('Upload already saved.');
      setUploading(false);
      return;
    }

    const { data, error } = await supabase
      .from('artist_portfolio')
      .insert({
        artist_id: artistId,
        title: 'Work',
        category: 'General',
        description: null,
        image_url: imageUrl,
      })
      .select('id, title, description, category, image_url')
      .single();

    if (error) {
      setMessage(error.message);
    } else if (data) {
      setPortfolio((prev) => [data, ...prev]);
      setLastUploadedUrl(imageUrl);
      setMessage(null);
      loadPortfolio();
    }

    setUploading(false);
  };

  const handlePrev = () => {
    if (activeIndex === null || portfolio.length === 0) return;
    setActiveIndex((prev) => (prev === null ? null : (prev - 1 + portfolio.length) % portfolio.length));
  };

  const handleNext = () => {
    if (activeIndex === null || portfolio.length === 0) return;
    setActiveIndex((prev) => (prev === null ? null : (prev + 1) % portfolio.length));
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Artist Dashboard</h1>
          <p className={styles.pageDescription}>
            Welcome{name ? `, ${name}` : ''}! Discover projects and manage your deliveries.
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

          <div className={styles.dashboardLayout}>
            <div className={styles.mainContent}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Active Jobs</h2>
                  <p className={styles.sectionSubtitle}>
                    Keep projects moving with clear milestones, client updates, and on-time delivery.
                  </p>
                </div>
                <div className={styles.filterRow}>
                  <button className={styles.filterChip}>All</button>
                  <button className={styles.filterChip}>Active</button>
                  <button className={styles.filterChip}>Revision</button>
                  <button className={styles.filterChip}>Pending Review</button>
                </div>
              </div>

              <div className={styles.jobGrid}>
                {activeJobs.map((job) => (
                  <article key={job.id} className={styles.jobCard}>
                    <div className={styles.jobThumb} style={{ background: job.accent }}>
                      <span className={`${styles.statusPill} ${getJobStatusClass(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className={styles.jobBody}>
                      <div className={styles.jobHeader}>
                        <div>
                          <p className={styles.jobClient}>{job.client}</p>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                        </div>
                        <p className={styles.jobId}>#{job.id}</p>
                      </div>
                      <div className={styles.progressRow}>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${job.progress}%` }} />
                        </div>
                        <span className={styles.progressValue}>{job.progress}%</span>
                      </div>
                      <div className={styles.jobMeta}>
                        <div>
                          <p className={styles.metaLabel}>Due</p>
                          <p className={styles.metaValue}>{job.due}</p>
                        </div>
                        <div>
                          <p className={styles.metaLabel}>Budget</p>
                          <p className={styles.metaValue}>{job.budget}</p>
                        </div>
                        <div>
                          <p className={styles.metaLabel}>Messages</p>
                          <p className={styles.metaValue}>4</p>
                        </div>
                      </div>
                      <div className={styles.jobActions}>
                        <button
                          className={styles.primaryButton}
                          onClick={() => (window.location.href = `/dashboard/artist/jobs/${job.id}/agreement`)}
                        >
                          View Agreement
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.workCenter}>
                <div className={styles.workHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Portfolio Highlights</h2>
                    <p className={styles.sectionSubtitle}>
                      Showcase your best visuals to attract premium clients and higher budgets.
                    </p>
                  </div>
                  <CldUploadWidget
                    uploadPreset="de_artisa_uploads"
                    options={{
                      sources: ['local'],
                      multiple: false,
                    }}
                    onError={(error) =>
                      setMessage(
                        typeof error === 'string'
                          ? error
                          : (error as { statusText?: string })?.statusText || 'Upload failed.'
                      )
                    }
                    onUpload={handleUploadSuccess}
                    onSuccess={handleUploadSuccess}
                  >
                    {({ open }) => (
                      <button
                        className={styles.addWorkButton}
                        onClick={() => open()}
                        disabled={uploading || !artistId}
                      >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
                {profileLoaded && !artistId && (
                  <p className={styles.notice}>Please complete your artist profile before uploading work.</p>
                )}
                {message && <p className={styles.notice}>{message}</p>}
                <div className={styles.workGrid}>
                  {portfolio.length === 0 && (
                    <div className={styles.emptyWork}>No work uploaded yet.</div>
                  )}
                  {portfolio.map((item) => (
                    <div key={item.id} className={styles.workCard}>
                      <button
                        type="button"
                        className={styles.workImage}
                        onClick={() => setActiveIndex(portfolio.findIndex((p) => p.id === item.id))}
                      >
                        <img src={item.image_url} alt={item.title} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidePanel}>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Quick Actions</h3>
                <button className={styles.primaryButtonFull} onClick={() => (window.location.href = ROUTES.jobs)}>
                  Browse Projects
                </button>
                <button className={styles.secondaryButtonFull} onClick={() => (window.location.href = '/dashboard/artist/jobs')}>
                  Active Jobs
                </button>
                <button className={styles.secondaryButtonFull} onClick={() => (window.location.href = '/dashboard/artist/profile')}>
                  Update Profile
                </button>
                <button className={styles.secondaryButtonFull} onClick={() => (window.location.href = '/dashboard/artist/rates')}>
                  Update Rates
                </button>
                <button className={styles.secondaryButtonFull} onClick={() => (window.location.href = '/dashboard/artist/payouts')}>
                  Payout Settings
                </button>
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Earnings Snapshot</h3>
                <div className={styles.snapshotItem}>
                  <span>Available balance</span>
                  <strong>₹{earningsSnapshot.available}</strong>
                </div>
                <div className={styles.snapshotItem}>
                  <span>In escrow</span>
                  <strong>₹{earningsSnapshot.escrow}</strong>
                </div>
                <div className={styles.snapshotItem}>
                  <span>Pending payouts</span>
                  <strong>₹{earningsSnapshot.pending}</strong>
                </div>
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Performance Focus</h3>
                <ul className={styles.sideList}>
                  <li>Respond to new leads within 2 hours.</li>
                  <li>Upload previews at each milestone.</li>
                  <li>Keep revision notes centralized.</li>
                </ul>
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Profile Strength</h3>
                <div className={styles.profileMeter}>
                  <div className={styles.profileFill} style={{ width: '82%' }} />
                </div>
                <p className={styles.profileHint}>Complete your case study section to reach 100%.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {activeIndex !== null && portfolio[activeIndex] && (
        <div className={styles.lightbox} onClick={() => setActiveIndex(null)}>
          <div className={styles.lightboxContent} onClick={(event) => event.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setActiveIndex(null)}>
              ×
            </button>
            <button className={styles.lightboxNavLeft} onClick={handlePrev}>
              ‹
            </button>
            <img
              src={portfolio[activeIndex].image_url}
              alt="Work preview"
              className={styles.lightboxImage}
            />
            <button className={styles.lightboxNavRight} onClick={handleNext}>
              ›
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
