# Expense Tracker — Frontend (React + Vite)

A fully custom React SPA built from scratch — no UI library, no component kit. Every screen, chart, and interaction was hand-coded to match the wireframe design. Includes a complete Face Login system powered by `face-api.js` running entirely in the browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Face Recognition | face-api.js 0.22 (runs in-browser, no server needed) |
| Styling | Pure CSS (custom, no Tailwind/Bootstrap) |
| State | React Context API (no Redux) |

---

## What We Built — Feature by Feature

### 1. Authentication System (JWT)

Built entirely from scratch using React Context.

**AuthContext** (`context/AuthContext.jsx`) is the single source of truth for auth state across the entire app:
- On app load, reads `token` and `user` from `localStorage` — so the user stays logged in after page refresh.
- `login(email, password)` — calls `POST /auth/login`, saves token + user to localStorage and React state.
- `register(name, email, password, faceDescriptor?)` — calls `POST /auth/register`, then optionally calls `POST /auth/face/register` with the face descriptor in the same flow (if user captured their face during registration).
- `logout()` — clears localStorage and React state.
- `saveSession(data)` — shared helper used by both password login and face login to update state without code duplication.

**Auto-logout on 401:** The Axios interceptor in `api/axios.js` fires a custom `auth:logout` DOM event when any non-auth API call returns 401. `AuthContext` listens for this event and redirects to `/login` using React Router — no hard `window.location` redirect.

**ProtectedRoute** (`components/ProtectedRoute.jsx`) — wraps every authenticated page. If `user` is null in context, redirects to `/login` immediately.

### 2. Face Login System (Built from Scratch)

The most complex feature. The entire face recognition pipeline runs **in the browser** — no cloud API, no paid service.

**How it works end-to-end:**

1. `faceapi.js` utility (`utils/faceapi.js`) loads 3 neural network models from `/public/models/`:
   - `tinyFaceDetector` — detects face location in the video frame
   - `faceLandmark68Net` — finds 68 facial landmark points
   - `faceRecognitionNet` — converts landmarks into a 128-float descriptor
2. Models are loaded once and cached (`modelsLoaded` flag) — subsequent calls skip loading.
3. `getFaceDescriptor(videoElement)` runs detection on a live `<video>` element and returns `{ descriptor: number[128], confidence: 0-100 }`.
4. The descriptor is sent to the backend which compares it against the stored one using Euclidean distance.

**FaceCapture component** (`components/FaceCapture.jsx`) — reusable camera widget used in 3 places (Register, Login, FaceSetup):
- Opens the webcam via `navigator.mediaDevices.getUserMedia`
- Shows a live mirrored video feed (CSS `scaleX(-1)`)
- After capture, shows a **confidence bar** (green ≥80%, yellow ≥60%, red <60%) with label: Excellent / Good / Poor
- Camera border color changes to match confidence level
- Handles `NotAllowedError` (camera permission denied) with a user-friendly message
- Cleans up the camera stream on component unmount

**FaceSetup page** (`pages/FaceSetup.jsx`) — dedicated page for logged-in users to register their face at any time (accessible from Sidebar). Calls `POST /auth/face/register` with the captured descriptor.

### 3. Two-Step Registration with Optional Face Setup

`Register.jsx` implements a 2-step flow with animated step indicators:

- **Step 1** — Name, Email, Password form
- **Step 2** — Face capture (optional)
  - User can capture their face → "Create Account" button activates
  - Or click "Skip face setup, register without it" to skip entirely
  - On error, automatically goes back to Step 1

The face descriptor captured in Step 2 is passed directly to `AuthContext.register()` which handles both the account creation and face registration in one atomic flow.

### 4. Login with Two Modes

`Login.jsx` has a toggle between two login methods:

- **Password mode** — standard email + password form
- **Face mode** — enter email first, then the FaceCapture component appears. On capture, calls `POST /auth/face/login` with email + descriptor. On success, calls `saveSession()` to update auth state.

### 5. Dashboard

