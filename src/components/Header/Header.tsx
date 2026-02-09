import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { ROUTES } from '@/constants/brand';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <Link href={ROUTES.home} className={styles.logo}>
            <span className={styles.logoDeArtisa}>DeArtisa</span>
            <span className={styles.logoAccent}>&apos;</span>
            <span className={styles.logoHub}>Hub</span>
          </Link>
          
          <nav className={styles.nav}>
            <Link href={ROUTES.visualizers} className={styles.navLink}>
              Find Visualizers
            </Link>
            <Link href={ROUTES.howItWorks} className={styles.navLink}>
              How It Works
            </Link>
            <Link href={ROUTES.about} className={styles.navLink}>
              About
            </Link>
          </nav>
          
          <div className={styles.actions}>
            <button className={styles.btnSecondary}>Sign In</button>
            <button className={styles.btnPrimary}>Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
}
