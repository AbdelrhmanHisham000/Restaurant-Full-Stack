"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";

function getImageUrl(image?: string) {
  if (!image) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200";
  }
  if (image.startsWith("http") || image.startsWith("/")) {
    return image;
  }
  return `http://127.0.0.1:5000/uploads/${image}`;
}

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    checkout,
    checkoutLoading,
    loading,
  } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={closeCart} />
      <aside className={styles.sidebar} id="cart-sidebar">
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Your Cart
          </h3>
          <button
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label="Close cart"
            id="close-cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🍕</span>
            <p className={styles.emptyText}>Your cart is empty</p>
            <p className={styles.emptySubtext}>Add some delicious pizza!</p>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => {
                const productId = String(item.pizza._id || item.pizza.id);
                return (
                  <div key={productId} className={styles.item}>
                    <div className={styles.itemImage}>
                      <Image
                        src={getImageUrl(item.pizza.image)}
                        alt={item.pizza.name}
                        width={64}
                        height={64}
                        className={styles.itemImg}
                        unoptimized
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.pizza.name}</h4>
                      <span className={styles.itemPrice}>
                        ${(Number(item.pizza.price) || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <div className={styles.quantity}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            updateQuantity(productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          disabled={loading}
                        >
                          −
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() =>
                            updateQuantity(productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(productId)}
                        aria-label="Remove item"
                        disabled={loading}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <button
                className={styles.clearBtn}
                onClick={clearCart}
                disabled={loading}
              >
                Clear Cart
              </button>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalPrice}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}
                id="checkout-button"
                onClick={checkout}
                disabled={checkoutLoading || items.length === 0}
              >
                {checkoutLoading ? "Redirecting..." : "Checkout"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
