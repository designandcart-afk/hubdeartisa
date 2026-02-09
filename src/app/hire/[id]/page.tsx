'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { ROUTES } from '@/constants/brand';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function HirePage() {
  const params = useParams();
  const router = useRouter();
  const visualizerId = params.id as string;
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  const [accessMessage, setAccessMessage] = useState('Checking access...');
  const [visualizer, setVisualizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setAccessState('blocked');
        setAccessMessage('Please sign in to assign work to a 3D artist.');
        return;
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleRow?.role !== 'client') {
        setAccessState('blocked');
        setAccessMessage('Only clients can assign work to 3D artists.');
        return;
      }

      setAccessState('allowed');
    };

    checkAccess();
  }, []);

  useEffect(() => {
    const loadArtist = async () => {
      const { data } = await supabase
        .from('artist_profiles')
        .select('id, full_name, experience, min_rate, max_rate, state, country, user_id, email, phone')
        .eq('id', visualizerId)
        .single();

      setVisualizer(data || null);
      setLoading(false);
    };

    if (visualizerId) {
      loadArtist();
    }
  }, [visualizerId]);
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    requirements: '',
    deadline: '',
    budget: '',
  });

  if (loading) {
    return (
      <Layout>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>Loading artist...</h1>
        </div>
      </Layout>
    );
  }

  if (!visualizer) {
    return (
      <Layout>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>Visualizer not found</h1>
        </div>
      </Layout>
    );
  }

  if (accessState === 'blocked') {
    return (
      <Layout>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>{accessMessage}</h1>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Button onClick={() => router.push(ROUTES.signIn)}>Sign In</Button>
            <Button variant="outline" onClick={() => router.push(ROUTES.visualizers)}>
              Back to Artists
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setMessage('Please sign in to submit a brief.');
      return;
    }

    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!clientProfile?.id) {
      setMessage('Please complete your client profile first.');
      return;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        client_id: clientProfile.id,
        title: formData.projectTitle,
        description: `${formData.description}\n\nRequirements: ${formData.requirements}`,
        category: 'Direct Hire',
        budget_min: Number(formData.budget || 0),
        budget_max: Number(formData.budget || 0),
        deadline: formData.deadline || null,
        status: 'assigned',
        selected_artist_id: visualizer.id,
      })
      .select('id')
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    if (visualizer?.user_id) {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: visualizer.user_id,
          email: visualizer.email,
          whatsapp: visualizer.phone,
          message: `You have a new direct hire request. Submit your quote here: ${window.location.origin}/jobs/${project?.id}`,
        }),
      });
    }

    router.push(ROUTES.clientProjects);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Submit Project Brief</h1>
          <p className={styles.pageDescription}>
            Provide details about your project. {visualizer.full_name} will review and send you a quote.
          </p>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.contentGrid}>
            {/* Main Form */}
            <div className={styles.mainContent}>
              <form onSubmit={handleSubmit}>
                <Card padding="large">
                  <h2 className={styles.formTitle}>Project Details</h2>
                  
                  <Input
                    label="Project Title"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    placeholder="e.g., Modern Living Room Visualization"
                    required
                  />
                  
                  <Input
                    label="Project Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project vision, style, and any key elements..."
                    multiline
                    rows={5}
                    required
                  />
                  
                  <Input
                    label="Specific Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Camera angles, lighting preferences, materials, etc..."
                    multiline
                    rows={4}
                    required
                  />
                  
                  <div className={styles.formRow}>
                    <Input
                      label="Deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                    />
                    
                    <Input
                      label="Budget (USD)"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div className={styles.fileUpload}>
                    <label className={styles.fileUploadLabel}>
                      Project Files
                      <span className={styles.fileUploadHint}>(CAD files, references, mood boards)</span>
                    </label>
                    <div className={styles.fileUploadArea}>
                      <p className={styles.fileUploadText}>
                        Click to upload or drag and drop
                      </p>
                      <p className={styles.fileUploadSubtext}>
                        Max file size: 50MB
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.formActions}>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" size="large">
                      Submit Brief
                    </Button>
                  </div>
                  {message && <p className={styles.notice}>{message}</p>}
                </Card>
              </form>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <Card padding="medium">
                <h3 className={styles.sidebarTitle}>Selected Visualizer</h3>
                
                <div className={styles.visualizerInfo}>
                  <div className={styles.visualizerAvatar}>
                    {visualizer.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className={styles.visualizerName}>{visualizer.full_name}</p>
                    <p className={styles.visualizerTitle}>{visualizer.state}, {visualizer.country}</p>
                  </div>
                </div>
                
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Hourly Rate</span>
                    <span className={styles.infoValue}>₹{visualizer.min_rate || 0} - ₹{visualizer.max_rate || 0}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Experience</span>
                    <span className={styles.infoValue}>{visualizer.experience}</span>
                  </div>
                </div>
              </Card>
              
              <Card padding="medium">
                <h3 className={styles.sidebarTitle}>What Happens Next?</h3>
                <ol className={styles.stepsList}>
                  <li className={styles.stepsItem}>
                    {visualizer.full_name} reviews your brief
                  </li>
                  <li className={styles.stepsItem}>
                    You receive a detailed quote
                  </li>
                  <li className={styles.stepsItem}>
                    Approve and secure payment
                  </li>
                  <li className={styles.stepsItem}>
                    Work begins on your project
                  </li>
                </ol>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}
