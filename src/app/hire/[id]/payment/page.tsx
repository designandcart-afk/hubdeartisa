'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function PaymentPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Secure Payment</h1>
          <p className={styles.pageDescription}>
            Payments are handled from your client project flow with Razorpay escrow.
          </p>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.contentGrid}>
            {/* Main Form */}
            <div className={styles.mainContent}>
              <Card padding="large">
                <h2 className={styles.formTitle}>Payments handled in client projects</h2>
                <p className={styles.securityText}>
                  To keep funds safe and mediated, all payments are processed through Razorpay in your client dashboard.
                </p>
                <div className={styles.formActions}>
                  <Button type="button" size="large" onClick={() => router.push(ROUTES.clientProjects)}>
                    Go to Client Projects
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
