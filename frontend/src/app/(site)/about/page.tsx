import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Our Story</h1>
          <p className={styles.heroSubtitle}>
            From a small family kitchen to your favorite neighborhood pizzeria
          </p>
        </div>
      </section>

      {/* Story */}
      <section className={`container ${styles.story}`}>
        <div className={styles.storyGrid}>
          <div className={styles.storyImage}>
            <Image
              src="/images/pizza-margherita.jpg"
              alt="Our wood-fired oven"
              width={560}
              height={400}
              className={styles.storyImg}
            />
          </div>
          <div className={styles.storyContent}>
            <span className={styles.storyLabel}>Est. 2010</span>
            <h2 className={styles.storyTitle}>A Passion for Perfect Pizza</h2>
            <p className={styles.storyText}>
              PizzaCraft was born from a simple belief: that great pizza starts with great ingredients and
              ends with love. In 2010, our founder Marco Rossi left his corporate career to pursue his
              lifelong dream of bringing authentic Italian pizza to the heart of New York City.
            </p>
            <p className={styles.storyText}>
              Armed with his grandmother&apos;s dough recipe and a custom-built wood-fired oven imported from
              Naples, Marco opened the doors to our first tiny storefront. Word spread quickly — the
              neighborhood had found its pizza paradise.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className="container">
          <h2 className="section-title">
            What We <span className="accent-text">Stand For</span>
          </h2>
          <p className="section-subtitle">
            Every pizza tells a story of quality, tradition, and innovation.
          </p>
          <div className={styles.valuesGrid}>
            {[
              {
                icon: '🌾',
                title: 'Quality Ingredients',
                desc: 'We source the finest San Marzano tomatoes, imported Italian flour, and locally grown produce. No shortcuts, no compromises.',
              },
              {
                icon: '🤝',
                title: 'Community First',
                desc: 'We believe in supporting our local community. From sourcing local produce to sponsoring neighborhood events, we give back.',
              },
              {
                icon: '♻️',
                title: 'Sustainability',
                desc: 'Eco-friendly packaging, zero food waste programs, and energy-efficient ovens. We care for our planet as much as our pizza.',
              },
              {
                icon: '❤️',
                title: 'Made with Love',
                desc: 'Every pizza is handcrafted with genuine passion. Our pizzaiolos pour their hearts into each and every pie they create.',
              },
            ].map((item) => (
              <div key={item.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{item.icon}</span>
                <h3 className={styles.valueTitle}>{item.title}</h3>
                <p className={styles.valueDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={`container ${styles.team}`}>
        <h2 className="section-title">
          Meet the <span className="accent-text">Team</span>
        </h2>
        <p className="section-subtitle">
          The passionate people behind every pizza
        </p>
        <div className={styles.teamGrid}>
          {[
            { name: 'Marco Rossi', role: 'Founder & Head Chef', emoji: '👨‍🍳' },
            { name: 'Sofia Chen', role: 'Head Pizzaiolo', emoji: '👩‍🍳' },
            { name: 'James Miller', role: 'Operations Manager', emoji: '👨‍💼' },
            { name: 'Elena Diaz', role: 'Pastry Chef', emoji: '👩‍🍳' },
          ].map((member) => (
            <div key={member.name} className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <span className={styles.teamEmoji}>{member.emoji}</span>
              </div>
              <h4 className={styles.teamName}>{member.name}</h4>
              <span className={styles.teamRole}>{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className={styles.numbers}>
        <div className={`container ${styles.numbersGrid}`}>
          {[
            { num: '15+', label: 'Years in Business' },
            { num: '50K+', label: 'Pizzas Served Monthly' },
            { num: '25', label: 'Team Members' },
            { num: '4.9★', label: 'Average Rating' },
          ].map((item) => (
            <div key={item.label} className={styles.numberItem}>
              <span className={styles.numberValue}>{item.num}</span>
              <span className={styles.numberLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
