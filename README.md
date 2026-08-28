# Expense Tracker

A full-stack personal expense management application with JWT authentication, optional face authentication, MongoDB persistence, monthly analytics, and user-level data isolation.

The project is split into a React frontend and a NestJS backend. It is designed for a simple workflow: create an account, optionally enroll your face, record expenses, and understand spending through dashboards and reports.

## Highlights

- Email and password registration and login
- Password hashing with bcrypt
- JWT-based authentication with protected routes
- Optional face enrollment and face login
- Browser-side face detection using `face-api.js`
- 128-value face descriptors stored in MongoDB
- Euclidean-distance face matching with a `0.6` threshold
- Expense create, read, update, and delete operations
- Per-user expense ownership isolation
- Category and date-range filters
- Monthly dashboard summaries and category reports
- CSS-based donut and bar charts without a chart library
- Swagger API documentation
- Global request validation and consistent error responses
- Responsive React interface with reusable components

## Product Preview

### Account Creation

The registration flow starts with the user's basic details and continues to optional face enrollment.

<p align="center">
  <img src="docs/screenshots/register.png" alt="Expense Tracker registration screen" width="720" />
</p>

### Secure Login Choices

Users can sign in with a password or use the locally processed face-login flow after enrollment.

<p align="center">
  <img src="docs/screenshots/login.png" alt="Expense Tracker login screen with password and face login options" width="720" />
</p>

The authenticated experience includes the dashboard, expense management, monthly reports, and a dedicated face setup screen.

## Technology Stack

### Frontend

- React 18
- Vite 5
- React Router DOM 6
- Axios
- face-api.js
- Custom CSS
- Context API for authentication state

### Backend

- NestJS 10
- TypeScript
- MongoDB
- Mongoose 8
- Passport.js and passport-jwt
- JSON Web Tokens
- bcrypt
- class-validator and class-transformer
- Swagger / OpenAPI

## Application Architecture

```text
                    +----------------------+
                    |   React + Vite UI    |
                    |  localhost:3000      |
                    +----------+-----------+
                               |
                        Axios REST requests
                               |
                    +----------v-----------+
                    |   NestJS REST API    |
                    |  localhost:5000      |
                    +-----+-----------+----+
                          |           |
                   JWT / bcrypt   face matching
                          |           |
                    +-----v-----------v----+
                    |  MongoDB collections |
                    | users + expenses     |
                    +----------------------+
```

## Complete User Flow

### 1. Registration

1. The user opens `/register`.
2. The user enters name, email, and a password of at least six characters.
3. The frontend moves to the optional face setup step.
4. The user can capture a face descriptor or skip face setup.
5. The frontend sends `POST /auth/register`.
6. The backend checks whether the email already exists.
7. The password is hashed with bcrypt before it is saved.
8. The backend returns a JWT and a safe user object. The password is never returned.
9. If a face was captured, the frontend sends the 128-value descriptor to the protected face-registration endpoint.
10. The frontend stores the JWT and user in `localStorage` and opens the dashboard.

### 2. Password Login

1. The user enters email and password on `/login`.
2. The frontend sends `POST /auth/login`.
3. The backend finds the user and compares the password with the bcrypt hash.
4. On success, the backend signs a JWT containing the user id and email.
5. Axios stores the token through the shared auth context.
6. Protected routes become available and the user is redirected to `/dashboard`.

### 3. Face Enrollment

1. The browser requests camera permission.
2. Local face-api.js models are loaded from `frontend/public/models`.
3. TinyFaceDetector locates the face.
4. FaceLandmark68Net detects facial landmarks.
5. FaceRecognitionNet generates a 128-number descriptor.
6. The frontend sends only the descriptor, not an image or video, to `POST /auth/face/register`.
7. The backend validates the descriptor and stores it on the authenticated user's document.

### 4. Face Login

