"use client";

import React, { useState } from "react";

import styles from "./page.module.css";

const contactInfo = [
  {
    type: "address",
    label: "Address",
    value: "123 Pizza Street, New York, NY 10001",
    icon: "📍",
  },
  {
    type: "phone",
    label: "Phone",
    value: "(555) 123-4567",
    icon: "📞",
  },
  {
    type: "email",
    label: "Email",
    value: "hello@pizzacraft.com",
    icon: "✉️",
  },
  {
    type: "hours",
    label: "Hours",
    value: (
      <>
        Mon–Fri: 11am–11pm
        <br />
        Sat: 10am–12am · Sun: 10am–10pm
      </>
    ),
    icon: "🕐",
  },
];

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: "instagram",
  },
  {
    name: "Facebook",
    href: "#",
    icon: "facebook",
  },
  {
    name: "Twitter",
    href: "#",
    icon: "twitter",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Get in Touch</h1>

          <p className={styles.heroSubtitle}>
            Have a question, feedback, or want to book a catering event?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {/* Contact Info */}
          <div className={styles.info}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Contact Information</h3>

              <p className={styles.infoDesc}>
                Fill out the form and our team will get back to you within 24
                hours.
              </p>

              <div className={styles.infoItems}>
                {contactInfo.map((item) => (
                  <div className={styles.infoItem} key={item.type}>
                    <span className={styles.infoIcon}>{item.icon}</span>

                    <div>
                      <span className={styles.infoLabel}>{item.label}</span>

                      <span className={styles.infoValue}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className={styles.socials}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon === "instagram" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    )}

                    {social.icon === "facebook" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )}

                    {social.icon === "twitter" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formWrap}>
            {submitted ? (
              <div className={styles.success}>
                <span className={styles.successIcon}>✅</span>

                <h3 className={styles.successTitle}>Message Sent!</h3>

                <p className={styles.successText}>
                  Thank you for reaching out. We&apos;ll get back to you
                  shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className={styles.form}
                id="contact-form"
              >
                <div className={styles.formRow}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">
                      Full Name
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      id="contact-name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">
                      Email
                    </label>

                    <input
                      className="form-input"
                      type="email"
                      id="contact-email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-subject">
                    Subject
                  </label>

                  <select
                    className="form-input"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Issue</option>
                    <option value="catering">Catering Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">
                    Message
                  </label>

                  <textarea
                    className={`form-input ${styles.textarea}`}
                    id="contact-message"
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  id="contact-submit"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <section className={styles.mapSection}>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapContent}>
            <span className={styles.mapPin}>📍</span>

            <h3 className={styles.mapTitle}>Visit Us</h3>

            <p className={styles.mapAddress}>
              {contactInfo.find((item) => item.type === "address")?.value}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
