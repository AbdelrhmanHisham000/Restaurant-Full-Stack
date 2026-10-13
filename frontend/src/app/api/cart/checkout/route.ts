import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:5000/api/v1";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "Fail", message: "Not logged in" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cartId = body.cartId;

    if (!cartId) {
      return NextResponse.json(
        { status: "Fail", message: "cartId is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/orders/checkout-session/${cartId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
