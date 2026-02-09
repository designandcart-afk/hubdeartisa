import React from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Footer from '@/components/Footer/Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
