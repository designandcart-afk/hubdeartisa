'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Button/Button';
import { ROUTES } from '@/constants/brand';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function VisualizerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const visualizerId = params.id as string;
  const [role, setRole] = useState<'client' | 'artist' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visualizer, setVisualizer] = useState<{
    id: string;
    full_name: string;
    state: string;
    country: string;
    experience: string;
    specialties: string[];
    languages: string;
    bio: string;
    hourly_rate: number;
    min_rate: number;
    max_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    image_url: string;
  }>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [rates, setRates] = useState<Array<{
    id: string;
    specialty: string;
    rate_type: string;
    min_price: number;
    max_price: number;
  }>>([]);

  useEffect(() => {
    const loadRole = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      setIsAuthenticated(!!userId);

      if (!userId) {
        setRole(null);
        return;
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      setRole((roleRow?.role as 'client' | 'artist') || null);
    };

    loadRole();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from('artist_profiles')
        .select('id, full_name, state, country, experience, specialties, languages, bio, hourly_rate, min_rate, max_rate')
        .eq('id', visualizerId)
        .single();

      setVisualizer(data || null);
      setLoading(false);

      if (data?.id) {
        const { data: portfolioData } = await supabase
          .from('artist_portfolio')
          .select('id, title, description, category, image_url')
          .eq('artist_id', data.id)
          .order('created_at', { ascending: false });

        setPortfolio(portfolioData || []);

        const { data: rateData } = await supabase
          .from('artist_rates')
          .select('id, specialty, rate_type, min_price, max_price')
          .eq('artist_id', data.id)
          .order('specialty', { ascending: true });

        setRates(rateData || []);
      }
    };

    loadProfile();
  }, [visualizerId]);
  
  if (!visualizer && !loading) {
    return (
      <Layout>
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1>Visualizer not found</h1>
        </div>
      </Layout>
    );
  }

  const handleHire = () => {
    if (!visualizer) {
      return;
    }

    if (!isAuthenticated) {
      alert('Please sign in to assign work to a 3D artist.');
      router.push(ROUTES.signIn);
      return;
    }

    if (role !== 'client') {
      alert('Only clients can assign work to 3D artists.');
      return;
    }

    router.push(ROUTES.hire(visualizer.id));
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
      {/* Profile Header */}
      <section className={styles.profileHeader}>
        <div className="container">
          {loading ? (
            <p>Loading profile...</p>
          ) : (
          <div className={styles.profileContent}>
            <div className={styles.profileLeft}>
              <div className={styles.avatar}>
                {visualizer?.full_name.charAt(0)}
              </div>
              <div className={styles.profileInfo}>
                <h1 className={styles.name}>{visualizer?.full_name}</h1>
                <p className={styles.title}>3D Artist</p>
                <p className={styles.location}>{visualizer?.state}, {visualizer?.country}</p>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{visualizer?.experience}</span>
                    <span className={styles.statLabel}>experience</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.profileRight}>
              {role !== 'artist' && (
                <Button 
                  size="large" 
                  fullWidth 
                  onClick={handleHire}
                >
                  Hire Now
                </Button>
              )}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.bio}>{visualizer?.bio}</p>
          
          <div className={styles.specialtiesSection}>
            <h3 className={styles.subsectionTitle}>Specialties</h3>
            <div className={styles.specialties}>
              {visualizer?.specialties?.map((specialty, index) => (
                <span key={index} className={styles.specialty}>
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.languagesSection}>
            <h3 className={styles.subsectionTitle}>Languages</h3>
            <p className={styles.languages}>{visualizer?.languages || 'English'}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Work</h2>
          {portfolio.length === 0 && <p>No work uploaded yet.</p>}
          <div className={styles.portfolioGrid}>
            {portfolio.map((item) => (
              <div key={item.id} className={styles.portfolioItem}>
                <button
                  type="button"
                  className={styles.portfolioImage}
                  onClick={() => setActiveIndex(portfolio.findIndex((p) => p.id === item.id))}
                >
                  <img src={item.image_url} alt={item.title} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Pricing</h2>
          {rates.length === 0 ? (
            <p>No rates set yet.</p>
          ) : (
            <div className={styles.ratesTable}>
              <div className={styles.ratesHeader}>
                <span>Specialty</span>
                <span>Rate Type</span>
                <span>Range (USD)</span>
              </div>
              {rates.map((rate) => (
                <div key={rate.id} className={styles.ratesRow}>
                  <span className={styles.rateSpecialty}>{rate.specialty}</span>
                  <span className={styles.rateType}>{rate.rate_type}</span>
                  <span className={styles.rateRange}>
                    ${rate.min_price} - ${rate.max_price}
                  </span>
                </div>
              ))}
            </div>
          )}
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
