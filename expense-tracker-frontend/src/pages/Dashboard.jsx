import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CategoryChip from '../components/CategoryChip';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { categoryColors, formatAmount, formatDate } from '../utils/categoryColors';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalSpend: 0, totalTransactions: 0 });
  const [categoryReport, setCategoryReport] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // month: 'current' -> sirf is mahine ka data (wireframe ke "Total Spent (June)" jaisa)
      const [summaryRes, categoryRes, expensesRes] = await Promise.all([
        api.get('/expenses/summary', { params: { month: 'current' } }),
        api.get('/expenses/reports/category', { params: { month: 'current' } }),
        api.get('/expenses'),
      ]);
      setSummary(summaryRes.data);
      setCategoryReport(categoryRes.data);
      setRecentExpenses(expensesRes.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load failed', err);
      setError(err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running on port 5000?' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'long' });

  // Top category = jisme sabse zyada amount kharch hua
  const topCategory = categoryReport.length
    ? [...categoryReport].sort((a, b) => b.totalAmount - a.totalAmount)[0]._id
    : '—';

  // Donut chart ke liye har category ka % nikalna
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
            <h2>Good to see you, {user?.name?.split(' ')[0]} 👋</h2>
            <div className="sub-text">Here's what's happening with your money</div>
          </div>
          <div className="avatar">
            {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading dashboard...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--coral)', padding: '2rem' }}>⚠️ {error}</div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="icon-badge" style={{ background: 'var(--coral-bg)', color: 'var(--coral)' }}>💸</div>
                <div className="label">Total Spent ({currentMonthName})</div>
                <div className="value amount">{formatAmount(summary.totalSpend)}</div>
              </div>
              <div className="summary-card">
                <div className="icon-badge" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>🧾</div>
                <div className="label">Transactions</div>
                <div className="value amount">{summary.totalTransactions}</div>
              </div>
              <div className="summary-card">
                <div className="icon-badge" style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>🏆</div>
                <div className="label">Top Category</div>
                <div className="value">{topCategory}</div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-title">Category Breakdown <span className="tag">This month</span></div>
                {donutSegments.length === 0 ? (
                  <div className="empty-state">No expenses this month yet</div>
                ) : (
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
                )}
              </div>

              <div className="chart-card">
                <div className="chart-title">Category Totals <span className="tag">This month</span></div>
                <div className="bars">
                  {categoryReport.length === 0 ? (
                    <div className="empty-state">No data yet</div>
                  ) : (
                    categoryReport.map((c) => {
                      const max = Math.max(...categoryReport.map((x) => x.totalAmount));
                      const height = max ? (c.totalAmount / max) * 100 : 0;
                      return (
                        <div className="bar-col" key={c._id}>
                          <div
                            className="bar"
                            style={{
                              height: `${height}%`,
                              background: categoryColors[c._id]?.text || 'var(--purple)',
                            }}
                          ></div>
                          <div className="bar-label">{c._id}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">
                Recent Expenses <Link to="/expenses" className="link">View all →</Link>
              </div>
              {recentExpenses.length === 0 ? (
                <div className="empty-state">No expenses added yet. Click "Add Expense" to get started.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((exp) => (
                      <tr key={exp._id}>
                        <td>{exp.title}</td>
                        <td><CategoryChip category={exp.category} /></td>
                        <td>{formatDate(exp.date)}</td>
                        <td className="amount">{formatAmount(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        <Link to="/add-expense" className="fab">＋</Link>
      </div>
    </div>
  );
}
