/* =========================================================
   Types
========================================================= */

export interface ApiCartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    isAvailable?: boolean;
  };
  quantity: number;
}

export interface ApiCart {
  _id: string;
  user: string;
  items: ApiCartItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export interface CheckoutResponse {
  status: string;
  checkoutUrl: string;
}

/* =========================================================
   Helper
========================================================= */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

/* =========================================================
   Cart API Methods (calling internal Next.js /api/cart)
========================================================= */

export async function getCart(): Promise<ApiCart> {
  const response = await apiRequest<ApiResponse<ApiCart>>("/api/cart", {
    method: "GET",
  });
  return response.data;
}

export async function addItemToCart(
  productId: string,
  quantity: number = 1
): Promise<ApiCart> {
  const response = await apiRequest<ApiResponse<ApiCart>>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({
      product: productId,
      quantity,
    }),
  });
  return response.data;
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<ApiCart> {
  const response = await apiRequest<ApiResponse<ApiCart>>(
    `/api/cart/${productId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        quantity,
      }),
    }
  );
  return response.data;
}

export async function removeCartItem(productId: string): Promise<ApiCart> {
  const response = await apiRequest<ApiResponse<ApiCart>>(
    `/api/cart/${productId}`,
    {
      method: "DELETE",
    }
  );
  return response.data;
}

export async function clearCart(): Promise<ApiCart> {
  const response = await apiRequest<ApiResponse<ApiCart>>("/api/cart", {
    method: "DELETE",
  });
  return response.data;
}

export async function createCheckoutSession(
  cartId: string
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>("/api/cart/checkout", {
    method: "POST",
    body: JSON.stringify({ cartId }),
  });
}
