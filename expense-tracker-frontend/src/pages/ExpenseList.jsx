import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CategoryChip from '../components/CategoryChip';
import api from '../api/axios';
import { categoryList, formatAmount, formatDate } from '../utils/categoryColors';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', from: '', to: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async (activeFilters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.from) params.from = activeFilters.from;
      if (activeFilters.to) params.to = activeFilters.to;

      const { data } = await api.get('/expenses', { params });
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    loadExpenses(filters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      alert('Could not delete expense.');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topline">
          <div>
            <h2>All Expenses</h2>
            <div className="sub-text">{expenses.length} transactions</div>
          </div>
          <Link to="/add-expense" className="btn-add">＋ Add New</Link>
        </div>

        <div className="filter-row">
          <select className="field" name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input className="field" type="date" name="from" value={filters.from} onChange={handleFilterChange} placeholder="From Date" />
          <input className="field" type="date" name="to" value={filters.to} onChange={handleFilterChange} placeholder="To Date" />
          <button className="btn-outline" onClick={applyFilter}>Apply Filter</button>
        </div>

        <div className="panel-card">
          {loading ? (
            <div className="loading-state">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">No expenses found. Try adjusting filters or add a new expense.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.title}</td>
                    <td><CategoryChip category={exp.category} /></td>
                    <td>{formatDate(exp.date)}</td>
                    <td className="amount">{formatAmount(exp.amount)}</td>
                    <td className="row-actions">
                      <span className="action-btn edit" onClick={() => navigate(`/edit-expense/${exp._id}`)}>Edit</span>
                      <span className="action-btn del" onClick={() => handleDelete(exp._id)}>Delete</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
