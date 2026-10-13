"use client";

import React, { useEffect } from "react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import styles from "./PizzaModal.module.css";

export type Category = { _id?: string; name: string };

export type Product = {
  _id?: string;
  id?: number | string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: Category | string;
  ingredients?: string[];
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface PizzaModalProps {
  pizza: Product | null;
  onClose: () => void;
}

export default function PizzaModal({ pizza, onClose }: PizzaModalProps) {
  const { addToCart } = useCart();

  // Prevent body scrolling while modal is open
  useEffect(() => {
    if (!pizza) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [pizza]);

  // Close modal with Escape key
  useEffect(() => {
    if (!pizza) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [pizza, onClose]);

  if (!pizza) return null;

  const handleAddToCart = () => {
    if (!pizza.isAvailable) return;

    addToCart(pizza);
    onClose();
  };

  const imageSrc = pizza.image?.startsWith("http")
    ? pizza.image
    : pizza.image
      ? `http://127.0.0.1:5000/uploads/${pizza.image}`
      : "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600";

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      id="pizza-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pizza-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
          id="close-modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image */}
        <div className={styles.imageWrap}>
          <Image
            src={imageSrc}
            alt={pizza.name}
            width={600}
            height={400}
            className={styles.image}
            unoptimized
          />

          {!pizza.isAvailable && (
            <div className={styles.badges}>
              <span className="badge">Unavailable</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h2 id="pizza-modal-title" className={styles.name}>
              {pizza.name}
            </h2>
          </div>

          <span className={styles.category}>
            {typeof pizza.category === "object"
              ? pizza.category?.name
              : "Artisan Pizza"}
          </span>

          <p className={styles.description}>{pizza.description}</p>

          {/* Ingredients */}
          {pizza.ingredients && pizza.ingredients.length > 0 && (
            <div className={styles.ingredientsSection}>
              <h4 className={styles.ingredientsTitle}>Ingredients</h4>

              <div className={styles.ingredients}>
                {pizza.ingredients.map((ingredient) => (
                  <span key={ingredient} className={styles.ingredient}>
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.price}>${pizza.price.toFixed(2)}</span>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={!pizza.isAvailable}
              id="modal-add-to-cart"
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>

              {pizza.isAvailable ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
