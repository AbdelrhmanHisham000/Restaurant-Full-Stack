# 02 — User Profile

> The user views and updates their own data, changes their password, and saves a delivery address used at checkout.

---

## 🧾 Fields used (from the `User` model in file 01)

`name`, `email`, `phone`, `address`, `password`, `createdAt`

---

# 📌 User Stories

---

## US-02-01 — View my profile

**As a** User **I want** to see my data **so that** I can check it is correct.

**Endpoint:** `GET /api/v1/users/profile` — 🔒 Protected

**Acceptance criteria**
- [ ] Returns the current user only — reading someone else's profile must be impossible.
- [ ] Returns `name`, `email`, `phone`, `address`, `createdAt`, and `ordersCount`.
- [ ] Never returns `password` or `__v`.

**Success `200`**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "665f...",
      "name": "Abdelrhman Hisham",
      "email": "abood@example.com",
      "phone": "01012345678",
      "address": "12 Mostafa El-Nahas, Nasr City, Cairo",
      "ordersCount": 7,
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  }
}
```

---

## US-02-02 — Update my profile

**Endpoint:** `PATCH /api/v1/users/profile` — 🔒 Protected

**Body:** `{ "name": "...", "phone": "...", "address": "..." }`

**Validation**
| Field | Rule |
|-------|------|
| `name` | optional, string, trim, 3–50 chars |
| `phone` | optional, Egyptian regex `^01[0125][0-9]{8}$` |
| `address` | optional, string, trim, 10–200 chars |

**Acceptance criteria**
- [ ] Changing `email` here is **not allowed** (keep it simple — the email is the login identity).
- [ ] Changing `role`, `password`, or `isActive` is **not allowed** → `400 FORBIDDEN_FIELD`.
- [ ] Only whitelisted fields are picked from the body; everything else is ignored.
- [ ] An empty body → `400 NO_DATA_PROVIDED`.
- [ ] `address` is sanitized from HTML.
- [ ] Returns the updated user.

---

## US-02-03 — Change my password

**Endpoint:** `PATCH /api/v1/users/change-password` — 🔒 Protected

**Body**
```json
{
  "currentPassword": "Pizza1234",
  "newPassword": "NewPizza5678",
  "confirmNewPassword": "NewPizza5678"
}
```

**Validation**
| Field | Rule |
|-------|------|
| `currentPassword` | required |
| `newPassword` | required, same complexity rules as registration (min 8, upper + lower + digit) |
| `confirmNewPassword` | required, must equal `newPassword` |

**Acceptance criteria**
- [ ] The current password is verified with bcrypt → wrong one gives `401 INCORRECT_PASSWORD`.
- [ ] The new password must differ from the current one → `400 SAME_AS_OLD_PASSWORD`.
- [ ] The new password is hashed before saving.
- [ ] `passwordChangedAt = now` so old tokens stop working.
- [ ] A fresh token is returned so the user stays logged in on this device.

---

## US-02-04 — View my orders (shortcut)

**Endpoint:** `GET /api/v1/orders/my-orders` — 🔒 Protected

> Full details in `05-orders-payment.md`. Listed here because the profile page links to it.

- [ ] Returns the current user's orders only, newest first, paginated.

---

## US-02-05 — View my reviews (shortcut)

**Endpoint:** `GET /api/v1/reviews/my-reviews` — 🔒 Protected

> Full details in `06-reviews.md`.

- [ ] Returns the current user's reviews with the reviewed pizza's name and image.

---

## 🎨 Frontend notes

- A `Profile` page with tabs: My data / My orders / My reviews / Change password.
- Prefill the address field so checkout can reuse it.
- Show a success toast after each update, and re-fetch the profile.
