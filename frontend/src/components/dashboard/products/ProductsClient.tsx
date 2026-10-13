"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import s from "./products.module.css";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/products";

type Category = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string | Category;
  ingredients: string[];
  isAvailable: boolean;
};

type Form = {
  _id?: string;
  name: string;
  description: string;
  price: string;
  imageFile: File | null;
  existingImage: string;
  category: string;
  ingredients: string;
  isAvailable: boolean;
};

type Props = {
  products: Product[];
  categories: Category[];
};

const empty: Form = {
  name: "",
  description: "",
  price: "0",
  imageFile: null,
  existingImage: "",
  category: "",
  ingredients: "",
  isAvailable: true,
};

export default function ProductsClient({ products, categories }: Props) {
  const [items, setItems] = useState<Product[]>(products);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(products);
  }, [products]);

  const catId = (category: Product["category"]) => {
    return typeof category === "object" ? category?._id : (category ?? "");
  };

  const catName = (category: Product["category"]) => {
    if (typeof category === "object") {
      return category?.name ?? "-";
    }

    return (
      categories.find((categoryItem) => categoryItem._id === category)?.name ??
      "-"
    );
  };

  const openAdd = () => {
    setError("");
    setForm({ ...empty });
  };

  const openEdit = (product: Product) => {
    setError("");

    setForm({
      _id: product._id,
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? 0),
      imageFile: null,
      existingImage: product.image ?? "",
      category: catId(product.category),
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : "",
      isAvailable: product.isAvailable ?? true,
    });
  };

  const set =
    (key: keyof Form) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((current) =>
        current
          ? {
              ...current,
              [key]: event.target.value,
            }
          : current,
      );
    };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form) return;

    setError("");
    setLoading(true);

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", String(Number(form.price)));
    formData.append("category", form.category);

    const ingredients = form.ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    formData.append("ingredients", JSON.stringify(ingredients));

    formData.append("isAvailable", String(form.isAvailable));

    // Add image only if a new file was selected
    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    try {
      const result = form._id
        ? await updateProduct(form._id, formData)
        : await createProduct(formData);

      if (!result.success) {
        setError(
          result.message ??
            (form._id
              ? "Failed to update product"
              : "Failed to create product"),
        );
        return;
      }

      setForm(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const result = await deleteProduct(id);

      if (!result.success) {
        setError(result.message ?? "Failed to delete product");
        return;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `http://127.0.0.1:5000/uploads/${image}`;
  };

  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Products</h1>
        </div>

        <button
          type="button"
          className={s.btn}
          onClick={openAdd}
          disabled={loading}
        >
          Add product
        </button>
      </div>

      {error && <p className={s.error}>{error}</p>}

      <div className={s.tableWrap}>
        {loading && items.length === 0 ? (
          <p className={s.state}>Loading...</p>
        ) : items.length === 0 ? (
          <p className={s.state}>No products yet. Add your first one.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image ? (
                      <img
                        className={s.thumb}
                        src={getImageSrc(product.image)}
                        alt={product.name}
                      />
                    ) : (
                      <div className={s.thumb} />
                    )}
                  </td>

                  <td>{product.name}</td>

                  <td>{catName(product.category)}</td>

                  <td>{product.price}</td>

                  <td>
                    <span
                      className={`${s.badge} ${
                        product.isAvailable ? s.badgeOk : s.badgeOff
                      }`}
                    >
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td>
                    <div className={s.actions}>
                      <button
                        type="button"
                        className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}
                        onClick={() => openEdit(product)}
                        disabled={loading}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                        onClick={() => remove(product._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form && (
        <div className={s.overlay} onClick={() => setForm(null)}>
          <div className={s.modal} onClick={(event) => event.stopPropagation()}>
            <h2 className={s.modalTitle}>
              {form._id ? "Edit product" : "Add product"}
            </h2>

            <form className={s.form} onSubmit={save}>
              <label className={s.field}>
                Name
                <input
                  className={s.input}
                  required
                  value={form.name}
                  onChange={set("name")}
                />
              </label>

              <label className={s.field}>
                Description
                <textarea
                  className={s.input}
                  required
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                />
              </label>

              <label className={s.field}>
                Price
                <input
                  className={s.input}
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.price}
                  onChange={set("price")}
                />
              </label>

              <label className={s.field}>
                Product Image
                {form.existingImage && !form.imageFile && (
                  <img
                    src={getImageSrc(form.existingImage)}
                    alt="Current"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                )}
                <input
                  className={s.input}
                  type="file"
                  accept="image/*"
                  required={!form._id}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;

                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            imageFile: file,
                          }
                        : current,
                    );
                  }}
                />
              </label>

              <label className={s.field}>
                Category
                <select
                  className={s.input}
                  required
                  value={form.category}
                  onChange={set("category")}
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={s.field}>
                Ingredients (comma separated)
                <input
                  className={s.input}
                  value={form.ingredients}
                  onChange={set("ingredients")}
                  placeholder="Tomato, Cheese, Onion"
                />
              </label>

              <label className={`${s.field} ${s.check}`}>
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            isAvailable: event.target.checked,
                          }
                        : current,
                    )
                  }
                />
                Available for sale
              </label>

              <div className={s.formActions}>
                <button
                  type="button"
                  className={`${s.btn} ${s.btnGhost}`}
                  onClick={() => setForm(null)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button type="submit" className={s.btn} disabled={loading}>
                  {loading
                    ? "Saving..."
                    : form._id
                      ? "Update product"
                      : "Save product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
