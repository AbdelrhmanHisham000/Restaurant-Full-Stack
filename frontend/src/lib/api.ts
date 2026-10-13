import { cookies } from "next/headers";

const BASE_URL = "http://127.0.0.1:5000/api/v1";

export type Category = {
  _id: string;
  name: string;
};

export type ProductFilters = {
  keyword?: string;
  category?: string;
  isAvailable?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
};

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAllProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();

  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.category) params.set("category", filters.category);
  if (filters.isAvailable === "true") params.set("isAvailable", "true");
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.minPrice) params.set("price[gte]", filters.minPrice);
  if (filters.maxPrice) params.set("price[lte]", filters.maxPrice);

  params.set("page", filters.page || "1");
  params.set("limit", filters.limit || "9");

  const response = await fetch(`${BASE_URL}/products?${params.toString()}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  const data = await response.json();

  return data.data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  const data = await response.json();

  return data.data ?? [];
}

export type BackendDashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrder: number;
};

export type BackendOrderStatusStat = {
  _id: string;
  count: number;
};

export async function getDashboardStats(): Promise<BackendDashboardStats> {
  const response = await fetch(`${BASE_URL}/dashboard/dashboard-stats`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getDashboardOrderStatusStats(): Promise<BackendOrderStatusStat[]> {
  const response = await fetch(`${BASE_URL}/dashboard/dashboard-orderStatus-stats`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order status stats: ${response.status}`);
  }

  const data = await response.json();
  return data.data ?? [];
}

