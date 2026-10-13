# 05 — Orders & Payment

> The user checks out, pays, and the order is saved to the database.
> Payment method: **Cash on delivery** to start, plus a simple **online card payment** through Stripe or Paymob.

---

## 🧾 Model: `Order`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `orderNumber` | String | ✅ | auto | unique, readable: `PZ-20260830-0042` |
| `user` | ObjectId → User | ✅ | — | indexed |
| `items` | [OrderItem] | ✅ | — | min 1, **snapshot** |
| `shippingAddress` | String | ✅ | — | 10–200 chars |
| `phone` | String | ✅ | — | contact number for this order |
| `subtotal` | Number | ✅ | — | sum of item totals |
| `deliveryFee` | Number | ✅ | `25` | fixed fee, keep it simple |
| `totalPrice` | Number | ✅ | — | `subtotal + deliveryFee` |
| `paymentMethod` | Enum | ✅ | `cash` | `cash` / `card` |
| `paymentStatus` | Enum | ✅ | `pending` | `pending` / `paid` / `failed` |
| `paidAt` | Date | ❌ | — | |
| `transactionId` | String | ❌ | — | from the payment gateway |
| `status` | Enum | ✅ | `pending` | `pending` / `preparing` / `out_for_delivery` / `delivered` / `cancelled` |
| `notes` | String | ❌ | — | max 300 |
| `createdAt` / `updatedAt` | Date | auto | — | |

**Indexes:** `orderNumber (unique)`, `user + createdAt`, `status`

### `OrderItem` (embedded — a snapshot, not just a reference)
```json
{
  "product": "665f...",
  "name": "Margherita",
  "image": "https://...",
  "size": { "name": "Large", "extraPrice": 60 },
  "quantity": 2,
  "unitPrice": 180,
  "itemTotal": 360
}
```

> **Why a snapshot?** If the admin changes the pizza's price or name tomorrow, the old order must still show exactly what the customer bought and paid.

---

## 🔄 Order status flow

```
pending ──► preparing ──► out_for_delivery ──► delivered
   │            │                 │
   └────────────┴─────────────────┴──► cancelled
```

- [ ] Going backwards is not allowed → `422 INVALID_STATUS_TRANSITION`.
- [ ] `delivered` and `cancelled` are terminal → `422 ORDER_ALREADY_FINALIZED`.

---

# 📌 User Stories — User

---

## US-05-01 — Place an order (cash on delivery)

**As a** User **I want** to buy the pizzas in my cart **so that** they get delivered to me.

**Endpoint:** `POST /api/v1/orders` — 🔒 Protected

**Body**
```json
{
  "shippingAddress": "12 Mostafa El-Nahas, Nasr City, Cairo",
  "phone": "01012345678",
  "paymentMethod": "cash",
  "notes": "Ring the bell twice"
}
```

**Validation**
| # | Condition | Error |
|---|-----------|-------|
| 1 | The user is logged in and active | `401` / `403` |
| 2 | The cart exists and is not empty | `422 CART_IS_EMPTY` |
| 3 | `shippingAddress` required, string, 10–200 chars | `400 VALIDATION_ERROR` |
| 4 | `phone` required, Egyptian regex `^01[0125][0-9]{8}$` | `400 VALIDATION_ERROR` |
| 5 | `paymentMethod` required, enum `cash` / `card` | `400 VALIDATION_ERROR` |
| 6 | `notes` optional, max 300, sanitized from HTML | `400` |
| 7 | Every product in the cart still exists and is available | `422 PRODUCT_UNAVAILABLE` with the name |
| 8 | Stock is sufficient for every item | `422 INSUFFICIENT_STOCK` |
| 9 | Prices are recalculated from the database, not taken from the cart | — |

**Acceptance criteria**
- [ ] The whole flow runs inside a **MongoDB transaction**:
  1. Recompute every price from the `products` collection.
  2. Deduct stock (`stock -= quantity`) for every item.
  3. Create the order with the full snapshot.
  4. Clear the cart.
  - If any step fails → **full rollback**, and nothing is saved.
- [ ] `orderNumber` is generated as `PZ-YYYYMMDD-XXXX` and is unique.
- [ ] `subtotal` is the sum of `itemTotal`; `totalPrice = subtotal + deliveryFee`.
- [ ] For `paymentMethod = cash`: `paymentStatus = pending`, `status = pending`, and the order is complete.
- [ ] For `paymentMethod = card`: the order is created with `paymentStatus = pending` and a `paymentUrl` is returned (see US-05-02).
- [ ] The response returns the saved order with its `orderNumber` — this is the proof it reached the database.
- [ ] A confirmation email is sent to the user (optional but nice).
- [ ] Rate limit: 10 orders per hour per user.

