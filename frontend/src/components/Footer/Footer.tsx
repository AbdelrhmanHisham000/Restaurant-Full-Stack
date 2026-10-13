import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🍕</span>
              <span className={styles.logoText}>
                Pizza<span className={styles.logoBold}>Craft</span>
              </span>
            </Link>
            <p className={styles.tagline}>
              Handcrafted pizzas made with love, fresh ingredients, and fired in our wood-burning oven since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.colLinks}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/menu">Our Menu</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Hours */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Hours</h4>
            <ul className={styles.colLinks}>
              <li>Mon – Fri: 11am – 11pm</li>
              <li>Saturday: 10am – 12am</li>
              <li>Sunday: 10am – 10pm</li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Contact</h4>
            <ul className={styles.colLinks}>
              <li>📍 123 Pizza Street, NY 10001</li>
              <li>📞 (555) 123-4567</li>
              <li>✉️ hello@pizzacraft.com</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} PizzaCraft. All rights reserved.</p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className={styles.social}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className={styles.social}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className={styles.social}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
