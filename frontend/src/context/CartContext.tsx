"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addItemToCart,
  updateCartItem as updateCartItemApi,
  removeCartItem,
  clearCart as clearCartApi,
  createCheckoutSession,
  ApiCart,
} from "@/lib/cartApi";

/* =========================================================
   Types
========================================================= */

export interface Pizza {
  _id?: string;
  id?: number | string;
  name: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
}

export interface CartItem {
  pizza: Pizza;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  cartId: string | null;
  isOpen: boolean;
  loading: boolean;
  checkoutLoading: boolean;
  addToCart: (pizza: Pizza, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "pizza_guest_cart";

function getGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save guest cart", e);
  }
}

function clearGuestCartStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (e) {
    console.error("Failed to clear guest cart storage", e);
  }
}

/* =========================================================
   Provider
========================================================= */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const prevIsLoggedIn = useRef<boolean | null>(null);

  /* =======================================================
     Normalize Backend Cart -> Frontend Cart
  ======================================================= */
  const normalizeCart = useCallback((cart: ApiCart | null) => {
    if (!cart || !cart.items) {
      setCartId(null);
      setItems([]);
      return;
    }

    setCartId(cart._id || null);

    const normalizedItems: CartItem[] = (cart.items || [])
      .filter((item: any) => item && item.product)
      .map((item: any) => {
        const prod = item.product;
        return {
          pizza: {
            _id: prod._id,
            id: prod._id,
            name: prod.name,
            price: prod.price,
            image: prod.image,
            isAvailable: prod.isAvailable ?? true,
          },
          quantity: item.quantity,
        };
      });

    setItems(normalizedItems);
  }, []);

  /* =======================================================
     Refresh / Sync Cart
  ======================================================= */
  const refreshCart = useCallback(async () => {
    if (authLoading) return;

    if (!isLoggedIn) {
      // Load guest cart
      const guestItems = getGuestCart();
      setItems(guestItems);
      setCartId(null);
      return;
    }

    try {
      setLoading(true);
      const cart = await getCart();
      normalizeCart(cart);
    } catch (error) {
      console.warn("Could not fetch cart from server:", error);
      // Fallback: don't wipe items abruptly
    } finally {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, normalizeCart]);

  // Sync guest cart to backend upon login
  useEffect(() => {
    if (authLoading) return;

    const syncGuestItems = async () => {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        try {
          for (const item of guestItems) {
            const prodId = String(item.pizza._id || item.pizza.id);
            if (prodId) {
              await addItemToCart(prodId, item.quantity);
            }
          }
          clearGuestCartStorage();
        } catch (e) {
          console.error("Failed to sync guest cart on login:", e);
        }
      }
      await refreshCart();
    };

    if (isLoggedIn) {
      if (prevIsLoggedIn.current === false) {
        // Just logged in
        syncGuestItems();
      } else {
        refreshCart();
      }
    } else {
      // User is logged out
      const guest = getGuestCart();
      setItems(guest);
      setCartId(null);
    }

    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, authLoading, refreshCart]);

  /* =======================================================
     Add To Cart
  ======================================================= */
  const addToCart = useCallback(
    async (pizza: Pizza, quantity: number = 1) => {
      const productId = String(pizza._id || pizza.id);
      if (!productId) {
        toast.error("Invalid product");
        return;
      }

      if (isLoggedIn) {
        try {
          setLoading(true);
          const cart = await addItemToCart(productId, quantity);
          normalizeCart(cart);
          setIsOpen(true);
          toast.success(`${pizza.name} added to cart!`);
        } catch (error: any) {
          console.error("Failed to add to backend cart:", error);
          toast.error(error.message || "Failed to add to cart");
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode
        setItems((prev) => {
          const index = prev.findIndex(
            (item) => String(item.pizza._id || item.pizza.id) === productId
          );
          let newItems: CartItem[];
          if (index > -1) {
            newItems = [...prev];
            newItems[index] = {
              ...newItems[index],
              quantity: newItems[index].quantity + quantity,
            };
          } else {
            newItems = [
              ...prev,
              {
                pizza: {
                  _id: productId,
                  id: productId,
                  name: pizza.name,
                  price: pizza.price,
                  image: pizza.image,
                  isAvailable: pizza.isAvailable ?? true,
                },
                quantity,
              },
            ];
          }
          setGuestCart(newItems);
          return newItems;
        });

        setIsOpen(true);
        toast.success(`${pizza.name} added to cart!`);
      }
    },
    [isLoggedIn, normalizeCart]
  );

  /* =======================================================
     Update Quantity
  ======================================================= */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!productId) return;

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isLoggedIn) {
        try {
          setLoading(true);
          const cart = await updateCartItemApi(productId, quantity);
          normalizeCart(cart);
        } catch (error: any) {
          console.error("Failed to update cart quantity:", error);
          toast.error(error.message || "Failed to update quantity");
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode
        setItems((prev) => {
          const newItems = prev.map((item) => {
            if (String(item.pizza._id || item.pizza.id) === productId) {
              return { ...item, quantity };
            }
            return item;
          });
          setGuestCart(newItems);
          return newItems;
        });
      }
    },
    [isLoggedIn, normalizeCart]
  );

  /* =======================================================
     Remove From Cart
  ======================================================= */
  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!productId) return;

      if (isLoggedIn) {
        try {
          setLoading(true);
          const cart = await removeCartItem(productId);
          normalizeCart(cart);
          toast.success("Item removed from cart");
        } catch (error: any) {
          console.error("Failed to remove item:", error);
          toast.error(error.message || "Failed to remove item");
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode
        setItems((prev) => {
          const newItems = prev.filter(
            (item) => String(item.pizza._id || item.pizza.id) !== productId
          );
          setGuestCart(newItems);
          return newItems;
        });
        toast.success("Item removed from cart");
      }
    },
    [isLoggedIn, normalizeCart]
  );

  /* =======================================================
     Clear Cart
  ======================================================= */
  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        setLoading(true);
        const cart = await clearCartApi();
        normalizeCart(cart);
        toast.success("Cart cleared");
      } catch (error: any) {
        console.error("Failed to clear cart:", error);
        toast.error(error.message || "Failed to clear cart");
      } finally {
        setLoading(false);
      }
    } else {
      // Guest mode
      setItems([]);
      clearGuestCartStorage();
      toast.success("Cart cleared");
    }
  }, [isLoggedIn, normalizeCart]);

  /* =======================================================
     Checkout
  ======================================================= */
  const checkout = useCallback(async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to complete your checkout");
      closeCart();
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!cartId) {
      toast.error("Cart not found, please try refreshing");
      return;
    }

    try {
      setCheckoutLoading(true);
      const res = await createCheckoutSession(cartId);

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.success("Order placed successfully!");
        await refreshCart();
        closeCart();
      }
    } catch (error: any) {
      console.error("Checkout failed:", error);
      toast.error(error.message || "Checkout failed, please try again");
    } finally {
      setCheckoutLoading(false);
    }
  }, [isLoggedIn, items.length, cartId, refreshCart, router]);

  /* =======================================================
     UI controls
  ======================================================= */
  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  /* =======================================================
     Calculations
  ======================================================= */
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = Number(item.pizza?.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartId,
        isOpen,
        loading,
        checkoutLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   Hook
========================================================= */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
