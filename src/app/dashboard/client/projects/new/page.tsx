'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './page.module.css';

export default function NewClientProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    budgetMax: '',
    deadline: '',
    description: '',
    referenceLink: '',
  });
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const containsContactInfo = (value: string) => {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (
      containsContactInfo(formData.title) ||
      containsContactInfo(formData.description) ||
      containsContactInfo(formData.referenceLink)
    ) {
      setMessage('Please remove phone numbers or emails from your project details.');
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setMessage('Please sign in to create a project.');
      setLoading(false);
      return;
    }

    const { data: clientProfile, error: clientError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (clientError || !clientProfile?.id) {
      setMessage('Please complete your client profile before posting a project.');
      setLoading(false);
      return;
    }

    const referenceLinks = formData.referenceLink
      ? [formData.referenceLink.trim()]
      : [];

    const { error } = await supabase.from('projects').insert({
      client_id: clientProfile.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budget_max: Number(formData.budgetMax || 0),
      deadline: formData.deadline || null,
      status: 'open',
      reference_links: [...referenceLinks, ...attachmentUrls],
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(ROUTES.clientProjects);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Post a Project</h1>
          <p className={styles.pageDescription}>
            Share your brief and invite top visualizers to submit quotes.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Project Title</label>
                <input
                  name="title"
                  className={styles.input}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <input
                  name="category"
                  className={styles.input}
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Interior, Exterior, Retail, etc."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  className={styles.input}
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Max Budget</label>
                <input
                  type="number"
                  name="budgetMax"
                  className={styles.input}
                  value={formData.budgetMax}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Project Description</label>
                <textarea
                  name="description"
                  className={styles.textarea}
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                />
              </div>
              <div className={styles.formGroupFull}>
                <p className={styles.helpText}>
                  Please avoid sharing personal phone numbers or emails. Keep communication on De’Artisa Hub.
                </p>
              </div>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Reference Link (optional)</label>
                <input
                  name="referenceLink"
                  className={styles.input}
                  value={formData.referenceLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className={styles.formGroupFull}>
                <label className={styles.label}>Upload Files (optional)</label>
                <CldUploadWidget
                  uploadPreset="de_artisa_uploads"
                  options={{ multiple: true, resourceType: 'auto' }}
                  onSuccess={(result: any) => {
                    if (result.event === 'success') {
                      setAttachmentUrls((prev) => [...prev, result.info.secure_url]);
                    }
                  }}
                >
                  {({ open }) => (
                    <div>
                      <button
                        type="button"
                        className={styles.uploadButton}
                        onClick={() => open()}
                      >
                        Upload Files
                      </button>
                      {attachmentUrls.length > 0 && (
                        <div className={styles.fileList}>
                          {attachmentUrls.map((url) => (
                            <span key={url} className={styles.fileItem}>
                              {url.split('/').pop()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>
            </div>
            {message && <p className={styles.notice}>{message}</p>}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Project'}
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => router.push(ROUTES.clientProjects)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
