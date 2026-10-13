// app/actions/auth.ts

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
type LoginState = {
  success: boolean;
  message?: string;
};

export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const res = await fetch(`http://127.0.0.1:5000/api/v1/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  console.log("API STATUS:", res.status);
  if (!res.ok) {
    return {
      success: false,
      message: "Email or password is incorrect",
    };
  }

  const data = await res.json();

  const cookieStore = await cookies();

  cookieStore.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/login");
  revalidatePath("/");

  return {
    success: true,
    message: "Login successful!",
  };
}

interface singupState {
  success: boolean;
  message: string;
}

export async function signup(
  prevState: singupState,
  formData: FormData,
): Promise<singupState> {
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const phone = formData.get("phone");

  if (password !== passwordConfirm) {
    return {
      success: false,
      message: "Passwords do not match",
    };
  }

  const res = await fetch("http://127.0.0.1:5000/api/v1/users/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      password,
      passwordConfirm,
      phone,
    }),
  });
  if (!res.ok) {
    return {
      success: false,
      message: "Please check Your data",
    };
  }

  const data = await res.json();

  const cookieStore = await cookies();

  cookieStore.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    message: "Signup successful!",
  };
  return { success: true, message: "Signup Successfull" };
}
