# Expense Tracker — Backend (NestJS + MongoDB + JWT)

A production-ready REST API built from scratch with NestJS, MongoDB (Mongoose), Passport JWT authentication, and a fully custom Face Login system using 128-dimensional face descriptors.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (TypeScript) |
| Database | MongoDB via Mongoose 8 |
| Auth | Passport.js + JWT (passport-jwt) |
| Password Hashing | bcrypt |
| Validation | class-validator + class-transformer |
| Config | @nestjs/config (.env) |

---

## What We Built — Feature by Feature

### 1. JWT Authentication (Email + Password)

Built entirely from scratch — no third-party auth service.

- **Register** (`POST /auth/register`) — accepts `name`, `email`, `password`. Password is hashed with bcrypt (10 salt rounds) before saving. Duplicate email throws a `409 Conflict`.
- **Login** (`POST /auth/login`) — verifies email exists, compares bcrypt hash, returns a signed JWT token + user object.
- **JWT Strategy** (`jwt.strategy.ts`) — Passport strategy that extracts the Bearer token from `Authorization` header, verifies it against `JWT_SECRET`, and injects `{ userId, email }` into `req.user`.
- **JwtAuthGuard** (`common/guards/jwt-auth.guard.ts`) — a single-line guard that wraps `AuthGuard('jwt')`. Applied at controller level to protect entire modules.
- **@CurrentUser() decorator** (`common/decorators/current-user.decorator.ts`) — custom param decorator that reads `req.user` injected by the JWT strategy. Used in every protected controller to get the logged-in user's ID without touching `req` directly.
- **Token config** — `JWT_EXPIRES_IN=7d` (configurable via `.env`). Token is stateless — no session, no DB lookup on every request.

### 2. Face Login System (Built from Scratch)

The most unique feature. We built a complete biometric login flow without any paid API.

**How it works end-to-end:**

1. The frontend uses `face-api.js` to run a TinyFaceDetector model locally in the browser.
2. It extracts a **128-number face descriptor** (a "face fingerprint") from the live camera feed.
3. This array of 128 floats is sent to the backend.
4. The backend stores it in the user's MongoDB document (`faceDescriptor: [Number]`).
5. On face login, the backend computes the **Euclidean distance** between the stored descriptor and the live descriptor.
6. If distance ≤ `0.6` (face-api.js recommended threshold), login succeeds and a JWT is returned.

**Backend routes:**

| Method | Route | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/face/register` | ✅ JWT | Saves 128-float descriptor to user document |
| POST | `/auth/face/login` | ❌ Public | Compares live descriptor, returns JWT if match |

**DTOs with validation:**
- `RegisterFaceDto` — `@IsArray()`, `@ArrayMinSize(128)`, `@ArrayMaxSize(128)`, `@IsNumber({}, { each: true })` — ensures exactly 128 numbers, nothing else accepted.
- `FaceLoginDto` — same descriptor validation + `@IsEmail()` for the email field.

**Euclidean distance formula (implemented in `auth.service.ts`):**
```
distance = sqrt( sum( (a[i] - b[i])^2 ) )   for i = 0..127
```
Threshold: `0.6` — lower = stricter match. This is the standard face-api.js recommendation.

### 3. Expense CRUD (Full Ownership Isolation)

Every expense is tied to the logged-in user via a `user: ObjectId` field. Users can never see or modify each other's data — every query includes `{ user: new Types.ObjectId(userId) }`.

| Method | Route | Description |
|---|---|---|
| POST | `/expenses` | Create expense |
| GET | `/expenses` | List all (with optional filters) |
| GET | `/expenses/:id` | Single expense |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

**Filtering** (`GET /expenses`):
- `?category=Food` — filter by category
- `?from=2026-06-01&to=2026-06-30` — date range filter
- Both can be combined

**Expense Schema fields:** `title`, `amount`, `category` (enum: Food/Travel/Bills/Shopping), `date`, `note` (optional), `user` (ObjectId ref), `createdAt`, `updatedAt` (auto via timestamps).

### 4. Dashboard Summary (MongoDB Aggregation)

`GET /expenses/summary?month=current` — used by the frontend Dashboard cards.

Uses MongoDB `$group` aggregation pipeline:
```
$match (user + date range) → $group → { totalSpend: $sum, totalTransactions: $sum }
```

`month=current` resolves to the 1st–last day of the current month. You can also pass `?month=6&year=2026` for any specific month.

### 5. Category Reports (MongoDB Aggregation)

`GET /expenses/reports/category?month=6&year=2026` — used by the Reports page.

Pipeline: `$match → $group by category → $sort by totalAmount desc`

Returns: `[{ _id: "Food", totalAmount: 4500, transactions: 12 }, ...]`

### 6. Date Range Resolution (Smart Helper)

`resolveDateRange()` in `expenses.service.ts` handles 3 cases:
- `month=current` → current month's 1st to last day
- `month=6&year=2026` → specific month (frontend sends 1-12, converted to 0-indexed internally)
- No params → `null` (all-time, no date filter)

### 7. Global Error Handling

`HttpExceptionFilter` (`common/filters/http-exception.filter.ts`) — catches ALL exceptions globally and returns a consistent JSON shape:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered",
  "path": "/auth/register",
  "timestamp": "2026-06-15T10:30:00.000Z"
}
```

