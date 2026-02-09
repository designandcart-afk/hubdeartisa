'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const SPECIALTIES = [
  'Interior Rendering',
  'Exterior Rendering',
  '3D Floor Plans',
  'Architectural Animation',
  'Virtual Reality',
  'Landscape Design',
  'Other',
];

export default function ArtistProfileUpdatePage() {
  const [artistId, setArtistId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    state: '',
    country: '',
    experience: '',
    languages: '',
    phone: '',
    custom_specialty: '',
    bio: '',
  });
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from('artist_profiles')
        .select('id, full_name, state, country, experience, specialties, custom_specialty, languages, phone, bio')
        .eq('user_id', userId)
        .single();

      if (data?.id) setArtistId(data.id);
      setForm({
        full_name: data?.full_name || '',
        state: data?.state || '',
        country: data?.country || '',
        experience: data?.experience || '',
        languages: data?.languages || '',
        phone: data?.phone || '',
        custom_specialty: data?.custom_specialty || '',
        bio: data?.bio || '',
      });
      setSpecialties(data?.specialties || []);
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setStatus(null);
  };

  const handleSave = async () => {
    if (!artistId) return;
    setSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from('artist_profiles')
      .update({
        full_name: form.full_name,
        state: form.state,
        country: form.country,
        experience: form.experience,
        languages: form.languages,
        phone: form.phone || null,
        specialties,
        custom_specialty: form.custom_specialty || null,
        bio: form.bio,
      })
      .eq('id', artistId);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Profile updated successfully.');
    }

    setSaving(false);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <button className={styles.backButton} onClick={() => window.history.back()}>
            ← Back
          </button>
          <h1 className={styles.pageTitle}>Update Profile</h1>
          <p className={styles.pageDescription}>Edit your profile details (email can’t be changed).</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          {status && <p className={styles.notice}>{status}</p>}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} name="full_name" value={form.full_name} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>State</label>
              <input className={styles.input} name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country</label>
              <input className={styles.input} name="country" value={form.country} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Experience</label>
              <input className={styles.input} name="experience" value={form.experience} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Languages</label>
              <input className={styles.input} name="languages" value={form.languages} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input className={styles.input} name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Specialties</label>
              <div className={styles.checkboxGrid}>
                {SPECIALTIES.map((specialty) => (
                  <label key={specialty} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={specialties.includes(specialty)}
                      onChange={() =>
                        setSpecialties((prev) =>
                          prev.includes(specialty)
                            ? prev.filter((item) => item !== specialty)
                            : [...prev, specialty]
                        )
                      }
                    />
                    <span>{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Custom Specialty</label>
              {specialties.includes('Other') ? (
                <input
                  className={styles.input}
                  name="custom_specialty"
                  value={form.custom_specialty}
                  onChange={handleChange}
                />
              ) : (
                <input
                  className={styles.input}
                  name="custom_specialty"
                  value=""
                  placeholder="Select Other to specify"
                  disabled
                />
              )}
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.label}>Bio</label>
              <textarea className={styles.textarea} name="bio" value={form.bio} onChange={handleChange} rows={4} />
            </div>
          </div>
          <button className={styles.cardButton} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>
    </Layout>
  );
}
