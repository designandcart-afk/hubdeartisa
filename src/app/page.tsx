import React from 'react';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/Button/Button';
import Link from 'next/link';
import { ROUTES } from '@/constants/brand';
import styles from './page.module.css';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>
                Stunning 3D Architectural Renderings<br />
                <span className="text-accent">Made Easy</span>
              </h1>
              <p className={styles.heroDescription}>
                De'Artisa Hub offers high-quality, fast, and affordable 3D Visualization Services for architects, designers, and developers. Find and hire the best 3D Artist from our global professional network and create stunning visuals for your projects.
              </p>
              <div className={styles.heroActions}>
                <Link href={ROUTES.visualizers}>
                  <Button size="large">Find 3D Artists</Button>
                </Link>
              </div>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.heroImages}>
                <div className={`${styles.heroImage} ${styles.heroImage1}`}>
                  <span className={styles.imageLabel}>Interior</span>
                </div>
                <div className={`${styles.heroImage} ${styles.heroImage2}`}>
                  <span className={styles.imageLabel}>Exterior</span>
                </div>
                <div className={`${styles.heroImage} ${styles.heroImage3}`}>
                  <span className={styles.imageLabel}>3D Floor Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Post a Job</h3>
              <p className={styles.stepDescription}>
                Create a design brief using our quick and easy online form. Receive offers from our global network of 3D artists.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Hire the Best 3D Artist</h3>
              <p className={styles.stepDescription}>
                Review portfolios, ratings, and offers. Hire your preferred artist by depositing the agreed fee into escrow.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>03</div>
              <h3 className={styles.stepTitle}>Collaborate Online</h3>
              <p className={styles.stepDescription}>
                Work together seamlessly using our online collaboration tools. Exchange files, provide feedback, and track progress.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>04</div>
              <h3 className={styles.stepTitle}>Approve & Pay</h3>
              <p className={styles.stepDescription}>
                Review final deliverables, approve the work, and close the job. Funds are released to the artist once approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why De'Artisa Hub</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Global Artist Network</h3>
              <p className={styles.featureDescription}>
                Access talented 3D artists from around the world. Save money and get exceptional results by outsourcing your projects.
              </p>
            </div>
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Secure Escrow Payment</h3>
              <p className={styles.featureDescription}>
                Your funds are protected. Artists are only paid when you approve the final work, ensuring quality and satisfaction.
              </p>
            </div>
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Seamless Collaboration</h3>
              <p className={styles.featureDescription}>
                Manage projects efficiently with our online collaboration tools that streamline feedback, notifications, and file transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>About Us</h2>
          <div className={styles.aboutContent}>
            <p className={styles.aboutText}>
              De'Artisa Hub offers the best architectural rendering and 3D visualization services, committed to delivering high-quality solutions that bring your projects to life with clarity and precision. Whether you're an architect, designer, or property developer, our advanced 3D rendering services turn your concepts into vivid, tangible realities, aiding in effective decision-making.
            </p>
            <p className={styles.aboutText}>
              Our goal is to offer the best 3D visualization services at unbeatable prices and speed. To achieve this, we leverage our global talent network and suite of proprietary online collaboration tools that streamline the feedback, notification, file transfer, and payment processes.
            </p>
          </div>

          <h3 className={styles.subsectionTitle}>Our Services</h3>
          <div className={styles.servicesList}>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceTitle}>Exterior & Interior Renderings</h4>
              <p className={styles.serviceDescription}>
                Photorealistic visualizations of building exteriors and interior spaces, showcasing materials, lighting, and design details.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceTitle}>3D Floor Plans</h4>
              <p className={styles.serviceDescription}>
                Three-dimensional floor plans that provide realistic views of spatial layouts and design flow.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceTitle}>Architectural Animations</h4>
              <p className={styles.serviceDescription}>
                Dynamic walkthroughs and flythroughs that bring architectural designs to life with immersive experiences.
              </p>
            </div>
            <div className={styles.serviceItem}>
              <h4 className={styles.serviceTitle}>Virtual Reality Experiences</h4>
              <p className={styles.serviceDescription}>
                Cutting-edge VR visualizations that allow clients to explore spaces before construction begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to bring your vision to life?</h2>
            <p className={styles.ctaDescription}>
              Start your project today with our network of expert 3D artists.
            </p>
            <Link href={ROUTES.getStarted}>
              <Button size="large">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
