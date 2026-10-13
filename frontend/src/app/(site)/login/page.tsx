"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";

import styles from "./page.module.css";
import { login } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const initialState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [state, formAction, pending] = useActionState(login, initialState);

  // Show toast when Server Action returns a message
  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      toast.success(state.message);
      // Re-fetch auth state so navbar updates immediately
      refreshAuth().then(() => {
        router.push("/");
      });
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className={styles.page}>
      {/* Toast */}

      <div className={styles.split}>
        {/* Left - Branding */}
        <Branding />

        {/* Right - Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Sign In</h1>

              <p className={styles.formSubtitle}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className={styles.formLink}>
                  Sign Up
                </Link>
              </p>
            </div>

            <form action={formAction} className={styles.form} id="login-form">
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>

                <input
                  className="form-input"
                  type="email"
                  defaultValue={"abdelrhman.hisham10@example.com"}
                  name="email"
                  id="login-email"
                  placeholder="you@example.com"
                  required
                  disabled={pending}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <div className={styles.passwordHeader}>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>

                  <Link href="/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </Link>
                </div>

                <div className={styles.passwordWrap}>
                  <input
                    className={`form-input ${styles.passwordInput}`}
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    name="password"
                    defaultValue={"password123"}
                    placeholder="Enter your password"
                    required
                    disabled={pending}
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={pending}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                id="login-submit"
                disabled={pending}
              >
                {pending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Social Login */}
            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <SocialLogin />
          </div>
        </div>
      </div>
    </div>
  );
}

function Branding() {
  return (
    <div className={styles.branding}>
      <div className={styles.brandOverlay} />

      <div className={styles.brandContent}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍕</span>

          <span className={styles.logoText}>
            Pizza<span className={styles.logoBold}>Craft</span>
          </span>
        </Link>

        <h2 className={styles.brandTitle}>Welcome Back!</h2>

        <p className={styles.brandDesc}>
          Sign in to access your saved orders, track deliveries, and earn
          rewards with every purchase.
        </p>

        <div className={styles.brandFeatures}>
          <div className={styles.feature}>
            <span>🎯</span>
            Track your orders in real-time
          </div>

          <div className={styles.feature}>
            <span>⭐</span>
            Earn loyalty rewards points
          </div>

          <div className={styles.feature}>
            <span>💫</span>
            Save your favorite pizzas
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLogin() {
  return (
    <div className={styles.socialButtons}>
      {/* Google */}
      <button className={styles.socialBtn} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />

          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />

          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />

          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </button>

      {/* GitHub */}
      <button className={styles.socialBtn} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
        GitHub
      </button>
    </div>
  );
}
