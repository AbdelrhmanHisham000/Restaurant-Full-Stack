import MenuClient from "@/components/menu/menuClient";
import {
  getAllProducts,
  getAllCategories,
  type ProductFilters,
} from "@/lib/api"; // عدّل المسار حسب مكان ملف الـ API عندك

type MenuPageProps = {
  searchParams: Promise<ProductFilters>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const filters = await searchParams;

  const [products, categories] = await Promise.all([
    getAllProducts(filters),
    getAllCategories(),
  ]);

  console.log(products)

  return (
    <MenuClient
      products={products}
      categories={categories}
      limit={Number(filters.limit) || 9}
    />
  );
}
