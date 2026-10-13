"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import s from "./page.module.css";

type Role = "user" | "admin";
type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};
type Form = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
  passwordConfirm: string;
};

// عدّلها لو شكل الـ response عندك مختلف

const empty: Form = {
  name: "",
  email: "",
  phone: "",
  role: "user",
  password: "",
  passwordConfirm: "",
};

export default function UsersPage() {
  // const [items, setItems] = useState<User[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const [form, setForm] = useState<Form | null>(null);

  return (
    <>
      <div className={s.head}>
        <h1 className={s.title}>Users</h1>
        <button className={s.btn} onClick={() => setForm(empty)}>
          Add user
        </button>
      </div>
      {/* {error && <p className={s.error}>{error}</p>} */}
      <div className={s.tableWrap}>
        {/* {loading ? (
          <p className={s.state}>Loading...</p>
        ) : items.length === 0 ? (
          <p className={s.state}>No users yet.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span
                      className={`${s.badge} ${u.role === "admin" ? s.badgeOk : ""}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button
                        className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}
                        onClick={() =>
                          setForm({
                            ...empty,
                            _id: u._id,
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            role: u.role,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className={`${s.btn} ${s.btnDanger} ${s.btnSm}`}
                        onClick={() => remove(u._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )} */}
      </div>

      {form && (
        <div className={s.overlay} onClick={() => setForm(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>
              {form._id ? "Edit user" : "Add user"}
            </h2>
            <form className={s.form}>
              <label className={s.field}>
                Name
                <input className={s.input} required value={form.name} />
              </label>
              <label className={s.field}>
                Email
                <input
                  className={s.input}
                  type="email"
                  required
                  value={form.email}
                />
              </label>
              <label className={s.field}>
                Phone (Egyptian number)
                <input
                  className={s.input}
                  required
                  pattern="01[0125][0-9]{8}"
                  title="e.g. 01012345678"
                  value={form.phone}
                />
              </label>
              <label className={s.field}>
                Role
                <select className={s.input} value={form.role}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              {!form._id && (
                <>
                  <label className={s.field}>
                    Password
                    <input
                      className={s.input}
                      type="password"
                      required
                      minLength={8}
                      value={form.password}
                    />
                  </label>
                  <label className={s.field}>
                    Confirm password
                    <input
                      className={s.input}
                      type="password"
                      required
                      minLength={8}
                      value={form.passwordConfirm}
                    />
                  </label>
                </>
              )}
              <div className={s.formActions}>
                <button
                  type="button"
                  className={`${s.btn} ${s.btnGhost}`}
                  onClick={() => setForm(null)}
                >
                  Cancel
                </button>
                <button className={s.btn}>Save user</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
