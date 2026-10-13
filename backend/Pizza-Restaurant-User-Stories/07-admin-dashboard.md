# 07 — Admin Dashboard

> Everything here is 🔒 **Admin only** — every route is guarded by `protect` + `restrictTo('admin')`.
> A regular user calling any of these always gets `403 FORBIDDEN`.

---

# 📌 User Stories

---

## US-07-01 — Dashboard statistics

**As an** Admin **I want** to see the key numbers **so that** I know how the restaurant is doing.

**Endpoint:** `GET /api/v1/admin/dashboard/stats` — 🔒 Admin

**Query:** `period` — enum `today` / `last_7_days` / `last_30_days` / `all` (default `last_30_days`)

**Acceptance criteria**
- [ ] Any value outside the enum → `400 INVALID_PERIOD`.
- [ ] `totalRevenue` counts **delivered** orders only — cancelled orders are excluded.
- [ ] Empty data returns zeros, not `null` and not a 404.
- [ ] Money values are rounded to 2 decimals.
- [ ] Built with MongoDB aggregation, not by looping in JavaScript.

**Success `200`**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12450.50,
    "ordersCount": 87,
    "pendingOrders": 5,
    "deliveredOrders": 74,
    "cancelledOrders": 8,
    "usersCount": 210,
    "productsCount": 24,
    "outOfStockCount": 3,
    "averageOrderValue": 143.10
  }
}
```

---

## US-07-02 — Sales chart

**Endpoint:** `GET /api/v1/admin/dashboard/sales-chart?period=last_30_days` — 🔒 Admin

**Acceptance criteria**
- [ ] Returns an array of `{ date, revenue, ordersCount }`.
- [ ] **Days with no sales are returned as zeros**, not skipped — otherwise the chart breaks.
- [ ] Dates are grouped by day in a consistent timezone.
- [ ] Sorted by date ascending.

---
Categories
   ↓
Products
   ↓
Users
   ↓
Orders
   ↓
Reviews

## US-07-03 — Best-selling pizzas

**Endpoint:** `GET /api/v1/admin/dashboard/top-products?limit=5` — 🔒 Admin

**Acceptance criteria**
- [ ] `limit` between 1 and 20, default 5.
- [ ] Aggregates over `orders.items`, summing `quantity` per product.
- [ ] Each row returns the pizza's name, image, quantity sold, and revenue.
- [ ] Sorted by quantity sold, descending.

---

## US-07-04 — Recent orders

**Endpoint:** `GET /api/v1/admin/dashboard/recent-orders?limit=10` — 🔒 Admin

- [ ] Returns the latest orders with the customer's name, total, status, and creation time.
- [ ] `limit` between 5 and 20.

---

## US-07-05 — Manage orders

> Full details in `05-orders-payment.md` (US-05-07 and US-05-08).

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/admin/orders` | List every order with filters and pagination |
| `GET /api/v1/admin/orders/:id` | Full details of any order |
| `PATCH /api/v1/admin/orders/:id/status` | Change the order status |

- [ ] An admin can see any order; a user can see only their own.

---

## US-07-06 — Manage pizzas

> Full details in `03-products.md` (US-03-04 to US-03-08).

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/admin/products` | All pizzas, including unavailable ones |
| `POST /api/v1/admin/products` | Create a pizza |
| `PATCH /api/v1/admin/products/:id` | Update a pizza |
| `DELETE /api/v1/admin/products/:id` | Delete a pizza |
| `PATCH /api/v1/admin/products/:id/stock` | Update stock |

---

## US-07-07 — Manage categories

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/admin/categories` | List categories with their product counts |
| `POST /api/v1/admin/categories` | Create a category |
| `PATCH /api/v1/admin/categories/:id` | Update a category |
| `DELETE /api/v1/admin/categories/:id` | Delete a category |

**Validation**
- `name` required, string, trim, 2–50, unique → `409 CATEGORY_ALREADY_EXISTS`.
- `image` optional, valid URL.

**Acceptance criteria**
- [ ] A category that still has products cannot be deleted → `422 CATEGORY_HAS_PRODUCTS` with the count.

---

## US-07-08 — View users

**Endpoint:** `GET /api/v1/admin/users` — 🔒 Admin

**Query:** `page`, `limit` (max 100), `search` (name or email), `role`, `isActive`, `sort`

**Acceptance criteria**
- [ ] Passwords are **never** returned — not even hashed.
- [ ] Each user shows their name, email, phone, role, order count, total spent, and join date.
- [ ] Paginated.
- [ ] `search` is regex-escaped.

---

## US-07-09 — Enable or disable a user

**Endpoint:** `PATCH /api/v1/admin/users/:id/toggle-active` — 🔒 Admin

**Acceptance criteria**
- [ ] Flips `isActive`.
- [ ] An admin **cannot disable their own account** → `422 CANNOT_DISABLE_SELF`.
- [ ] An admin **cannot disable another admin** → `403 FORBIDDEN`.
- [ ] A disabled user can no longer log in → `403 ACCOUNT_DISABLED`.
- [ ] Returns the new state.

---

## US-07-10 — Manage reviews

**Endpoint:** `GET /api/v1/admin/reviews` — 🔒 Admin

**Query:** `page`, `limit`, `rating`, `product`, `sort`

- [ ] Returns every review with the reviewer's name and the pizza's name.
- [ ] `DELETE /api/v1/reviews/:id` lets an admin remove any inappropriate review (see `06-reviews.md`).
- [ ] `ratingsAvg` is recalculated after a deletion.

---

## 🔒 Admin security rules

- [ ] Every `/admin` route runs `protect` **then** `restrictTo('admin')` — never one without the other.
- [ ] The role is read from `req.user.role` (loaded from the database), never from the request body or a query param.
- [ ] There is no endpoint that lets anyone promote themselves to admin — the first admin is created by a seed script or manually in the database.
- [ ] Admin endpoints get a stricter rate limit.
- [ ] Sensitive fields are stripped from every admin response too.

---

## 🎨 Frontend notes

- A dashboard layout with a sidebar: Overview / Orders / Pizzas / Categories / Users / Reviews.
- Stat cards at the top, a sales line chart, and a best-sellers bar chart (Recharts or Chart.js).
- Data tables with search, filters, and pagination.
- A confirmation modal before any delete.
- Status dropdowns on the orders table that call the status endpoint directly.
- Guard the whole dashboard behind `AdminRoute`, but remember the backend is what actually enforces it.
