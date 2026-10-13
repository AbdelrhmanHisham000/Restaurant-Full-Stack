"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrder: number;
};

type OrderStatus = {
  status: string;
  count: number;
};

type Product = {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
};

type RecentOrder = {
  _id: string;
  customer: string;
  amount: number;
  status: string;
  createdAt?: string;
};

type DashboardData = {
  stats: DashboardStats;
  ordersByStatus: OrderStatus[];
  topProducts: Product[];
  recentOrders: RecentOrder[];
};

const initialData: DashboardData = {
  stats: {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrder: 0,
  },
  ordersByStatus: [],
  topProducts: [],
  recentOrders: [],
};

export default function Page() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Call our Next.js API route that securely forwards to both backend APIs:
      // 1. http://127.0.0.1:5000/api/v1/dashboard/dashboard-stats
      // 2. http://127.0.0.1:5000/api/v1/dashboard/dashboard-orderStatus-stats
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch dashboard (Status: ${response.status})`
        );
      }

      const resJson = await response.json();
      if (resJson.data) {
        setData({
          stats: resJson.data.stats || initialData.stats,
          ordersByStatus: resJson.data.ordersByStatus || [],
          topProducts: resJson.data.topProducts || [],
          recentOrders: resJson.data.recentOrders || [],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Dashboard fetch error:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch dashboard (Status: ${response.status})`
          );
        }

        const resJson = await response.json();
        if (isMounted && resJson.data) {
          setData({
            stats: resJson.data.stats || initialData.stats,
            ordersByStatus: resJson.data.ordersByStatus || [],
            topProducts: resJson.data.topProducts || [],
            recentOrders: resJson.data.recentOrders || [],
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalOrdersCount =
    data.stats.totalOrders ||
    data.ordersByStatus.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>ADMIN PANEL</p>
          <h1>Dashboard</h1>
          <p className={styles.subtitle}>Overview of your store performance</p>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={fetchDashboard}
          disabled={loading}
          type="button"
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button
            onClick={fetchDashboard}
            className={styles.linkBtn}
            style={{ color: "#991b1b" }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <section className={styles.statsGrid}>
        {/* Total Users */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>👤</div>
          <div className={styles.statContent}>
            <p className={styles.statTitle}>Total Users</p>
            <h2 className={styles.statValue}>
              {data.stats.totalUsers.toLocaleString()}
            </h2>
            <span className={styles.positive}>Active Accounts</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>🛒</div>
          <div className={styles.statContent}>
            <p className={styles.statTitle}>Total Orders</p>
            <h2 className={styles.statValue}>
              {data.stats.totalOrders.toLocaleString()}
            </h2>
            <span className={styles.positive}>All-time Orders</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>$</div>
          <div className={styles.statContent}>
            <p className={styles.statTitle}>Total Revenue</p>
            <h2 className={styles.statValue}>
              ${data.stats.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </h2>
            <span className={styles.positive}>Store Earnings</span>
          </div>
        </div>

        {/* Average Order */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>↗</div>
          <div className={styles.statContent}>
            <p className={styles.statTitle}>Average Order</p>
            <h2 className={styles.statValue}>
              ${data.stats.averageOrder.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </h2>
            <span className={styles.positive}>Per Order Average</span>
          </div>
        </div>
      </section>

      {/* Middle Section: Revenue Overview & Orders Status */}
      <section className={styles.contentGrid}>
        {/* Revenue Overview Mock Chart */}
        <div className={`${styles.card} ${styles.revenueCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Revenue Overview</h3>
              <p>Monthly revenue performance</p>
            </div>

            <select defaultValue="6">
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
              <option value="year">This year</option>
            </select>
          </div>

          <div className={styles.fakeChart}>
            <div className={styles.chartLine}>
              <span style={{ height: "35%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "42%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "85%" }} />
            </div>

            <div className={styles.chartLabels}>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>
        </div>

        {/* Orders Status Distribution */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Orders Status</h3>
              <p>Current order distribution</p>
            </div>
          </div>

          <div className={styles.statusList}>
            {data.ordersByStatus.length === 0 ? (
              <div className={styles.empty}>
                {loading ? "Loading order statuses..." : "No order status data available"}
              </div>
            ) : (
              data.ordersByStatus.map((item) => {
                const normalizedStatus = item.status.toLowerCase();
                const percentage =
                  totalOrdersCount > 0
                    ? Math.round((item.count / totalOrdersCount) * 100)
                    : 0;

                const barColorClass =
                  styles[`bar_${normalizedStatus}`] || styles.bar_default;

                return (
                  <div className={styles.statusItem} key={item.status}>
                    <div className={styles.statusInfo}>
                      <span style={{ textTransform: "capitalize" }}>
                        {item.status}
                      </span>
                      <div className={styles.statusMeta}>
                        <strong>{item.count}</strong>
                        <span className={styles.statusPercent}>({percentage}%)</span>
                      </div>
                    </div>

                    <div className={styles.progress}>
                      <div
                        className={`${styles.progressBar} ${barColorClass}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Tables: Top Products & Recent Orders */}
      <section className={styles.tablesGrid}>
        {/* Top Products */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Top Products</h3>
              <p>Best selling products</p>
            </div>

            <button className={styles.linkBtn}>View all →</button>
          </div>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>
                {data.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.empty}>
                      {loading ? "Loading..." : "No products yet"}
                    </td>
                  </tr>
                ) : (
                  data.topProducts.map((product) => (
                    <tr key={product._id}>
                      <td className={styles.productName}>{product.name}</td>
                      <td>{product.sales}</td>
                      <td className={styles.productRevenue}>
                        ${product.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Recent Orders</h3>
              <p>Latest customer orders</p>
            </div>

            <button className={styles.linkBtn}>View all →</button>
          </div>

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.empty}>
                      {loading ? "Loading..." : "No orders yet"}
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => {
                    const statusClass =
                      styles[order.status.toLowerCase()] || styles.pending;

                    return (
                      <tr key={order._id}>
                        <td title={order._id}>
                          #{order._id.slice(-6)}
                        </td>
                        <td>{order.customer}</td>
                        <td>${order.amount.toLocaleString()}</td>
                        <td>
                          <span className={`${styles.badge} ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
