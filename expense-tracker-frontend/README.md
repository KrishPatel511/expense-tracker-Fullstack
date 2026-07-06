# Expense Tracker Frontend (React + Vite)

## Folder Structure (Simple)

```
src/
├── main.jsx              # App entry point
├── App.jsx               # All routes yahan defined hain
├── index.css             # Poora styling (wireframe se match)
│
├── api/
│   └── axios.js          # Backend se baat karne wala axios instance
│
├── context/
│   └── AuthContext.jsx   # Login/logout state poore app me share hota hai
│
├── components/
│   ├── Sidebar.jsx       # Left navigation (sab pages me reuse hota hai)
│   ├── CategoryChip.jsx  # Colored category badge
│   └── ProtectedRoute.jsx # Bina login route access nahi hone deta
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AddExpense.jsx    # Add aur Edit dono isi file se hota hai
│   ├── ExpenseList.jsx
│   └── Reports.jsx
│
└── utils/
    └── categoryColors.js # Category colors + date/amount formatting helpers
```

**Simple logic:** Har "page" apna data khud fetch karta hai (`useEffect` + `api.get`), `Sidebar` sabme common hai, aur `AuthContext` batata hai user login hai ya nahi.

## Setup Steps

1. **Backend pehle chalu karo** (`expense-tracker-backend` folder me `npm run start:dev`, port 5000 pe chalna chahiye)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **`.env` check karo** (already set hai)
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Run**
   ```bash
   npm run dev
   ```

5. Browser me kholo: `http://localhost:3000`

## Flow

1. `/register` pe naya account banao → automatically login ho jaoge
2. Dashboard pe redirect hoga → summary cards, charts, recent expenses dikhenge
3. "Add Expense" se naya expense add karo → List me turant dikhega
4. "All Expenses" pe filter, edit, delete kar sakta hai
5. "Reports" pe category-wise totals (MongoDB aggregation se) dikhega
6. Logout karne pe token clear ho jayega aur login pe wapas bhej dega

## Notes

- Token `localStorage` me store hota hai — page refresh karne pe bhi login rahega
- Agar token expire ho jaye (401 error), automatically login page pe redirect ho jayega
- Saara UI tere `wireframe-reference.html` ke exact colors/layout follow karta hai
