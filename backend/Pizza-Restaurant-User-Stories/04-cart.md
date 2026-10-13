# 04 — Shopping Cart

> A logged-in user adds pizzas to a cart, changes quantities, and removes items.
> One cart per user, stored in the database.

---

## 🧾 Model: `Cart`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `user` | ObjectId → User | ✅ | — | unique — one cart per user |
| `items` | [CartItem] | ✅ | `[]` | |
| `totalPrice` | Number | ✅ | `0` | computed by the server |
| `createdAt` / `updatedAt` | Date | auto | — | |

### `CartItem` (embedded)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | the key used to update or delete |
| `product` | ObjectId → Product | ✅ | |
| `size` | Object | ❌ | `{ name, extraPrice }` snapshot |
| `quantity` | Number | ✅ | integer 1–10 |
| `unitPrice` | Number | ✅ | `product.price + size.extraPrice` — computed by the server |
| `itemTotal` | Number | ✅ | `unitPrice × quantity` |

**Index:** `user (unique)`

---

## 🔑 Golden rule

> **The price is always computed on the server.**
> If the client sends a `price`, it is ignored completely. Read the price from the `products` collection every time.

---

# 📌 User Stories

---

## US-04-01 — Add a pizza to the cart

**As a** User **I want** to add a pizza to my cart **so that** I can buy it.

**Endpoint:** `POST /api/v1/cart/items` — 🔒 Protected

**Body**
```json
{
  "productId": "665f...",
  "size": "Large",
  "quantity": 2
}
```

**Validation**
| Field | Rule |
|-------|------|
| `productId` | required, valid ObjectId, product exists → `404 PRODUCT_NOT_FOUND` |
| — | the product must be `isAvailable = true` → `422 PRODUCT_UNAVAILABLE` |
| — | `stock >= quantity` → `422 INSUFFICIENT_STOCK` with the available quantity |
| `size` | required when the product has `sizes`; must be one of them → `422 INVALID_SIZE` |
| `quantity` | required, integer, 1–10 → `400 INVALID_QUANTITY` |
| `price` | **ignored if sent** — always read from the database |

**Acceptance criteria**
- [ ] If the user has no cart yet, one is created automatically.
- [ ] Guests cannot use the cart → `401 NOT_AUTHENTICATED`.
- [ ] Adding the same product with the **same size** increases the quantity instead of duplicating the item.
- [ ] Adding the same product with a **different size** creates a separate item.
- [ ] Maximum 20 items per cart → `422 CART_LIMIT_REACHED`.
- [ ] `unitPrice = product.price + size.extraPrice`, computed on the server.
- [ ] `totalPrice` is recomputed from scratch after every change.
- [ ] Response `201` with the full cart.

---

## US-04-02 — View my cart

**Endpoint:** `GET /api/v1/cart` — 🔒 Protected

**Acceptance criteria**
- [ ] Returns the current user's cart only.
- [ ] Populates each item's product with `name`, `image`, `price`, and `isAvailable`.
- [ ] **Revalidation on every read:**
  - A deleted or unavailable product is removed from the cart, and a message is added to `warnings[]`.
  - A changed product price updates the item, with a `PRICE_CHANGED` warning.
  - A quantity above the available stock is clamped down, with a warning.
- [ ] `totalPrice` is recomputed and saved.
- [ ] An empty cart → `200` with `items: []` and `totalPrice: 0` (not a 404).

**Success `200`**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "_id": "aaa...",
          "product": { "_id": "665f...", "name": "Margherita", "image": "https://..." },
          "size": { "name": "Large", "extraPrice": 60 },
          "quantity": 2,
          "unitPrice": 180,
          "itemTotal": 360
        }
      ],
      "itemsCount": 1,
      "totalPrice": 360,
      "warnings": []
    }
  }
}
```

---

## US-04-03 — Update an item's quantity

**Endpoint:** `PATCH /api/v1/cart/items/:itemId` — 🔒 Protected
**Body:** `{ "quantity": 3 }`

**Acceptance criteria**
- [ ] `itemId` must exist in the **current user's** cart → `404 ITEM_NOT_FOUND`.
- [ ] Touching another user's cart must be impossible.
- [ ] `quantity` required, integer, 1–10 → `400 INVALID_QUANTITY`.
- [ ] `quantity = 0` removes the item.
- [ ] Stock is checked before increasing → `422 INSUFFICIENT_STOCK`.
- [ ] `itemTotal` and `totalPrice` are recomputed.
- [ ] Returns the updated cart.

---

## US-04-04 — Remove an item

**Endpoint:** `DELETE /api/v1/cart/items/:itemId` — 🔒 Protected

- [ ] `itemId` must belong to the current user's cart → `404 ITEM_NOT_FOUND`.
- [ ] `totalPrice` is recomputed.
- [ ] Returns the updated cart.

---

## US-04-05 — Clear the cart

**Endpoint:** `DELETE /api/v1/cart` — 🔒 Protected

- [ ] Removes all items and resets `totalPrice` to 0.
- [ ] Idempotent — an already-empty cart still returns `200`.
- [ ] Also called automatically after a successful order (see file 05).

---

## US-04-06 — Cart counter

**Endpoint:** `GET /api/v1/cart/count` — 🔒 Protected

**Response:** `{ "itemsCount": 3, "totalPrice": 540 }`

- [ ] Lightweight, no populate — used for the navbar badge.

---

## 🎨 Frontend notes

- A cart icon in the navbar with a badge from `/cart/count`.
- A cart page listing items with + / - controls and a remove button.
- Use optimistic UI for quantity changes, and roll back if the request fails.
- Show `warnings` as clear toasts, especially `PRICE_CHANGED` and `PRODUCT_UNAVAILABLE`.
- Display the total returned by the API — never a total computed in the browser.
- Show a "Proceed to checkout" button that is disabled while the cart is empty.
