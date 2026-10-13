# 🍕 Pizza Restaurant — User Stories (Simple Scope)

> A simple pizza website: users browse pizzas, add to cart, pay, and the order lands in the database.
> Admins get a dashboard. Users get a profile and can review pizzas.
> **Backend first (Node.js / Express / MongoDB), then the frontend against the same contracts.**

---

## 📁 Files

| # | File | Topic |
|---|------|-------|
| 00 | `00-README.md` | Overview, conventions, data model, build order |
| 01 | `01-authentication.md` | Register, login, JWT, roles, protection middlewares |
| 02 | `02-profile.md` | View and update profile, change password, delivery address |
| 03 | `03-products.md` | Pizza listing and details (public) + admin CRUD |
| 04 | `04-cart.md` | Add / update / remove / view cart |
| 05 | `05-orders-payment.md` | Checkout, payment, saving the order to the database |
| 06 | `06-reviews.md` | Users review pizzas |
| 07 | `07-admin-dashboard.md` | Admin dashboard: stats, orders, products, users |

---

## 👥 Actors

| Actor | What they can do |
|-------|------------------|
| **Guest** | Browse pizzas and read reviews |
| **User** | Everything a guest can do + cart, checkout, orders, reviews, profile |
| **Admin** | Dashboard: manage pizzas, view/update all orders, view users, see stats |

---

## 🧱 Data Model

```
User ──< Order ──< OrderItem
User ──1 Cart ──< CartItem
User ──< Review >── Product
Category ──< Product
Order ──1 Payment
```

**Collections:** `users`, `categories`, `products`, `carts`, `orders`, `reviews`

---

## 📐 API Conventions

**Base URL:** `/api/v1`

**Success**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { },
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Email must be a valid email address" }
  ]
}
```

**Status codes**
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / bad input |
| 401 | Not logged in, or invalid/expired token |
| 403 | Logged in but not allowed (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 422 | Business rule broken (empty cart, out of stock) |
| 429 | Too many requests |
| 500 | Server error |

**Headers**
- `Authorization: Bearer <accessToken>`

---

## 🔒 Global rules (apply to every endpoint)

- [ ] Passwords are hashed with bcrypt (12 rounds) — never stored or returned in plain text.
- [ ] A validation layer (Joi or express-validator) runs **before** every controller.
- [ ] Every `:id` param must be a valid Mongo ObjectId → `400 INVALID_ID`.
- [ ] All strings are trimmed, and free text is sanitized from HTML (XSS protection).
- [ ] All prices are calculated on the **server**, never trusted from the client.
- [ ] `password`, `__v`, and any token field are never returned in a response.
- [ ] All errors go through one `AppError` class + one `globalErrorHandler`.
- [ ] Every list endpoint is paginated — never return an unbounded `find()`.
- [ ] Secrets live in `.env`, never hardcoded.
- [ ] `helmet`, `cors` (whitelist), `express-mongo-sanitize`, and rate limiting are enabled.

---

## ✅ Definition of Done for any story

1. The endpoint works and is tested in Postman.
2. Validation runs before the controller.
3. Auth + role middleware applied where needed.
4. Errors use the standard shape.
5. No sensitive field leaks into the response.
6. Indexes exist on fields used for filtering and sorting.

---

## 🗂️ Build order

```
01 → 02 → 03 → 04 → 05 → 06 → 07
```

Build and test each file completely in Postman before moving to the next one.
