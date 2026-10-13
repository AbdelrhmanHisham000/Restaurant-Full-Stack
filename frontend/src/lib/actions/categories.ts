"use server";

import { cookies } from "next/headers";

const API_URL = "http://127.0.0.1:5000/api/v1/categories";

async function getToken() {
  const cookieStore = await cookies();

  return cookieStore.get("token")?.value;
}

export async function createCategory(name: string) {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(`${API_URL}/create`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to create category",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("TOKEN:", token);

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(
      `http://127.0.0.1:5000/api/v1/categories/update/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    console.log("BACKEND RESPONSE:", data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to update category",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
export async function deleteCategory(id: string) {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message ?? "Failed to delete category",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
