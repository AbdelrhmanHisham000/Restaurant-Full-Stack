import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("TOKEN EXISTS:", !!token);

    if (!token) {
      console.log("NO TOKEN");

      return NextResponse.json(
        {
          isLoggedIn: false,
          user: null,
          reason: "NO_TOKEN",
        },
        { status: 401 },
      );
    }

    const res = await fetch("http://127.0.0.1:5000/api/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("BACKEND STATUS:", res.status);

    const data = await res.json();

    console.log("BACKEND RESPONSE:", data);

    if (!res.ok) {
      return NextResponse.json(
        {
          isLoggedIn: false,
          user: null,
          reason: "BACKEND_REJECTED_TOKEN",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: data.data.user,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    return NextResponse.json(
      {
        isLoggedIn: false,
        user: null,
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("token");

  return NextResponse.json({
    success: true,
  });
}

/*

JWT
 ↓
HttpOnly Cookie
 ↓
Next.js Server
 ↓
Backend

*/