`Dashboard.jsx` — the main overview screen. Loads 3 API calls in parallel using `Promise.all`:
- `GET /expenses/summary?month=current` → Total Spent + Transaction Count cards
- `GET /expenses/reports/category?month=current` → Category breakdown data
- `GET /expenses` → Recent 5 expenses for the table

**What's displayed:**
- 3 summary cards: Total Spent (current month), Transactions count, Top Category
- **Donut chart** — built with pure CSS `conic-gradient`. Each category gets a slice proportional to its spend percentage.
- **Bar chart** — vertical bars per category, height proportional to spend amount. Built with pure CSS flexbox + dynamic inline styles.
- **Recent Expenses table** — last 5 expenses with category chips, formatted date and amount.
- Personalized greeting: "Good to see you, Krish 👋" (first name only, from auth context)
- Floating Action Button (FAB) `＋` → navigates to Add Expense
- Network error detection: if backend is unreachable, shows a specific "Is the backend running on port 5000?" message.

### 6. Add & Edit Expense (Single Component)

`AddExpense.jsx` handles both adding and editing from the same file:
- If URL is `/add-expense` → blank form, calls `POST /expenses`
- If URL is `/edit-expense/:id` → pre-fills form by fetching `GET /expenses/:id`, calls `PATCH /expenses/:id`
- Fields: Title, Amount, Category (dropdown: Food/Travel/Bills/Shopping), Date, Note (optional)
- On success, navigates back to `/expenses`

### 7. Expense List with Filters

`ExpenseList.jsx` — full list of all expenses with:
- **Category filter** dropdown (All / Food / Travel / Bills / Shopping)
- **Date range filter** (from + to date inputs)
- Edit button → navigates to `/edit-expense/:id`
- Delete button → calls `DELETE /expenses/:id`, removes from list immediately
- Category chips with color coding
- Formatted amounts (Indian Rupee format) and dates

### 8. Reports Page

`Reports.jsx` — analytics screen with a month selector dropdown:
- Dropdown shows last 12 months (dynamically generated)
- On month change, re-fetches both category report and expenses list for that month
- **Donut chart** — same conic-gradient technique as Dashboard
- **Weekly Trend bar chart** — groups expenses into 4 weeks by day-of-month (days 1-7 = Wk1, 8-14 = Wk2, etc.)
- **Category-wise Totals table** — category, total amount, transaction count (from MongoDB aggregation)

### 9. Axios Instance with Interceptors

`api/axios.js` — a configured Axios instance used everywhere:
- `baseURL` from `VITE_API_URL` env variable
- **Request interceptor** — automatically attaches `Authorization: Bearer <token>` from localStorage to every request. No need to manually add headers anywhere.
- **Response interceptor** — on 401 from any non-auth route, clears localStorage and fires `auth:logout` event (handled by AuthContext to redirect via React Router).

### 10. Category Colors & Formatting Utilities

`utils/categoryColors.js` — shared across all pages:
- `categoryColors` object maps each category to a text color and background color
- `formatAmount(n)` — formats numbers as Indian Rupee: `₹1,250.00`
- `formatDate(d)` — formats dates as `15 Jun 2026`

### 11. Sidebar Navigation

`Sidebar.jsx` — persistent left navigation present on all authenticated pages:
- Links: Dashboard, Add Expense, All Expenses, Reports, Face Login Setup
- Logout button that calls `AuthContext.logout()` and redirects to `/login`
- Active link highlighting via `NavLink` from React Router

---

## Folder Structure