1. The user selects `Login with Face` and enters their email.
2. The browser captures a live face descriptor locally.
3. The frontend sends the email and descriptor to `POST /auth/face/login`.
4. The backend loads the stored descriptor for that email.
5. It calculates Euclidean distance between stored and live descriptors.
6. A distance less than or equal to `0.6` is accepted.
7. A successful match returns a normal JWT session, just like password login.

The current face system is a convenience authentication feature. It should not be treated as a high-assurance biometric identity system without the advanced protections listed in the roadmap below.

### 5. Expense Management

1. An authenticated user opens `/add-expense`.
2. The frontend sends the title, amount, category, date, and optional note to `POST /expenses`.
3. The backend reads the user id from the JWT and stores it with the expense.
4. Every list, detail, update, and delete query is restricted to that user id.
5. The user can filter expenses by category or date range.
6. Editing uses `/edit-expense/:id`; deleting removes the expense from the current list.

### 6. Dashboard and Reports

- Dashboard loads summary, category aggregation, and recent expenses.
- Summary cards show current-month spending and transaction count.
- Category data powers CSS donut and bar charts.
- Reports allow monthly selection and show category totals and weekly trends.
- MongoDB aggregation performs category and total calculations on the backend.

## Features in Detail

### Authentication and Security

- bcrypt hashes passwords with ten salt rounds.
- JWT tokens expire according to `JWT_EXPIRES_IN`.
- Protected controllers use `JwtAuthGuard`.
- `@CurrentUser()` reads the authenticated user from the verified JWT.
- Axios automatically attaches the bearer token to requests.
- A non-authenticated `401` response clears the client session and redirects to login.
- DTO validation rejects invalid payloads and strips unknown fields.
- Duplicate emails return a conflict response.

### Face Authentication

- Models run locally in the browser; no face image is uploaded.
- Camera streams are cleaned up when the component unmounts.
- The UI displays detection confidence.
- Descriptors are validated as exactly 128 numeric values.
- Face login is opt-in and can be skipped during registration.
- A logged-in user can update face enrollment from `/face-setup`.

### Expense Data Model

Each expense contains:

- `title`
- `amount`
- `category`: `Food`, `Travel`, `Bills`, or `Shopping`
- `date`
- optional `note`
- owning `user` reference
- automatic `createdAt` and `updatedAt` timestamps

MongoDB creates the `expense-tracker` database and collections when data is first written. The main collections are `users` and `expenses`.

## Project Structure

```text
.
├── README.md
├── expense-tracker-backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/
│       ├── config/
│       ├── core/
│       └── modules/
│           ├── auth/
│           ├── expenses/
│           └── users/
└── expense-tracker-frontend/
    ├── .env.example
    ├── package.json
    ├── public/models/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── utils/
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Either MongoDB Community Server running locally or a MongoDB Atlas cluster
- A modern browser with camera permission support for face features

### 1. Install backend dependencies

```bash
cd expense-tracker-backend
npm install
```

### 2. Configure the backend

Create `expense-tracker-backend/.env` from `.env.example`.

For local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

For MongoDB Atlas, use the connection string from Atlas under `Connect -> Drivers`:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/expense-tracker?appName=Cluster0
```

Never commit `.env` or expose database credentials in screenshots, issues, or source control. For Atlas, also configure a database user and allow your current IP address under Network Access.

### 3. Start the backend

```bash
cd expense-tracker-backend
npm run start:dev
```

The API runs at `http://localhost:5000` and Swagger is available at:

```text
http://localhost:5000/api/docs
```

### 4. Install and configure the frontend

```bash
cd expense-tracker-frontend
npm install
```

Create `expense-tracker-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Start the frontend

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:3000`. If that port is already occupied, Vite selects another port such as `3001`.

### Production builds

```bash
cd expense-tracker-backend
npm run build
npm run start:prod

cd ../expense-tracker-frontend
npm run build
npm run preview
```

## API Reference

All expense routes and the face-registration route require:

```text
Authorization: Bearer <access_token>
```

