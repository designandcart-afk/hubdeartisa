'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Redirecting...');

  useEffect(() => {
    const routeByRole = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setMessage('Please sign in to access your dashboard.');
        router.push(ROUTES.signIn);
        return;
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleRow?.role === 'client') {
        router.push(ROUTES.clientDashboard);
        return;
      }

      if (roleRow?.role === 'artist') {
        router.push(ROUTES.artistDashboard);
        return;
      }

      setMessage('We could not detect your role yet. Please sign in again.');
      router.push(ROUTES.home);
    };

    routeByRole();
  }, [router]);

  return (
    <Layout>
      <div className={styles.loadingWrap}>
        <div className="container">
          <h1 className={styles.title}>{message}</h1>
          <p className={styles.subtitle}>Taking you to your dashboard</p>
        </div>
      </div>
    </Layout>
  );
}
