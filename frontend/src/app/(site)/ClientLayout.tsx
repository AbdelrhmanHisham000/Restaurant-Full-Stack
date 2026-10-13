"use client";

import React, { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import Footer from "@/components/Footer/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <CartSidebar />

          {children}

          <Footer />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
