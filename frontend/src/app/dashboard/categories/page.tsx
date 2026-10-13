import CtegoriesClient from "@/components/dashboard/categories/CategoryClient";
import { getAllCategories } from "@/lib/api";

export default async function Page() {
  const categories = await getAllCategories();
  return (
    <div>
      <CtegoriesClient categories={categories} />
    </div>
  );
}
