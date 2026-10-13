"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

export default function Page() {
  const calledRef = useRef(false);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (calledRef.current || !orderId) return;
    calledRef.current = true;

    fetch("/api/orders/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Order marked as paid:", data);
      })
      .catch((err) => {
        console.error("Failed to mark order as paid:", err);
      });
  }, [orderId]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1>Payment Successful!</h1>

        <p className={styles.description}>
          Thank you for your payment. Your transaction has been completed
          successfully.
        </p>

        <div className={styles.info}>
          <span>Payment Status</span>
          <strong>Completed</strong>
        </div>

        <a href="/" className={styles.button}>
          Back to Home
        </a>
      </div>
    </main>
  );
}
