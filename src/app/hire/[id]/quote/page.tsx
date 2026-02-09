'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import Card from '@/components/Card/Card';
import Button from '@/components/Button/Button';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function QuotePage() {
  const router = useRouter();

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Project Quote</h1>
          <p className={styles.pageDescription}>
            Quotes are now managed directly from your client dashboard projects.
          </p>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.contentGrid}>
            {/* Main Content */}
            <div className={styles.mainContent}>
              <Card padding="large">
                <h2 className={styles.quoteTitle}>Quotes live in your dashboard</h2>
                <p className={styles.quoteNotes}>
                  All quotes from artists appear in your client project list. Select a project to compare offers and approve payment securely.
                </p>
                <div className={styles.quoteActions}>
                  <Button size="large" onClick={() => router.push(ROUTES.clientProjects)}>
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
