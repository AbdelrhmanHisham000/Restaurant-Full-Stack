"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoggedIn, loading, logout } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      {" "}
      <div className={`container ${styles.inner}`}>
        {" "}
        {/* Logo */}{" "}
        <Link href="/" className={styles.logo}>
          {" "}
          <span className={styles.logoIcon}>🍕</span>{" "}
          <span className={styles.logoText}>
            {" "}
            Pizza<span className={styles.logoBold}>Craft</span>{" "}
          </span>{" "}
        </Link>{" "}
        {/* Desktop Links */}{" "}
        <ul className={styles.links}>
          {" "}
          {navLinks.map((link) => (
            <li key={link.href}>
              {" "}
              <Link
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
              >
                {" "}
                {link.label}{" "}
              </Link>{" "}
            </li>
          ))}{" "}
          <li key={"/dashboard"}>
            <Link href={"/dashboard"}>Dashboard</Link>
          </li>
        </ul>{" "}
        {/* Right Side */}{" "}
        <div className={styles.actions}>
          {" "}
          {/* Authentication */}{" "}
          {!loading && (
            <>
              {" "}
              {isLoggedIn ? (
                <div className={styles.userArea}>
                  {" "}
                  {/* User */}{" "}
                  <Link href="/profile" className={styles.userButton}>
                    {" "}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <path d="M20 21a8 8 0 0 0-16 0" />{" "}
                      <circle cx="12" cy="7" r="4" />{" "}
                    </svg>{" "}
                    <span className={styles.userName}> {user?.name} </span>{" "}
                  </Link>{" "}
                  {/* Logout */}{" "}
                  <button
                    type="button"
                    onClick={logout}
                    className={styles.logoutBtn}
                  >
                    {" "}
                    Logout{" "}
                  </button>{" "}
                </div>
              ) : (
                <>
                  {" "}
                  <Link
                    href="/login"
                    className={`btn btn-outline btn-sm ${styles.loginBtn}`}
                  >
                    {" "}
                    Sign In{" "}
                  </Link>{" "}
                  <Link
                    href="/signup"
                    className={`btn btn-primary btn-sm ${styles.signupBtn}`}
                  >
                    {" "}
                    Sign Up{" "}
                  </Link>{" "}
                </>
              )}{" "}
            </>
          )}{" "}
          {/* Cart */}{" "}
          <button
            className={styles.cartBtn}
            onClick={toggleCart}
            aria-label="Open cart"
            id="cart-button"
          >
            {" "}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <circle cx="9" cy="21" r="1" /> <circle cx="20" cy="21" r="1" />{" "}
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />{" "}
            </svg>{" "}
            {totalItems > 0 && (
              <span className={styles.cartBadge}> {totalItems} </span>
            )}{" "}
          </button>{" "}
          {/* Mobile Hamburger */}{" "}
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-button"
          >
            {" "}
            <span /> <span /> <span />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Mobile Menu */}{" "}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {" "}
          <ul className={styles.mobileLinks}>
            {" "}
            {navLinks.map((link) => (
              <li key={link.href}>
                {" "}
                <Link
                  href={link.href}
                  className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ""}`}
                >
                  {" "}
                  {link.label}{" "}
                </Link>{" "}
              </li>
            ))}{" "}
            {/* Mobile Authentication */}{" "}
            {!loading && (
              <>
                {" "}
                {isLoggedIn ? (
                  <>
                    {" "}
                    <li>
                      {" "}
                      <Link href="/profile" className={styles.mobileLink}>
                        {" "}
                        <span className={styles.mobileUser}>
                          {" "}
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {" "}
                            <path d="M20 21a8 8 0 0 0-16 0" />{" "}
                            <circle cx="12" cy="7" r="4" />{" "}
                          </svg>{" "}
                          <span>{user?.name}</span>{" "}
                        </span>{" "}
                      </Link>{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      <button
                        type="button"
                        onClick={logout}
                        className={styles.mobileLogout}
                      >
                        {" "}
                        Logout{" "}
                      </button>{" "}
                    </li>{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <li>
                      {" "}
                      <Link href="/login" className={styles.mobileLink}>
                        {" "}
                        Sign In{" "}
                      </Link>{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      <Link href="/signup" className={styles.mobileLink}>
                        {" "}
                        Sign Up{" "}
                      </Link>{" "}
                    </li>{" "}
                  </>
                )}{" "}
              </>
            )}{" "}
          </ul>{" "}
        </div>
      )}{" "}
    </nav>
  );
}
