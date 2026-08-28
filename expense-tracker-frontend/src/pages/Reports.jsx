import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import CategoryChip from '../components/CategoryChip';
import api from '../api/axios';
import { categoryColors, formatAmount } from '../utils/categoryColors';

// Pichle 12 mahine ki dropdown list banata hai - jaise "July 2026", "June 2026"...
function buildMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      month: d.getMonth() + 1, // 1-12
      year: d.getFullYear(),
    });
  }
  return options;
}

// Selected month ke expenses ko 4 weeks me group karta hai (day-of-month ke hisaab se)
function getWeeklyTrend(expenses) {
  const weeks = [0, 0, 0, 0];
  expenses.forEach((exp) => {
    const day = new Date(exp.date).getDate();
    const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
    weeks[weekIndex] += exp.amount;
  });
  return weeks.map((total, i) => ({ label: `Wk${i + 1}`, total }));
}

export default function Reports() {
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selected, setSelected] = useState(monthOptions[0]); // default: current month

  const [categoryReport, setCategoryReport] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport(selected);
  }, [selected]);

  const loadReport = async ({ month, year }) => {
    setLoading(true);
    try {
      // Selected month ka date range - expenses list ko bhi isi range se filter karenge
      const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const to = new Date(year, month, 0).toISOString().slice(0, 10);

      const [categoryRes, expensesRes] = await Promise.all([
        api.get('/expenses/reports/category', { params: { month, year } }),
        api.get('/expenses', { params: { from, to } }),
      ]);
      setCategoryReport(categoryRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const found = monthOptions.find((m) => `${m.month}-${m.year}` === e.target.value);
    setSelected(found);
  };

  const weeklyTrend = getWeeklyTrend(expenses);
  const hasWeeklyData = weeklyTrend.some((w) => w.total > 0);
  const maxWeekly = Math.max(...weeklyTrend.map((w) => w.total)) || 1;

  const totalForDonut = categoryReport.reduce((sum, c) => sum + c.totalAmount, 0);
  let cumulative = 0;
  const donutSegments = categoryReport.map((c) => {
    const percent = totalForDonut ? (c.totalAmount / totalForDonut) * 100 : 0;
    const start = cumulative;
    cumulative += percent;
    return { category: c._id, start, end: cumulative, percent };
  });
  const donutGradient = donutSegments.length
    ? `conic-gradient(${donutSegments
        .map((s) => `${categoryColors[s.category]?.text || '#ccc'} ${s.start}% ${s.end}%`)
        .join(', ')})`
    : 'var(--border)';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topline">
          <div>
            <h2>Reports</h2>
            <div className="sub-text">Aggregated from your expense data</div>
          </div>
          <select
            className="field"
            style={{ marginBottom: 0, width: 200 }}
            value={`${selected.month}-${selected.year}`}
            onChange={handleMonthChange}
          >
            {monthOptions.map((m) => (
              <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading report...</div>
        ) : categoryReport.length === 0 ? (
          <div className="panel-card">
            <div className="empty-state">No expenses found for {selected.label}.</div>
          </div>
        ) : (
          <>
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-title">Category Breakdown <span className="tag">{selected.label}</span></div>
                <div className="donut-wrap">
                  <div className="donut" style={{ background: donutGradient }}></div>
                  <div className="legend">
                    {donutSegments.map((s) => (
                      <div className="legend-item" key={s.category}>
                        <span className="legend-dot" style={{ background: categoryColors[s.category]?.text }}></span>
                        {s.category} — {s.percent.toFixed(0)}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-title">Daily Spend Trend <span className="tag">{selected.label}</span></div>
                <div className="bars">
                  {!hasWeeklyData ? (
                    <div className="empty-state">No data yet</div>
                  ) : (
                    weeklyTrend.map((w) => {
                      const height = (w.total / maxWeekly) * 100;
                      return (
                        <div className="bar-col" key={w.label}>
                          <div
                            className="bar"
                            style={{ height: `${height}%`, background: 'var(--purple)' }}
                          ></div>
                          <div className="bar-label">{w.label}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">
                Category-wise Totals <span className="tag" style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>{selected.label}</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Category</th><th>Total Amount</th><th>Transactions</th></tr>
                </thead>
                <tbody>
                  {categoryReport.map((c) => (
                    <tr key={c._id}>
                      <td><CategoryChip category={c._id} /></td>
                      <td className="amount">{formatAmount(c.totalAmount)}</td>
                      <td>{c.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
