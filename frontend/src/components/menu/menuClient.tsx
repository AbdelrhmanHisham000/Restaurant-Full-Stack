"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import PizzaCard, { type Product } from "@/components/PizzaCard/PizzaCard";

import PizzaModal from "@/components/PizzaModal/PizzaModal";

import styles from "./menu.module.css";

type Category = {
  _id: string;
  name: string;
};

type MenuClientProps = {
  products: Product[];
  categories: Category[];
  limit: number;
};

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "name", label: "Name: A → Z" },
  { value: "-name", label: "Name: Z → A" },
];

export default function MenuClient({
  products,
  categories,
  limit,
}: MenuClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // القيم الحالية من الـ URL
  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "";
  const onlyAvailable = searchParams.get("isAvailable") === "true";
  const currentPage = Number(searchParams.get("page")) || 1;

  // inputs محلية
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || "",
  );

  // تحديث الـ URL (بيرجع الصفحة لـ 1 مع أي فلتر جديد)
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    if (!("page" in updates)) params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Debounce للبحث (ينتظر 500ms بعد آخر حرف)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      updateParams({ keyword: keyword.trim() || null });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const applyPrice = () => {
    updateParams({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const hasActiveFilters =
    activeCategory ||
    activeSort ||
    onlyAvailable ||
    searchParams.get("keyword") ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice");

  const resetFilters = () => {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");

    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasNextPage = products.length >= limit;

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Our Menu</h1>

          <p className={styles.heroSubtitle}>
            Explore our full range of handcrafted artisan pizzas
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className={`container ${styles.filters}`}>
        {/* Search */}
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search pizzas..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        {/* Categories */}
        <div className={styles.categories}>
          <button
            type="button"
            className={`${styles.chip} ${!activeCategory ? styles.chipActive : ""}`}
            onClick={() => updateParams({ category: null })}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`${styles.chip} ${activeCategory === cat._id ? styles.chipActive : ""
                }`}
              onClick={() => updateParams({ category: cat._id })}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Other filters */}
        <div className={styles.filterRow}>
          <select
            className={styles.select}
            value={activeSort}
            onChange={(e) => updateParams({ sort: e.target.value || null })}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className={styles.priceGroup}>
            <input
              type="number"
              min={0}
              className={styles.priceInput}
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            />

            <span>—</span>

            <input
              type="number"
              min={0}
              className={styles.priceInput}
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            />

            <button
              type="button"
              className={styles.applyBtn}
              onClick={applyPrice}
            >
              Apply
            </button>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) =>
                updateParams({ isAvailable: e.target.checked ? "true" : null })
              }
            />
            Available only
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section
        className={`container ${styles.results} ${isPending ? styles.loading : ""}`}
      >
        <p className={styles.resultCount}>
          Showing <strong>{products.length}</strong>{" "}
          {products.length === 1 ? "pizza" : "pizzas"}
        </p>

        {products.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>😔</span>

            <h3>No pizzas found</h3>

            <p>Try changing or resetting your filters</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product, index) => (
              <PizzaCard
                key={product._id}
                pizza={product}
                onViewDetails={setSelectedProduct}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {(currentPage > 1 || hasNextPage) && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => updateParams({ page: String(currentPage - 1) })}
            >
              ← Previous
            </button>

            <span className={styles.pageNumber}>Page {currentPage}</span>

            <button
              type="button"
              className={styles.pageBtn}
              disabled={!hasNextPage}
              onClick={() => updateParams({ page: String(currentPage + 1) })}
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {/* Product Modal */}
      <PizzaModal
        pizza={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}