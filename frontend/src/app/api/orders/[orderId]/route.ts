import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:5000/api/v1";

// PATCH /api/orders/[orderId] — update order status (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { status: "Fail", message: "Not logged in" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
