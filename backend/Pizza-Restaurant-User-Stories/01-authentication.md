# 01 — Authentication & Authorization

> Register, login, JWT tokens, roles, and the middlewares that protect everything else.

---

## 🧾 Model: `User`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | 3–50 chars |
| `email` | String | ✅ | — | unique, lowercase, trimmed, indexed |
| `phone` | String | ✅ | — | Egyptian format |
| `password` | String | ✅ | — | hashed with bcrypt, `select: false` |
| `role` | Enum | ✅ | `user` | `user` / `admin` |
| `address` | String | ❌ | — | delivery address, max 200 |
| `isActive` | Boolean | ✅ | `true` | admin can disable an account |
| `passwordChangedAt` | Date | ❌ | — | invalidates older tokens |
| `createdAt` / `updatedAt` | Date | auto | — | timestamps |

**Indexes:** `email (unique)`, `role`

---

## 🔐 Validation rules

| Field | Rule |
|-------|------|
| `name` | required, string, trim, min 3, max 50, letters and spaces only |
| `email` | required, valid email, lowercase, max 100, unique |
| `phone` | required, Egyptian regex `^01[0125][0-9]{8}$` |
| `password` | required, min 8, max 64, must contain an uppercase letter, a lowercase letter, and a digit |
| `confirmPassword` | required, must equal `password` |
| `role` | **never accepted from the request body** |

**Suggested password regex**
```
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$
```

---

# 📌 User Stories

---

## US-01-01 — Register a new account

**As a** Guest **I want** to create an account **so that** I can order pizza.

**Endpoint:** `POST /api/v1/auth/register` — Public

**Body**
```json
{
  "name": "Abdelrhman Hisham",
  "email": "abood@example.com",
  "phone": "01012345678",
  "password": "Pizza1234",
  "confirmPassword": "Pizza1234"
}
```

**Acceptance criteria**
- [ ] All validation rules above are applied; all errors are returned at once.
- [ ] The password is hashed with bcrypt (12 rounds) before saving — never plain text.
- [ ] `role` is forced to `user` even if the body tries to send `admin`.
- [ ] Duplicate email → `409 EMAIL_ALREADY_EXISTS`.
- [ ] The response returns the user **without** the password.
- [ ] On success a JWT token is returned and the user is logged in immediately.
- [ ] Rate limit: 5 registrations per hour per IP.

**Success `201`**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "_id": "665f...", "name": "Abdelrhman Hisham", "email": "abood@example.com", "role": "user" },
    "token": "eyJ..."
  }
}
```

**Errors**
| Status | errorCode | When |
|--------|-----------|------|
| 400 | `VALIDATION_ERROR` | Missing or invalid data |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |

---

## US-01-02 — Login

**As a** registered user **I want** to log in **so that** I can access my cart and orders.

**Endpoint:** `POST /api/v1/auth/login` — Public

**Body:** `{ "email": "abood@example.com", "password": "Pizza1234" }`

**Validation:** `email` required and valid; `password` required (complexity is not re-checked here).

**Acceptance criteria**
- [ ] The password is compared with bcrypt against the stored hash.
- [ ] Wrong email or wrong password → `401 INVALID_CREDENTIALS` with the **same generic message** ("Invalid email or password") — never reveal which one was wrong.
- [ ] `isActive = false` → `403 ACCOUNT_DISABLED`.
- [ ] On success a JWT is returned, valid for **7 days**, signed with `JWT_SECRET`.
- [ ] The token payload holds `{ id, role }` only — never the email or the password.
- [ ] The response returns the user without the password.
- [ ] Rate limit: 5 attempts per 15 minutes per IP.

**Success `200`**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { "_id": "665f...", "name": "Abdelrhman Hisham", "role": "user" },
    "token": "eyJ..."
  }
}
```

---

## US-01-03 — Get the current user

**Endpoint:** `GET /api/v1/auth/me` — 🔒 Protected

**Acceptance criteria**
- [ ] Returns the logged-in user read from the database (not from the token), so the data is fresh.
- [ ] If the user was deleted or disabled after the token was issued → `401`.
- [ ] The password is never returned.

---

## US-01-04 — Logout

**Endpoint:** `POST /api/v1/auth/logout` — 🔒 Protected

**Acceptance criteria**
- [ ] Returns `200` and the frontend deletes the stored token.
- [ ] (Optional, simple version) Just a success response — the token expires on its own.

---

## US-01-05 — The `protect` middleware

**Acceptance criteria**
- [ ] Reads the token from the `Authorization: Bearer <token>` header.
- [ ] No token → `401 NOT_AUTHENTICATED`.
- [ ] Malformed or tampered token → `401 INVALID_TOKEN`.
- [ ] Expired token → `401 TOKEN_EXPIRED`.
- [ ] The user in the token still exists → otherwise `401 USER_NO_LONGER_EXISTS`.
- [ ] The user is still active → otherwise `403 ACCOUNT_DISABLED`.
- [ ] If `passwordChangedAt` is newer than the token's `iat` → `401 PASSWORD_CHANGED`.
- [ ] Sets `req.user` so controllers can use it.

---

## US-01-06 — The `restrictTo` middleware (authorization)

**Usage:** `router.post('/', protect, restrictTo('admin'), createProduct)`

**Acceptance criteria**
- [ ] Runs **after** `protect` and reads `req.user.role`.
- [ ] If the role is not in the allowed list → `403 FORBIDDEN` ("You do not have permission to perform this action").
- [ ] Every `/admin` route is guarded by `protect` + `restrictTo('admin')`.
- [ ] A regular user calling any admin endpoint always gets `403` — never a partial result.

---

## 🔑 Permissions matrix

| Action | Guest | User | Admin |
|--------|:-----:|:----:|:-----:|
| Browse pizzas | ✅ | ✅ | ✅ |
| Read reviews | ✅ | ✅ | ✅ |
| Cart and checkout | ❌ | ✅ | ✅ |
| Write a review | ❌ | ✅ | ✅ |
| View own orders | ❌ | ✅ | ✅ |
| Create / edit / delete a pizza | ❌ | ❌ | ✅ |
| View all orders | ❌ | ❌ | ✅ |
| Change an order status | ❌ | ❌ | ✅ |
| View users and stats | ❌ | ❌ | ✅ |

---

## 🎨 Frontend notes

- Store the token in `localStorage` and attach it to every request via an Axios interceptor.
- On `401`, clear the token and redirect to the login page.
- Route guards: `ProtectedRoute` (logged in) and `AdminRoute` (role is `admin`).
- Pages: `Register`, `Login`.
- Hiding admin buttons on the frontend is UX only — the backend must still enforce every rule.
