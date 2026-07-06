# Expense Tracker Backend (NestJS + MongoDB + JWT)

## Folder Structure

```
src/
├── main.ts                     # App entry point
├── app.module.ts               # Root module
├── config/                     # App & DB config
├── common/                     # guards, filters, decorators (shared across modules)
├── core/                       # global infra (logger, etc.)
└── modules/
    ├── users/                  # user schema + profile route
    ├── auth/                   # register / login (JWT)
    └── expenses/                # expense CRUD + dashboard + reports (matches your mockup)
```

## Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **MongoDB chalu karo**
   - Local: `mongod` (MongoDB local machine pe installed hona chahiye)
   - Ya MongoDB Atlas ka free cluster bana kar uska connection string `.env` me daal do

3. **`.env` file check karo** (already provided, apni values daal do)
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRES_IN=7d
   ```

4. **Run in dev mode**
   ```bash
   npm run start:dev
   ```

   Terminal me dikhna chahiye: `🚀 Server running on http://localhost:5000`

## API Endpoints

### Auth (public)
| Method | Route | Body |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` |
| POST | `/auth/login` | `{ email, password }` |

Response: `{ access_token, user: { id, name, email } }`

### Users (protected — needs `Authorization: Bearer <token>`)
| Method | Route |
|---|---|
| GET | `/users/me` |

### Expenses (protected — needs `Authorization: Bearer <token>`)
| Method | Route | Notes |
|---|---|---|
| POST | `/expenses` | `{ title, amount, category, date, note? }` |
| GET | `/expenses` | Query params: `?category=Food&from=2026-06-01&to=2026-06-30` |
| GET | `/expenses/summary` | Dashboard cards — total spend, transaction count |
| GET | `/expenses/reports/category` | Category-wise totals (mockup ke Reports screen ke liye) |
| GET | `/expenses/:id` | Single expense |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

## Testing (Postman / Thunder Client)

1. `POST /auth/register` → `access_token` milega
2. Us token ko header me daalo: `Authorization: Bearer <token>`
3. Ab `/expenses` routes test karo

## Next Steps

- React frontend banao jo `expense-tracker-mockup.html` wireframe follow kare
- Login/Register screens `/auth/login` aur `/auth/register` se connect karo
- Dashboard `/expenses/summary`, list `/expenses`, reports `/expenses/reports/category` se connect karo


## Git Workflow
This project follows feature-branch + pull request workflow.