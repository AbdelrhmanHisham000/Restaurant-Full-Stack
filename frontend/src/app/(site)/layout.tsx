import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PizzaCraft – Handcrafted Artisan Pizzas",
  description:
    "Discover handcrafted artisan pizzas made with the freshest ingredients. Order online from PizzaCraft and enjoy wood-fired perfection delivered to your door.",
};

export default function layout({ children }: LayoutProps<"/">) {
  return (
    <ClientLayout>
      {children}

      <Toaster position="top-right" />
    </ClientLayout>
  );
}
