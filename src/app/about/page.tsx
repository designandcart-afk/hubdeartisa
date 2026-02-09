import React from 'react';
import Layout from '@/components/Layout/Layout';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>About De'Artisa Hub</h1>
          <p className={styles.pageDescription}>
            Connecting architects and designers with the world's best 3D visualization artists
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.content}>
            <div className={styles.imageSection}>
              <div className={styles.imageGrid}>
                <div className={styles.imageItem}>Design Excellence</div>
                <div className={styles.imageItem}>Quality Renders</div>
                <div className={styles.imageItem}>Trusted Platform</div>
                <div className={styles.imageItem}>Professional Work</div>
              </div>
            </div>
            
            <div className={styles.textBlock}>
              <h2 className={styles.sectionTitle}>Our Mission</h2>
              <p className={styles.paragraph}>
                De'Artisa Hub offers the best architectural rendering and 3D visualization services, committed to delivering high-quality solutions that bring your projects to life with clarity and precision. Whether you're an architect, designer, or property developer, our advanced 3D rendering services turn your concepts into vivid, tangible realities, aiding in effective decision-making.
              </p>
              <p className={styles.paragraph}>
                Our goal is to offer the best 3D visualization services at unbeatable prices and speed. To achieve this, we leverage our global talent network and suite of proprietary online collaboration tools that streamline the feedback, notification, file transfer, and payment processes.
              </p>
            </div>

            <div className={styles.textBlock}>
              <h2 className={styles.sectionTitle}>Our Services</h2>
              <p className={styles.paragraph}>
                We specialize in a comprehensive range of 3D visualization services including exterior and interior renderings, aerial renderings, 3D floor plans, photorealistic renderings, architectural animations, and virtual reality experiences. Our network of professional 3D artists uses industry-leading software to create stunning visualizations that accurately depict your vision.
              </p>
              <p className={styles.paragraph}>
                From conceptual renderings in the early design stages to photorealistic final presentations, we provide end-to-end visualization solutions that help you communicate your designs effectively, secure approvals, and market your projects with impact.
              </p>
            </div>

            <div className={styles.textBlock}>
              <h2 className={styles.sectionTitle}>Our Commitment</h2>
              <div className={styles.valuesList}>
                <div className={styles.valueItem}>
                  <h3 className={styles.valueTitle}>Quality Assurance</h3>
                  <p className={styles.valueParagraph}>
                    Every project benefits from our rigorous quality standards. We ensure accurate, detailed, and lifelike visualizations that meet professional expectations.
                  </p>
                </div>
                <div className={styles.valueItem}>
                  <h3 className={styles.valueTitle}>Ongoing Support</h3>
                  <p className={styles.valueParagraph}>
                    Our commitment doesn't end with delivery. We offer ongoing support for revisions, updates, and any questions that may arise after project completion.
                  </p>
                </div>
                <div className={styles.valueItem}>
                  <h3 className={styles.valueTitle}>Global Excellence</h3>
                  <p className={styles.valueParagraph}>
                    Access top-tier 3D artists from around the world. Our global network ensures you get the best talent at competitive prices, regardless of your location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
