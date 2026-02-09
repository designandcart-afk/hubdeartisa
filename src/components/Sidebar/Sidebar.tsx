'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { ROUTES } from '@/constants/brand';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUserId = data.session?.user?.id;
      setIsAuthenticated(!!sessionUserId);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUserId = session?.user?.id;
      setIsAuthenticated(!!sessionUserId);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    closeSidebar();
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className={styles.hamburger} 
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Link href={ROUTES.home} onClick={closeSidebar}>
              <img 
                src="/logo.png" 
                alt="DeArtisa'Hub" 
                className={styles.logo}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            <Link 
              href={ROUTES.home} 
              className={styles.navLink}
              onClick={closeSidebar}
            >
              Home
            </Link>
            <Link 
              href={ROUTES.visualizers} 
              className={styles.navLink}
              onClick={closeSidebar}
            >
              Find 3D Artists
            </Link>
            {isAuthenticated && (
              <Link 
                href={ROUTES.dashboard} 
                className={styles.navLink}
                onClick={closeSidebar}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {isAuthenticated ? (
              <button className={styles.btnSecondary} onClick={handleSignOut}>
                Sign Out
              </button>
            ) : (
              <>
                <Link href={ROUTES.signIn} onClick={closeSidebar} className={styles.btnSecondary}>
                  Sign In
                </Link>
                <Link href={ROUTES.getStarted}>
                  <button className={styles.btnPrimary}>Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