Also handles MongoDB duplicate key errors (code 11000) and maps them to `409 Conflict` automatically.

### 8. Global Validation Pipe

`ValidationPipe({ whitelist: true })` applied globally in `main.ts`:
- Strips any extra fields not in the DTO (whitelist)
- Returns `400 Bad Request` with field-level error messages if validation fails
- No manual validation code needed in controllers

### 9. Cache-Control Header

All API responses include `Cache-Control: no-store` — prevents browsers from caching GET responses, ensuring the frontend always gets fresh data.

---

## Folder Structure

```
src/
├── main.ts                          # Bootstrap: CORS, ValidationPipe, HttpExceptionFilter, port
├── app.module.ts                    # Root module: ConfigModule, MongooseModule, all feature modules
│
├── config/
│   ├── app.config.ts                # PORT config
│   └── database.config.ts           # MONGO_URI config
│
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts  # @CurrentUser() — reads req.user from JWT strategy
│   ├── filters/
│   │   └── http-exception.filter.ts   # Global error handler — consistent JSON error format
│   └── guards/
│       └── jwt-auth.guard.ts          # @UseGuards(JwtAuthGuard) — protects routes
│
├── core/
│   └── logger/                        # App-level logging infrastructure
│
└── modules/
    ├── users/
    │   ├── entities/user.entity.ts    # Schema: name, email, password (hashed), faceDescriptor
    │   └── users.service.ts           # findByEmail, findById, create, saveFaceDescriptor
    │
    ├── auth/
    │   ├── dto/
    │   │   ├── register.dto.ts        # name, email, password (minLength 6)
    │   │   ├── login.dto.ts           # email, password
    │   │   ├── register-face.dto.ts   # descriptor: number[128]
    │   │   └── face-login.dto.ts      # email + descriptor: number[128]
    │   ├── strategies/
    │   │   └── jwt.strategy.ts        # Passport JWT strategy — validates token, injects req.user
    │   ├── auth.controller.ts         # POST /auth/register, login, face/register, face/login
    │   ├── auth.service.ts            # Business logic: bcrypt, JWT sign, euclidean distance
    │   └── auth.module.ts             # JwtModule.registerAsync with ConfigService
    │
    └── expenses/
        ├── dto/
        │   ├── create-expense.dto.ts  # title, amount, category (enum), date, note?
        │   └── update-expense.dto.ts  # PartialType of CreateExpenseDto
        ├── entities/expense.entity.ts # Schema: title, amount, category, date, note, user (ref)
        ├── expenses.controller.ts     # All CRUD + summary + reports routes
        └── expenses.service.ts        # CRUD + MongoDB aggregation pipelines
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas connection string

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`)
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRES_IN=7d
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Run in dev mode** (auto-restarts on file changes)
   ```bash
   npm run start:dev
   ```

   You should see: `🚀 Server running on http://localhost:5000`

5. **Build for production**
   ```bash
   npm run build
   npm run start:prod
   ```

---

## All API Endpoints

### Auth (Public)

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ access_token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ access_token, user }` |
| POST | `/auth/face/login` | `{ email, descriptor: number[128] }` | `{ access_token, user }` |

### Auth (Protected — JWT required)

| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/auth/face/register` | `{ descriptor: number[128] }` | `{ message }` |

### Expenses (All Protected — JWT required)

| Method | Route | Query Params | Description |
|---|---|---|---|
| POST | `/expenses` | — | Create new expense |
| GET | `/expenses` | `category`, `from`, `to` | List expenses with optional filters |
| GET | `/expenses/summary` | `month`, `year` | Dashboard totals (aggregation) |
| GET | `/expenses/reports/category` | `month`, `year` | Category-wise totals (aggregation) |
| GET | `/expenses/:id` | — | Single expense |
| PATCH | `/expenses/:id` | — | Update expense |
| DELETE | `/expenses/:id` | — | Delete expense |

**All protected routes require:** `Authorization: Bearer <access_token>`

---

## Testing with Postman / Thunder Client

1. `POST /auth/register` → copy the `access_token` from response
2. Set header: `Authorization: Bearer <token>`
3. `POST /expenses` with body: `{ "title": "Lunch", "amount": 250, "category": "Food", "date": "2026-06-15" }`
4. `GET /expenses/summary?month=current` → see dashboard totals
5. `GET /expenses/reports/category?month=6&year=2026` → see category breakdown

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/expense-tracker` |
| `JWT_SECRET` | Secret key for signing JWT tokens | — (required) |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
