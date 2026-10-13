"use client";

import { useState, type FormEvent } from "react";

import s from "./category.module.css";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";

export type Category = {
  _id: string;
  name: string;
  image?: string;
};

type Form = {
  _id?: string;
  name: string;
};

type CategoriesClientProps = {
  categories: Category[];
};

const emptyForm: Form = {
  name: "",
};

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const [items, setItems] = useState<Category[]>(categories);

  const [error, setError] = useState("");

  const [form, setForm] = useState<Form | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  // =========================
  // Add / Update
  // =========================

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form) return;

    const name = form.name.trim();

    if (!name) {
      setError("Category name is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      if (form._id) {
        // =========================
        // UPDATE
        // =========================

        const result = await updateCategory(form._id, name);

        if (!result.success) {
          setError(result.message);
          return;
        }

        setItems((current) =>
          current.map((category) =>
            category._id === form._id
              ? {
                  ...category,
                  name,
                }
              : category,
          ),
        );
      } else {
        // =========================
        // CREATE
        // =========================

        const result = await createCategory(name);

        if (!result.success) {
          setError(result.message);
          return;
        }

        /*
         * هنا بنضيف الـ category الجديدة للـ UI.
         *
         * لو الـ backend بيرجع الـ category
         * داخل result.data، هنستخدمها.
         */

        const createdCategory = result.data?.data ?? result.data;

        if (createdCategory?._id) {
          setItems((current) => [...current, createdCategory]);
        } else {
          /*
           * لو الـ API مش بيرجع الـ created category،
           * هنطلب refresh للصفحة.
           */
          window.location.reload();
          return;
        }
      }

      setForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const remove = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    setError("");
    setDeleting(id);

    try {
      const result = await deleteCategory(id);

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Remove مباشرة من الـ UI
      setItems((current) => current.filter((category) => category._id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setDeleting(null);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Categories</h1>

          <p>Manage your product categories.</p>
        </div>

        <button
          className={s.btn}
          onClick={() => {
            setError("");
            setForm({ ...emptyForm });
          }}
        >
          Add category
        </button>
      </div>

      {/* Error */}

      {error && <p className={s.error}>{error}</p>}

      {/* =========================
          Table
      ========================= */}

      <div className={s.tableWrap}>
        {items.length === 0 ? (
          <p className={s.state}>No categories yet. Add your first one.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>

                  <td>
                    <div className={s.actions}>
                      {/* Edit */}

                      <button
                        className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}
                        onClick={() => {
                          setError("");

                          setForm({
                            _id: category._id,
                            name: category.name,
                          });
                        }}
                      >
                        Edit
                      </button>

                      {/* Delete */}

                      <button
                        className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                        disabled={deleting === category._id}
                        onClick={() => remove(category._id)}
                      >
                        {deleting === category._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          Modal
      ========================= */}

      {form && (
        <div
          className={s.overlay}
          onClick={() => {
            if (!saving) {
              setForm(null);
            }
          }}
        >
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>
              {form._id ? "Edit category" : "Add category"}
            </h2>

            <form className={s.form} onSubmit={save}>
              <label className={s.field}>
                Name
                <input
                  className={s.input}
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={form.name}
                  disabled={saving}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                    });
                  }}
                />
              </label>

              <div className={s.formActions}>
                <button
                  type="button"
                  className={`${s.btn} ${s.btnGhost}`}
                  disabled={saving}
                  onClick={() => setForm(null)}
                >
                  Cancel
                </button>

                <button type="submit" className={s.btn} disabled={saving}>
                  {saving
                    ? "Saving..."
                    : form._id
                      ? "Update category"
                      : "Save category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
