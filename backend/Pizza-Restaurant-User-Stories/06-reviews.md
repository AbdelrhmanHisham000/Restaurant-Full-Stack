# 06 — Reviews & Ratings

> A logged-in user leaves a rating and a comment on a pizza.
> Reviews are public; each user gets one review per pizza.

---

## 🧾 Model: `Review`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `user` | ObjectId → User | ✅ | — | indexed |
| `product` | ObjectId → Product | ✅ | — | indexed |
| `rating` | Number | ✅ | — | integer 1–5 |
| `comment` | String | ❌ | — | 5–500 chars |
| `createdAt` / `updatedAt` | Date | auto | — | |

**Unique compound index:** `{ user: 1, product: 1 }` — one review per user per pizza.
**Index:** `{ product: 1, createdAt: -1 }`

---

# 📌 User Stories

---

## US-06-01 — Write a review

**As a** User **I want** to review a pizza **so that** others know if it is good.

**Endpoint:** `POST /api/v1/products/:productId/reviews` — 🔒 Protected

**Body**
```json
{
  "rating": 5,
  "comment": "Great pizza, arrived hot and fresh"
}
```

**Validation**
| Field | Rule |
|-------|------|
| `productId` | valid ObjectId, product exists → `404 PRODUCT_NOT_FOUND` |
| `rating` | required, **integer**, between 1 and 5 → `400 INVALID_RATING` (rejects 0, 6, and 4.5) |
| `comment` | optional, string, trim, 5–500 chars, sanitized from HTML |

**Acceptance criteria**
- [ ] Guests cannot review → `401 NOT_AUTHENTICATED`.
- [ ] A user can review the same pizza only once → `409 ALREADY_REVIEWED` (enforced by the unique index, not only by an application check).
- [ ] `user` is taken from `req.user`, **never** from the request body — otherwise a user could review as someone else.
- [ ] After saving, the product's `ratingsAvg` and `ratingsCount` are recalculated (see the aggregation below).
- [ ] `ratingsAvg` is rounded to one decimal place.
- [ ] Rate limit: 10 reviews per day per user.
- [ ] Response `201` with the created review.

**Success `201`**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "review": {
      "_id": "665f...",
      "rating": 5,
      "comment": "Great pizza, arrived hot and fresh",
      "user": { "_id": "665e...", "name": "Abdelrhman H." },
      "createdAt": "2026-08-30T18:40:00.000Z"
    }
  }
}
```

---

## US-06-02 — Read a pizza's reviews

**Endpoint:** `GET /api/v1/products/:productId/reviews` — Public

**Query:** `page`, `limit` (max 20), `rating` (filter by star count), `sort` (default `-createdAt`)

**Acceptance criteria**
- [ ] Publicly readable — no login required.
- [ ] Each review shows the reviewer's **name and nothing else** — never the email, phone, or password.
- [ ] Paginated.
- [ ] Returns a rating summary:
```json
{
  "summary": {
    "average": 4.6,
    "total": 23,
    "distribution": { "5": 15, "4": 5, "3": 2, "2": 1, "1": 0 }
  }
}
```
- [ ] No reviews → `200` with an empty array and a zeroed summary.

---

## US-06-03 — Update my review

**Endpoint:** `PATCH /api/v1/reviews/:id` — 🔒 Protected

**Body:** `{ "rating": 4, "comment": "..." }`

**Acceptance criteria**
- [ ] A user can update **only their own** review → `403 NOT_YOUR_REVIEW`.
- [ ] Ownership is checked against `review.user` vs `req.user._id` — never trust an id from the body.
- [ ] Same validation rules as creating, but all fields are optional.
- [ ] An empty body → `400 NO_DATA_PROVIDED`.
- [ ] `ratingsAvg` is recalculated after the update.

---

## US-06-04 — Delete my review

**Endpoint:** `DELETE /api/v1/reviews/:id` — 🔒 Protected

**Acceptance criteria**
- [ ] A user can delete their own review; an admin can delete any review.
- [ ] Anyone else → `403 NOT_YOUR_REVIEW`.
- [ ] Not found → `404 REVIEW_NOT_FOUND`.
- [ ] `ratingsAvg` and `ratingsCount` are recalculated after deletion.
- [ ] If the last review is deleted, `ratingsAvg` goes back to `0`.

---

## US-06-05 — View my reviews

**Endpoint:** `GET /api/v1/reviews/my-reviews` — 🔒 Protected

- [ ] Returns the current user's reviews only.
- [ ] Each review includes the pizza's name and image.
- [ ] Paginated, newest first.

---

## 🧮 Recalculating the average (important)

Always use an aggregation — never increment the average manually, or it will drift out of sync.

```js
const stats = await Review.aggregate([
  { $match: { product: productId } },
  { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
]);

await Product.findByIdAndUpdate(productId, {
  ratingsAvg: Math.round((stats[0]?.avg ?? 0) * 10) / 10,
  ratingsCount: stats[0]?.count ?? 0
});
```

**Acceptance criteria**
- [ ] Runs after create, update, and delete.
- [ ] Handles the empty case (no reviews left) without crashing.
- [ ] Best implemented as a static method on the `Review` model, called from a `post('save')` and a `post('findOneAndDelete')` hook.

---

## 🎨 Frontend notes

- An interactive star rating component (hover + click).
- A reviews section on the product page with the average, the distribution bars, and the list.
- Show the review form only to logged-in users; show a "Log in to review" prompt to guests.
- If the user already reviewed this pizza, show their review with Edit and Delete buttons instead of the form.
