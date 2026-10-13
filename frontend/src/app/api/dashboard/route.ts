import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:5000/api/v1";

type BackendOrderItem = {
  product?: {
    _id?: string;
    name?: string;
  } | string;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  _id: string;
  user?: {
    name?: string;
  };
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  items?: BackendOrderItem[];
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          status: "Fail",
          message: "You are not logged in. Please log in as admin to access the dashboard.",
        },
        { status: 401 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Concurrently fetch stats, order status stats, and orders from backend
    const [statsRes, orderStatusRes, ordersRes] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/dashboard/dashboard-stats`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${BACKEND_URL}/dashboard/dashboard-orderStatus-stats`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${BACKEND_URL}/orders`, {
        headers,
        cache: "no-store",
      }),
    ]);

    let stats = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrder: 0,
    };

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const statsJson = await statsRes.value.json();
      if (statsJson?.data) {
        stats = {
          totalUsers: statsJson.data.totalUsers ?? 0,
          totalOrders: statsJson.data.totalOrders ?? 0,
          totalRevenue: statsJson.data.totalRevenue ?? 0,
          averageOrder: statsJson.data.averageOrder ?? 0,
        };
      }
    } else if (statsRes.status === "fulfilled" && !statsRes.value.ok) {
      const errData = await statsRes.value.json().catch(() => null);
      if (statsRes.value.status === 401 || statsRes.value.status === 403) {
        return NextResponse.json(
          {
            status: "Fail",
            message: errData?.message || "Admin authorization required.",
          },
          { status: statsRes.value.status }
        );
      }
    }

    let ordersByStatus: Array<{ status: string; count: number }> = [];
    if (orderStatusRes.status === "fulfilled" && orderStatusRes.value.ok) {
      const orderStatusJson = await orderStatusRes.value.json();
      if (Array.isArray(orderStatusJson?.data)) {
        ordersByStatus = orderStatusJson.data.map(
          (item: { _id?: string; count?: number }) => ({
            status: item._id || "unknown",
            count: item.count || 0,
          })
        );
      }
    }

    let recentOrders: Array<{
      _id: string;
      customer: string;
      amount: number;
      status: string;
      createdAt?: string;
    }> = [];

    const topProductsMap: Record<
      string,
      { _id: string; name: string; sales: number; revenue: number }
    > = {};

    if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
      const ordersJson = await ordersRes.value.json();
      const allOrders: BackendOrder[] = Array.isArray(ordersJson?.data)
        ? ordersJson.data
        : [];

      // Extract recent orders (up to 5 most recent)
      recentOrders = allOrders.slice(0, 5).map((order) => ({
        _id: order._id,
        customer: order.user?.name || "Customer",
        amount: order.totalPrice || 0,
        status: order.status || "pending",
        createdAt: order.createdAt,
      }));

      // Calculate top products if items are populated
      allOrders.forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const prod = item.product;
            if (prod && typeof prod === "object") {
              const pId = prod._id || String(prod);
              const pName = prod.name || "Unknown Product";
              const qty = item.quantity || 1;
              const rev = (item.price || 0) * qty;

              if (!topProductsMap[pId]) {
                topProductsMap[pId] = {
                  _id: pId,
                  name: pName,
                  sales: 0,
                  revenue: 0,
                };
              }
              topProductsMap[pId].sales += qty;
              topProductsMap[pId].revenue += rev;
            }
          });
        }
      });
    }

    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      status: "Success",
      data: {
        stats,
        ordersByStatus,
        recentOrders,
        topProducts,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch dashboard data";
    return NextResponse.json(
      {
        status: "Error",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
