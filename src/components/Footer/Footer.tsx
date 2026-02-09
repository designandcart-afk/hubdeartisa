import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { ROUTES } from '@/constants/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.logo}>
              <span className={styles.logoDeArtisa}>DeArtisa</span>
              <span className={styles.logoAccent}>&apos;</span>
              <span className={styles.logoHub}>Hub</span>
            </div>
            <p className={styles.tagline}>
              Connecting interior designers with world-class 3D visualizers
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Platform</h4>
            <nav className={styles.footerNav}>
              <Link href={ROUTES.visualizers} className={styles.footerLink}>
                Find Visualizers
              </Link>
              <Link href={ROUTES.howItWorks} className={styles.footerLink}>
                How It Works
              </Link>
              <Link href={ROUTES.about} className={styles.footerLink}>
                About Us
              </Link>
            </nav>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Support</h4>
            <nav className={styles.footerNav}>
              <a href="#" className={styles.footerLink}>Help Center</a>
              <a href="#" className={styles.footerLink}>Contact</a>
              <a href="#" className={styles.footerLink}>FAQ</a>
            </nav>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Legal</h4>
            <nav className={styles.footerNav}>
              <a href="#" className={styles.footerLink}>Privacy Policy</a>
              <a href="#" className={styles.footerLink}>Terms of Service</a>
            </nav>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            {currentYear} DeArtisa&apos;Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
