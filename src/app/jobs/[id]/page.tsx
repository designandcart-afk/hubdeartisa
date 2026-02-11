'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  const [form, setForm] = useState({ timeline: '', notes: '' });
  const [services, setServices] = useState<Array<{ name: string; rate: string }>>([
    { name: 'Modeling', rate: '' },
  ]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const currencySymbol = '$';

  const containsContactInfo = (value: string) => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

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
        .select('id, title, description, category, budget_min, budget_max, deadline, status, reference_links, client_id')
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

    if (containsContactInfo(form.notes)) {
      setMessage('Please remove phone numbers or emails from your quote notes.');
      return;
    }

    if (!termsAccepted) {
      setMessage('Please accept the terms before submitting your quote.');
      return;
    }

    const cleanedServices = services
      .map((service) => ({
        name: service.name.trim(),
        rate: Number(service.rate || 0),
      }))
      .filter((service) => service.name && service.rate > 0);

    if (cleanedServices.length === 0) {
      setMessage('Please add at least one service with a valid rate.');
      return;
    }

    const totalAmount = cleanedServices.reduce((sum, service) => sum + service.rate, 0);

    const pdfUrl = await generateAndUploadQuotePdf({
      project,
      services: cleanedServices,
      timeline: Number(form.timeline || 0),
      notes: form.notes,
      totalAmount,
    });

    if (!pdfUrl) {
      setMessage('Unable to generate quote PDF. Please try again.');
      return;
    }

    const { error } = await supabase.from('project_quotes').insert({
      project_id: projectId,
      artist_id: artistId,
      amount: totalAmount,
      timeline_days: Number(form.timeline),
      notes: form.notes,
      services: cleanedServices,
      pdf_url: pdfUrl,
      terms_accepted_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      await notifyQuoteParties(pdfUrl, totalAmount);
      setMessage('Quote submitted! The client will review your offer.');
      setForm({ timeline: '', notes: '' });
      setServices([{ name: 'Modeling', rate: '' }]);
      setTermsAccepted(false);
    }
  };

  const totalAmount = useMemo(
    () => services.reduce((sum, service) => sum + Number(service.rate || 0), 0),
    [services]
  );

  const handleServiceChange = (index: number, field: 'name' | 'rate', value: string) => {
    setServices((prev) =>
      prev.map((service, idx) => (idx === index ? { ...service, [field]: value } : service))
    );
  };

  const addServiceRow = () => {
    setServices((prev) => [...prev, { name: '', rate: '' }]);
  };

  const removeServiceRow = (index: number) => {
    setServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  const generateAndUploadQuotePdf = async ({
    project,
    services,
    timeline,
    notes,
    totalAmount,
  }: {
    project: any;
    services: Array<{ name: string; rate: number }>;
    timeline: number;
    notes: string;
    totalAmount: number;
  }) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("De'Artisa Hub Quote", 14, 18);
      doc.setFontSize(12);
      doc.text(`Project: ${project?.title || ''}`, 14, 30);
      doc.text(`Timeline: ${timeline} days`, 14, 38);

      doc.text('Services:', 14, 50);
      let y = 58;
      services.forEach((service) => {
        doc.text(`• ${service.name}: ${currencySymbol}${service.rate}`, 18, y);
        y += 8;
      });
      doc.text(`Total: ${currencySymbol}${totalAmount}`, 14, y + 6);

      if (notes) {
        doc.text('Notes:', 14, y + 18);
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(notes, 180), 14, y + 26);
      }

      const pdfBlob = doc.output('blob');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) return null;

      const formData = new FormData();
      formData.append('file', pdfBlob, `quote-${project?.id || 'project'}.pdf`);
      formData.append('upload_preset', 'de_artisa_uploads');
      formData.append('resource_type', 'raw');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.secure_url as string;
    } catch (error) {
      return null;
    }
  };

  const notifyQuoteParties = async (pdfUrl: string, totalAmount: number) => {
    if (!project?.client_id || !artistId) return;

    const [{ data: clientProfile }, { data: artistProfile }] = await Promise.all([
      supabase
        .from('client_profiles')
        .select('user_id, email')
        .eq('id', project.client_id)
        .single(),
      supabase
        .from('artist_profiles')
        .select('user_id, email')
        .eq('id', artistId)
        .single(),
    ]);

    const clientMessage = `You received a new quote for ${project.title}. Total: ${currencySymbol}${totalAmount}. Download: ${pdfUrl}`;
    const artistMessage = `Your quote for ${project.title} was submitted. Total: ${currencySymbol}${totalAmount}. Download: ${pdfUrl}`;

    if (clientProfile?.user_id) {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientProfile.user_id,
          email: clientProfile.email,
          message: clientMessage,
        }),
      });
    }

    if (artistProfile?.user_id) {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: artistProfile.user_id,
          email: artistProfile.email,
          message: artistMessage,
        }),
      });
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
                <strong>{currencySymbol}{project.budget_max}</strong>
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
                <div className={styles.servicesCard}>
                  <div className={styles.servicesHeader}>
                    <h3>Service Breakdown</h3>
                    <button type="button" className={styles.addServiceButton} onClick={addServiceRow}>
                      + Add Service
                    </button>
                  </div>
                  {services.map((service, index) => (
                    <div key={index} className={styles.serviceRow}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Service (e.g., Modeling)"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ fontSize: '16px' }}>$</span>
                        <input
                          type="number"
                          className={styles.input}
                          placeholder="Rate"
                          value={service.rate}
                          onChange={(e) => handleServiceChange(index, 'rate', e.target.value)}
                        />
                      </div>
                      {services.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeServiceButton}
                          onClick={() => removeServiceRow(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className={styles.serviceTotal}>
                    <span>Total Quote</span>
                    <strong>{currencySymbol}{totalAmount}</strong>
                  </div>
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
                  <p className={styles.helperText}>
                    Avoid sharing phone numbers or emails. Keep communication on De’Artisa Hub.
                  </p>
                </div>
                <div className={styles.termsCard}>
                  <h4>Quote Terms</h4>
                  <ul>
                    <li>All communication stays on De’Artisa Hub.</li>
                    <li>Delivery follows the agreed timeline.</li>
                    <li>Payments are held in escrow until client approval.</li>
                  </ul>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    I agree to the quote terms.
                  </label>
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
