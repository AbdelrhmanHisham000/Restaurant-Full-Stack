"use client";

import React from "react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";

import styles from "./PizzaCard.module.css";

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  ingredients: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

interface PizzaCardProps {
  pizza: Product;
  onViewDetails: (pizza: Product) => void;
  index?: number;
}

export default function PizzaCard({
  pizza,
  onViewDetails,
  index = 0,
}: PizzaCardProps) {
  const { addToCart } = useCart();

  return (
    <div
      className={`card ${styles.card}`}
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        <Image
          src={
            pizza.image?.startsWith("http") || pizza.image?.startsWith("/")
              ? pizza.image
              : pizza.image
                ? `http://127.0.0.1:5000/uploads/${pizza.image}`
                : "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
          }
          alt={pizza.name}
          width={400}
          height={300}
          className={styles.image}
          unoptimized
        />

        {/* Availability */}
        {!pizza.isAvailable && (
          <div className={styles.badges}>
            <span className="badge">Unavailable</span>
          </div>
        )}

        {/* Overlay */}
        <div className={styles.overlay}>
          <button
            className={`btn btn-primary btn-sm ${styles.viewBtn}`}
            onClick={() => onViewDetails(pizza)}
            id={`view-pizza-${pizza._id}`}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{pizza.name}</h3>
        </div>

        <p className={styles.desc}>{pizza.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>${pizza.price.toFixed(2)}</span>

          <button
            className={`btn btn-primary btn-sm ${styles.addBtn}`}
            onClick={() => addToCart(pizza)}
            disabled={!pizza.isAvailable}
            id={`add-to-cart-${pizza._id}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            {pizza.isAvailable ? "Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
