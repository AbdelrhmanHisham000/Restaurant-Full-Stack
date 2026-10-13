# 03 — Products (Pizzas)

> The public side: browsing and viewing pizzas.
> The admin side: creating, updating, and deleting them.

---

## 🧾 Model: `Product`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | 3–100, unique |
| `description` | String | ✅ | — | 10–500 |
| `price` | Number | ✅ | — | > 0, max 2 decimals |
| `image` | String | ✅ | — | image URL |
| `category` | ObjectId → Category | ✅ | — | indexed |
| `sizes` | [Object] | ❌ | `[]` | `{ name, extraPrice }` — e.g. Small +0, Medium +30, Large +60 |
| `stock` | Number | ✅ | `0` | integer >= 0 |
| `isAvailable` | Boolean | ✅ | `true` | shown on the site or not |
| `ratingsAvg` | Number | ✅ | `0` | 0–5, computed from reviews |
| `ratingsCount` | Number | ✅ | `0` | computed |
| `createdAt` / `updatedAt` | Date | auto | — | |

**Indexes:** `name (text)`, `category`, `isAvailable`, `price`

### `Category` (small helper model)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | ✅ | 2–50, unique — e.g. Classic, Meat Lovers, Veggie |
| `image` | String | ❌ | |

---

# 📌 User Stories — Public

---

## US-03-01 — Browse all pizzas

**As a** visitor **I want** to see all pizzas **so that** I can pick one.

**Endpoint:** `GET /api/v1/products` — Public

**Query params**
| Param | Type | Default | Validation |
|-------|------|---------|-----------|
| `page` | Integer | `1` | >= 1; invalid values fall back to 1 |
| `limit` | Integer | `12` | 1–50; larger values are clamped to 50 |
| `search` | String | — | 2–100 chars, matches the name, regex-escaped |
| `category` | ObjectId | — | must be an existing category → `404 CATEGORY_NOT_FOUND` |
| `minPrice` | Number | — | >= 0 |
| `maxPrice` | Number | — | >= `minPrice` → otherwise `400 INVALID_PRICE_RANGE` |
| `sort` | String | `-createdAt` | whitelist: `price`, `-price`, `-ratingsAvg`, `-createdAt`, `name` |

**Acceptance criteria**
- [ ] Returns only pizzas where `isAvailable = true`.
- [ ] Every list response is paginated — never return everything at once.
- [ ] `sort` outside the whitelist → `400 INVALID_SORT_FIELD` with the allowed values.
- [ ] `search` shorter than 2 characters is ignored instead of erroring.
- [ ] Regex special characters in `search` are escaped.
- [ ] Unknown query params are ignored silently.
- [ ] No results → `200` with an empty array and `meta.total = 0` (not a 404).
- [ ] Uses `.lean()` and selects only the fields the card needs.

**Success `200`**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "665f...",
        "name": "Margherita",
        "price": 120,
        "image": "https://...",
        "ratingsAvg": 4.6,
        "ratingsCount": 23,
        "isAvailable": true
      }
    ]
  },
  "meta": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
}
```

---

## US-03-02 — View one pizza

**Endpoint:** `GET /api/v1/products/:id` — Public

**Acceptance criteria**
- [ ] `:id` must be a valid ObjectId → `400 INVALID_ID`.
- [ ] Not found or `isAvailable = false` → `404 PRODUCT_NOT_FOUND`.
- [ ] Returns the full pizza with its populated category and its `sizes`.
- [ ] Returns the latest 5 reviews plus `ratingsAvg` and `ratingsCount`.
- [ ] Returns 4 suggested pizzas from the same category.

---

## US-03-03 — List categories

**Endpoint:** `GET /api/v1/categories` — Public

- [ ] Returns all categories with their names and images.
- [ ] Used by the frontend to build the category filter.

---

# 📌 User Stories — Admin

---

## US-03-04 — Create a pizza

**Endpoint:** `POST /api/v1/admin/products` — 🔒 Admin

**Body**
```json
{
  "name": "Pepperoni",
  "description": "Classic pepperoni pizza with mozzarella and tomato sauce",
  "price": 150,
  "image": "https://...",
  "category": "665e...",
  "sizes": [
    { "name": "Small", "extraPrice": 0 },
    { "name": "Medium", "extraPrice": 30 },
    { "name": "Large", "extraPrice": 60 }
  ],
  "stock": 50
}
```

**Validation**
| Field | Rule |
|-------|------|
| `name` | required, string, trim, 3–100, unique → `409 PRODUCT_ALREADY_EXISTS` |
| `description` | required, string, trim, 10–500 |
| `price` | required, number, > 0, <= 10000, max 2 decimals → `400 INVALID_PRICE` |
| `image` | required, valid URL (or an uploaded file) |
| `category` | required, valid ObjectId that exists → `404 CATEGORY_NOT_FOUND` |
| `sizes` | optional array; each item needs `name` (2–20) and `extraPrice` (number >= 0) |
| `stock` | required, integer >= 0 → `400 INVALID_STOCK` |
| `isAvailable` | optional boolean, default `true` |

**Acceptance criteria**
- [ ] Only an admin can call this → `403` for anyone else.
- [ ] `ratingsAvg`, `ratingsCount`, and `soldCount` cannot be set from the body → `400 READONLY_FIELD`.
- [ ] Response `201` with the created pizza.

---

## US-03-05 — Update a pizza

**Endpoint:** `PATCH /api/v1/admin/products/:id` — 🔒 Admin

**Acceptance criteria**
- [ ] All fields optional, same validation rules as creation.
- [ ] Not found → `404 PRODUCT_NOT_FOUND`.
- [ ] Renaming to an existing name → `409 PRODUCT_ALREADY_EXISTS`.
- [ ] An empty body → `400 NO_DATA_PROVIDED`.
- [ ] Rating fields can never be edited manually.
- [ ] A price change does **not** affect past orders — orders store a price snapshot (see file 05).
- [ ] Returns the updated pizza.

---

## US-03-06 — Delete a pizza

**Endpoint:** `DELETE /api/v1/admin/products/:id` — 🔒 Admin

**Acceptance criteria**
- [ ] Not found → `404 PRODUCT_NOT_FOUND`.
- [ ] Prefer a soft delete (`isAvailable = false`) so old orders and reviews stay intact.
- [ ] If a hard delete is used, it must be rejected when the pizza appears in any order → `422 PRODUCT_USED_IN_ORDERS`.
- [ ] The pizza is removed from every active cart.
- [ ] Returns `200` with a confirmation message.

---

## US-03-07 — Update stock

**Endpoint:** `PATCH /api/v1/admin/products/:id/stock` — 🔒 Admin
**Body:** `{ "stock": 30 }`

- [ ] `stock` required, integer >= 0 → `400 INVALID_STOCK`.
- [ ] Reaching 0 sets `isAvailable = false` automatically.
- [ ] Setting stock above 0 on an unavailable pizza makes it available again.

---

## US-03-08 — Admin product list

**Endpoint:** `GET /api/v1/admin/products` — 🔒 Admin

**Query:** `page`, `limit`, `search`, `category`, `isAvailable`, `sort`

- [ ] Returns **all** pizzas, including unavailable ones.
- [ ] Each row shows: image, name, category, price, stock, availability, rating.
- [ ] Paginated with `limit` max 100.

---

## 🎨 Frontend notes

- A menu page with a grid of pizza cards, a category filter, a search box, and a price sort dropdown.
- Debounce the search input by 400 ms.
- Keep filters in the URL query string so links are shareable.
- A product details page with the size selector and an "Add to cart" button.
- Skeleton loaders while fetching.
