"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { pizzas } from "@/data/pizzas";
// import { useCart } from "@/context/CartContext";
import PizzaCard from "@/components/PizzaCard/PizzaCard";
import PizzaModal from "@/components/PizzaModal/PizzaModal";
import type { Pizza } from "@/data/pizzas";
import styles from "../page.module.css";

const featuredPizzas = pizzas.filter((p) => p.isPopular || p.isNew).slice(0, 4);
const stats = [
  { number: "15+", label: "Years of Experience" },
  { number: "50K+", label: "Happy Customers" },
  { number: "30+", label: "Pizza Varieties" },
  { number: "4.9", label: "Average Rating" },
];

export default function Home() {
  const [selectedPizza, setSelectedPizza] = useState<any | null>(null);
  // const { addToCart } = useCart();

  return (
    <>
      {/* ═══ Hero Section ═══ */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBg}>
          <div className={styles.heroGradient} />
          <div className={styles.heroPattern} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>🔥 Fresh from the oven</span>
            <h1 className={styles.heroTitle}>
              Artisan Pizza
              <br />
              <span className={styles.heroAccent}>Crafted with Love</span>
            </h1>
            <p className={styles.heroDesc}>
              Hand-stretched dough, premium ingredients, and wood-fired
              perfection. Experience pizza the way it was meant to be — fresh,
              bold, and unforgettable.
            </p>
            <div className={styles.heroCta}>
              <Link
                href="/menu"
                className="btn btn-primary btn-lg"
                id="hero-order-now"
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
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Order Now
              </Link>
              <Link
                href="/menu"
                className="btn btn-outline btn-lg"
                id="hero-view-menu"
              >
                View Full Menu
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/pizza-pepperoni.jpg"
                alt="Delicious pepperoni pizza"
                width={500}
                height={500}
                className={styles.heroImage}
                priority
              />
              <div className={styles.heroImageGlow} />
            </div>
            {/* Floating cards */}
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <span className={styles.floatingEmoji}>⭐</span>
              <div>
                <span className={styles.floatingValue}>4.9</span>
                <span className={styles.floatingLabel}>Rating</span>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <span className={styles.floatingEmoji}>🍕</span>
              <div>
                <span className={styles.floatingValue}>30+</span>
                <span className={styles.floatingLabel}>Varieties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Featured Pizzas ═══ */}
      <section className={styles.featured} id="featured">
        <div className="container">
          <h2 className="section-title">
            Our <span className="accent-text">Best Sellers</span>
          </h2>
          <p className="section-subtitle">
            Discover our most loved pizzas, hand-picked by our loyal customers.
          </p>
          {/* <div className={styles.pizzaGrid}>
            {featuredPizzas.map((pizza, i) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onViewDetails={setSelectedPizza}
                index={i}
              />
            ))}
          </div> */}
          <div className={styles.viewAll}>
            <Link
              href="/menu"
              className="btn btn-outline btn-lg"
              id="view-all-menu"
            >
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Why Choose Us ═══ */}
      <section className={styles.whyUs} id="why-us">
        <div className="container">
          <h2 className="section-title">
            Why <span className="accent-text">PizzaCraft?</span>
          </h2>
          <p className="section-subtitle">
            We don't just make pizza — we craft experiences.
          </p>
          <div className={styles.whyGrid}>
            {[
              {
                icon: "🔥",
                title: "Wood-Fired Perfection",
                desc: "Our pizzas are baked at 900°F in a traditional wood-fired oven for that authentic charred crust and smoky flavor.",
              },
              {
                icon: "🌿",
                title: "Fresh Ingredients",
                desc: "We source locally grown produce and import premium Italian cheeses and San Marzano tomatoes for unmatched quality.",
              },
              {
                icon: "👨‍🍳",
                title: "Master Pizzaiolos",
                desc: "Our team of skilled pizzaiolos brings decades of combined experience and passion to every single pie we serve.",
              },
              {
                icon: "🚀",
                title: "Fast Delivery",
                desc: "Hot and fresh to your door in 30 minutes or less. We guarantee speed without compromising on quality.",
              },
            ].map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className={styles.cta} id="cta">
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Order?</h2>
              <p className={styles.ctaDesc}>
                Get 20% off your first order with code <strong>PIZZA20</strong>.
                Limited time offer!
              </p>
              <Link
                href="/menu"
                className="btn btn-primary btn-lg"
                id="cta-order-now"
              >
                Order Now & Save 20%
              </Link>
            </div>
            <div className={styles.ctaVisual}>
              <Image
                src="/images/pizza-margherita.jpg"
                alt="Margherita pizza"
                width={400}
                height={300}
                className={styles.ctaImage}
              />
            </div>
          </div>
        </div>
      </section>

      <PizzaModal
        pizza={selectedPizza}
        onClose={() => setSelectedPizza(null)}
      />
    </>
  );
}