**Success `201`**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "_id": "665f...",
      "orderNumber": "PZ-20260830-0042",
      "items": [ { "name": "Margherita", "quantity": 2, "unitPrice": 180, "itemTotal": 360 } ],
      "subtotal": 360,
      "deliveryFee": 25,
      "totalPrice": 385,
      "paymentMethod": "cash",
      "paymentStatus": "pending",
      "status": "pending",
      "createdAt": "2026-08-30T18:22:00.000Z"
    }
  }
}
```

---

## US-05-02 — Pay online by card

**Endpoint:** `POST /api/v1/payments/checkout` — 🔒 Protected
**Body:** `{ "orderId": "665f..." }`

**Validation**
| Condition | Error |
|-----------|-------|
| `orderId` is a valid, existing ObjectId | `404 ORDER_NOT_FOUND` |
| The order belongs to the current user | `403 FORBIDDEN` |
| `paymentStatus = pending` | `422 ORDER_ALREADY_PAID` |
| The order is not `cancelled` | `422 ORDER_CANCELLED` |

**Acceptance criteria**
- [ ] The amount is taken from the **order in the database** — never from the request body.
- [ ] A checkout session is created with the gateway (Stripe Checkout / Paymob iframe).
- [ ] The response returns `paymentUrl` for the frontend to redirect to.
- [ ] The gateway keys live in `.env` and are never sent to the client.
- [ ] **No card data ever touches your server or your database.**

---

## US-05-03 — Confirm the payment (webhook)

**Endpoint:** `POST /api/v1/payments/webhook` — Public but signature-verified

**Acceptance criteria**
- [ ] The gateway signature is verified before any processing → `401 INVALID_SIGNATURE`.
- [ ] It is **idempotent**: the same `transactionId` is processed once; repeats return `200` and do nothing.
- [ ] On success: `paymentStatus = paid`, `paidAt = now`, `transactionId` is stored.
- [ ] On failure: `paymentStatus = failed`, stock is restored, and the order is cancelled.
- [ ] Always returns `200` to the gateway after logging, so it stops retrying.
- [ ] **The webhook is the only source of truth for payment** — the browser redirect is not.

---

## US-05-04 — View my orders

**Endpoint:** `GET /api/v1/orders/my-orders` — 🔒 Protected

**Query:** `page`, `limit` (max 20), `status`, `sort` (default `-createdAt`)

**Acceptance criteria**
- [ ] Returns **only the current user's** orders — seeing another user's order must be impossible.
- [ ] Each order shows `orderNumber`, `status`, `totalPrice`, `itemsCount`, and `createdAt`.
- [ ] Paginated, newest first.
- [ ] No orders → `200` with an empty array.

---

## US-05-05 — View one order

**Endpoint:** `GET /api/v1/orders/:id` — 🔒 Protected

- [ ] `:id` must be a valid ObjectId → `400 INVALID_ID`.
- [ ] If the order does not belong to the user and they are not an admin → `403 FORBIDDEN`.
- [ ] Returns the full order with all items, the address, and the payment status.
- [ ] Returns a `canCancel` flag.

---

## US-05-06 — Cancel my order

**Endpoint:** `PATCH /api/v1/orders/:id/cancel` — 🔒 Protected

**Acceptance criteria**
- [ ] Cancelling is allowed **only** while `status = pending` → otherwise `422 CANNOT_CANCEL_ORDER`.
- [ ] Stock is restored for every item (inside a transaction).
- [ ] `status = cancelled`.
- [ ] If the order was already paid by card, flag it for the admin to refund manually.

---

# 📌 User Stories — Admin

---

## US-05-07 — View all orders

**Endpoint:** `GET /api/v1/admin/orders` — 🔒 Admin

**Query:** `page`, `limit`, `status`, `paymentStatus`, `search` (order number or customer name), `from`, `to`, `sort`

- [ ] Returns every order with the customer's name and phone.
- [ ] `from`/`to` are ISO dates with `to >= from` → `400 INVALID_DATE_RANGE`.
- [ ] Returns counts per status in the response meta.

---

## US-05-08 — Change an order's status

**Endpoint:** `PATCH /api/v1/admin/orders/:id/status` — 🔒 Admin
**Body:** `{ "status": "preparing" }`

- [ ] `status` must be a valid enum value → `400 INVALID_STATUS`.
- [ ] The transition rules above must pass.
- [ ] On `delivered` with `paymentMethod = cash` → `paymentStatus = paid` and `paidAt = now`.
- [ ] On `cancelled` → stock is restored.
- [ ] The customer is notified (email is enough for a simple version).

---

## 🎨 Frontend notes

- A checkout page: address, phone, payment method, order summary, then "Confirm order".
- Disable the confirm button after the first click so the order is not created twice.
- For card payments, redirect to `paymentUrl`, then show a "Confirming payment" page that polls the order until `paymentStatus` is `paid`.
- Never display "Payment successful" until the API confirms it.
- An "My orders" page with status badges and an order details page.
