"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:5000/api/v1";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function getAllProducts() {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to get products",
        data: [],
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return {
      success: false,
      message: "Something went wrong",
      data: [],
    };
  }
}

export async function createProduct(formData: FormData) {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(`${API_URL}/products/create`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to create product",
      };
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/menu");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(`${API_URL}/products/update/${id}`, {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const data = await parseResponse(response);
    revalidatePath("/dashboard/products");
    revalidatePath("/menu");

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to update product",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(`${API_URL}/products/delete/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to delete product",
      };
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/menu");

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
