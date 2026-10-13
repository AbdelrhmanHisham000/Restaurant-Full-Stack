import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:5000/api/v1";

// POST /api/orders/mark-paid
// Called by /payment/success after Stripe redirects with ?orderId=xxx
// Marks that specific order as "paid" and clears the cart.
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
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { status: "Fail", message: "orderId is required" },
        { status: 400 }
      );
    }

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Mark the specific order as "paid"
    const updateRes = await fetch(
      `${BACKEND_URL}/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "paid" }),
        cache: "no-store",
      }
    );

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
      return NextResponse.json(updateData, { status: updateRes.status });
    }

    // 2. Clear the cart
    await fetch(`${BACKEND_URL}/cart`, {
      method: "DELETE",
      headers: authHeaders,
      cache: "no-store",
    });

    return NextResponse.json({
      status: "Success",
      message: "Order marked as paid",
      data: updateData.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "Error", message: error.message },
      { status: 500 }
    );
  }
}