```
src/
├── main.jsx                    # React app entry point — mounts <App /> to #root
├── App.jsx                     # All routes defined here with ProtectedRoute wrappers
├── index.css                   # All custom CSS — variables, layout, cards, tables, charts
│
├── api/
│   └── axios.js                # Axios instance with auth interceptors (auto token + 401 logout)
│
├── context/
│   └── AuthContext.jsx         # Global auth state: user, login, register, logout, saveSession
│
├── components/
│   ├── Sidebar.jsx             # Left nav — reused on every authenticated page
│   ├── CategoryChip.jsx        # Colored category badge (Food=green, Travel=blue, etc.)
│   ├── FaceCapture.jsx         # Webcam widget with face detection + confidence bar
│   └── ProtectedRoute.jsx      # Redirects to /login if user is not authenticated
│
├── pages/
│   ├── Login.jsx               # Password login + Face login toggle
│   ├── Register.jsx            # 2-step registration (form → face capture)
│   ├── Dashboard.jsx           # Summary cards + donut chart + bar chart + recent expenses
│   ├── AddExpense.jsx          # Add new expense + Edit existing expense (same component)
│   ├── ExpenseList.jsx         # Full list with category + date range filters
│   ├── Reports.jsx             # Monthly reports with donut chart + weekly trend + category table
│   └── FaceSetup.jsx           # Register/update face for face login (for logged-in users)
│
└── utils/
    ├── categoryColors.js       # Category color map + formatAmount + formatDate helpers
    └── faceapi.js              # loadFaceModels() + getFaceDescriptor() — face-api.js wrapper

public/
└── models/                     # face-api.js neural network model files (served statically)
    ├── tiny_face_detector_model-shard1
    ├── tiny_face_detector_model-weights_manifest.json
    ├── face_landmark_68_model-shard1
    ├── face_landmark_68_model-weights_manifest.json
    ├── face_recognition_model-shard1
    ├── face_recognition_model-shard2
    └── face_recognition_model-weights_manifest.json
```

---

## Routes

| Path | Component | Protected |
|---|---|---|
| `/` | Redirects to `/login` | — |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/dashboard` | Dashboard | ✅ |
| `/add-expense` | AddExpense | ✅ |
| `/edit-expense/:id` | AddExpense | ✅ |
| `/expenses` | ExpenseList | ✅ |
| `/reports` | Reports | ✅ |
| `/face-setup` | FaceSetup | ✅ |
| `*` | Redirects to `/login` | — |

---

## Setup & Running

### Prerequisites
- Node.js 18+
- Backend running on port 5000 (start `expense-tracker-backend` first)

### Steps

1. **Start the backend first**
   ```bash
   cd ../expense-tracker-backend
   npm run start:dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Check `.env`** (already configured)
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run dev server**
   ```bash
   npm run dev
   ```

5. Open in browser: `http://localhost:3000`

6. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## User Flow

```
/register
  → Step 1: Fill name, email, password
  → Step 2: Capture face (optional, can skip)
  → Account created → auto-login → /dashboard

/login
  → Mode 1: Email + Password → /dashboard
  → Mode 2: Email + Face scan → /dashboard

/dashboard
  → Summary cards (current month spend, transactions, top category)
  → Donut chart + bar chart (category breakdown)
  → Recent 5 expenses table
  → FAB (+) → /add-expense

/add-expense
  → Fill form → save → /expenses

/edit-expense/:id
  → Pre-filled form → update → /expenses

/expenses
  → Full list with filters (category + date range)
  → Edit → /edit-expense/:id
  → Delete → removes from list

/reports
  → Select month from dropdown
  → Donut chart + weekly trend bars + category totals table

/face-setup
  → Capture face → saves descriptor to backend
  → Now "Login with Face" works on /login
```

---

## Key Implementation Notes

- **No UI library** — every component, card, table, chart, and button is hand-coded in CSS
- **No chart library** — donut charts use CSS `conic-gradient`, bar charts use CSS flexbox with dynamic `height` percentages
- **Face models run locally** — `face-api.js` models are in `/public/models/` and served as static files. No external API calls for face recognition.
- **Token persistence** — `localStorage` stores `token` and `user`. Page refresh keeps the user logged in.
- **Auto-logout** — 401 response on any protected API call triggers logout + redirect to `/login` via custom DOM event (avoids React Router context issues in Axios interceptors).
- **Face descriptor is just numbers** — the 128-float array is a plain JSON array. No image or video is ever sent to the backend.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |
