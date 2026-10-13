"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

type OrderItem = {
  product?: {
    _id?: string;
    name?: string;
    price?: number;
    image?: string;
  } | string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const FILTER_OPTIONS = ["all", ...STATUS_OPTIONS];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/orders", { cache: "no-store" });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || `Failed to fetch orders (Status: ${res.status})`
        );
      }

      const json = await res.json();
      const data: Order[] = Array.isArray(json.data) ? json.data : [];
      setOrders(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update order status");
      }

      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update status";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const getItemsSummary = (items: OrderItem[]) => {
    return items
      .map((item) => {
        const name =
          item.product && typeof item.product === "object"
            ? item.product.name || "Item"
            : "Item";
        return `${item.quantity}x ${name}`;
      })
      .join(", ");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className={styles.ordersPage}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ADMIN PANEL</p>
          <h1>Orders</h1>
          <p className={styles.subtitle}>Manage and track all customer orders</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={fetchOrders}
          disabled={loading}
          type="button"
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={fetchOrders} className={styles.retryBtn}>
            Try Again
          </button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${
              filter === f ? styles.filterBtnActive : ""
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className={styles.orderCount}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Orders Table */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No orders found</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusClass =
                    styles[order.status.toLowerCase()] || styles.pending;

                  return (
                    <tr key={order._id}>
                      <td>
                        <span className={styles.orderId} title={order._id}>
                          #{order._id.slice(-6)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.customerName}>
                          {order.user?.name || "Customer"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.items} title={getItemsSummary(order.items)}>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span className={styles.amount}>
                          ${order.totalPrice.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={styles.paymentMethod}>
                          {order.paymentMethod || "cash"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.address}
                          title={order.deliveryAddress}
                        >
                          {order.deliveryAddress || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.date}>
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <select
                          className={styles.statusSelect}
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          disabled={updatingId === order._id}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
