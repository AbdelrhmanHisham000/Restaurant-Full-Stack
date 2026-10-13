import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:5000/api/v1";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

// GET /api/orders — fetch all orders (admin)
export async function GET() {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { status: "Fail", message: "Not logged in" },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/orders`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { status: "Error", message: error.message },
      { status: 500 }
    );
  }
}
