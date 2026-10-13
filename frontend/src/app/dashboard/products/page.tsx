import ProductsClient from "@/components/dashboard/products/ProductsClient";
import { getAllCategories, getAllProducts } from "@/lib/api";

export default async function Page() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);
  return (
    <div>
      <ProductsClient products={products} categories={categories} />
    </div>
  );
}