### Public authentication routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account and return a JWT |
| POST | `/auth/login` | Login with email and password |
| POST | `/auth/face/login` | Login with email and a 128-value face descriptor |

### Protected authentication routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/face/register` | Save or update the current user's face descriptor |

### User routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/me` | Get the current authenticated user's profile |

### Expense routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/expenses` | Create an expense |
| GET | `/expenses` | List expenses with optional filters |
| GET | `/expenses/:id` | Get one owned expense |
| PATCH | `/expenses/:id` | Update one owned expense |
| DELETE | `/expenses/:id` | Delete one owned expense |
| GET | `/expenses/summary` | Get spending totals for a month or all time |
| GET | `/expenses/reports/category` | Get category totals and transaction counts |

Useful query parameters:

- `/expenses?category=Food`
- `/expenses?from=2026-06-01&to=2026-06-30`
- `/expenses/summary?month=current`
- `/expenses/summary?month=6&year=2026`
- `/expenses/reports/category?month=6&year=2026`

Example expense payload:

```json
{
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-06-15",
  "note": "Team lunch"
}
```

## Frontend Routes

| Path | Access | Screen |
|---|---|---|
| `/login` | Public | Password or face login |
| `/register` | Public | Two-step account creation |
| `/dashboard` | Protected | Summary, charts, and recent expenses |
| `/add-expense` | Protected | Create an expense |
| `/edit-expense/:id` | Protected | Edit an expense |
| `/expenses` | Protected | Filter, edit, and delete expenses |
| `/reports` | Protected | Monthly analytics |
| `/face-setup` | Protected | Register or update face login |

## Error Handling

The backend applies a global exception filter and returns a consistent structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "path": "/auth/register",
  "timestamp": "2026-08-28T12:00:00.000Z"
}
```

## Advanced Face Authentication Roadmap

The current implementation provides descriptor-based face matching. The following upgrades can make it more secure and production-ready:

- **Liveness detection:** Require blinking, head turns, or guided movement to reduce photo and screen replay attacks.
- **Anti-spoofing model:** Add a dedicated presentation-attack detector for printed photos, videos, and masks.
- **Multi-angle enrollment:** Capture several descriptors from different angles and lighting conditions instead of one descriptor.
- **Quality gates:** Reject blurry, dark, tiny, or partially hidden faces before enrollment.
- **Secure biometric storage:** Encrypt descriptors at rest and use a key-management service rather than storing raw vectors without protection.
- **Template versioning:** Store model version, capture quality, and enrollment timestamp so descriptors can be safely re-enrolled after model upgrades.
- **Rate limiting and lockout:** Limit failed face attempts and add temporary account lockout with audit logging.
- **Step-up authentication:** Require password or email OTP for sensitive actions such as changing face enrollment or exporting data.
- **Privacy controls:** Add consent, delete-face-data, re-enrollment, and account data export actions.
- **Threshold calibration:** Tune the matching threshold using representative validation data instead of relying only on the default `0.6` value.
- **Fallback authentication:** Always provide password or OTP recovery when camera access or face matching fails.
- **WebAuthn support:** Offer passkeys as a stronger browser-native alternative to face matching for high-value authentication.

## Known Limitations

- Face recognition requires camera permission and a supported browser.
- The current descriptor comparison is not a complete anti-spoofing system.
- JWT tokens are stored in browser `localStorage`; production deployments should evaluate an HttpOnly secure-cookie strategy.
- The default development setup is intended for local use and should be hardened before public deployment.

## Development Commands

### Backend

```bash
npm run start       # Start once
npm run start:dev   # Watch mode
npm run build       # Compile TypeScript
npm run start:prod  # Run compiled output
```

### Frontend

```bash
npm run dev         # Vite development server
npm run build       # Production build
npm run preview     # Preview production build
```

## License

This project is available for learning and personal development. Add a license file before distributing it as an open-source package.
