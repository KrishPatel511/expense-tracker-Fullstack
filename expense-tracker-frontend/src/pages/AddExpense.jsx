import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { categoryList } from '../utils/categoryColors';

export default function AddExpense() {
  const { id } = useParams(); // agar id hai to ye Edit mode hai
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadExpense();
    }
  }, [id]);

  const loadExpense = async () => {
    try {
      const { data } = await api.get(`/expenses/${id}`);
      setForm({
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date.slice(0, 10), // YYYY-MM-DD format for input
        note: data.note || '',
      });
    } catch (err) {
      setError('Could not load expense details.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
    };

    try {
      if (isEditMode) {
        await api.patch(`/expenses/${id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topline">
          <div>
            <h2>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
            <div className="sub-text">{isEditMode ? 'Update the details below' : 'Log a purchase or bill'}</div>
          </div>
        </div>

        <div className="panel-card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <div className="field-label">Title</div>
              <input
                className="field"
                name="title"
                placeholder="e.g. Grocery Shopping"
                style={{ marginBottom: 0 }}
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="field-label">Amount (₹)</div>
              <input
                className="field"
                type="number"
                name="amount"
                placeholder="0.00"
                style={{ marginBottom: 0 }}
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <div className="field-label">Category</div>
              <select
                className="field"
                name="category"
                style={{ marginBottom: 0 }}
                value={form.category}
                onChange={handleChange}
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="field-label">Date</div>
              <input
                className="field"
                type="date"
                name="date"
                style={{ marginBottom: 0 }}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="full-span">
              <div className="field-label">Note (optional)</div>
              <input
                className="field"
                name="note"
                placeholder="Add a short note..."
                style={{ marginBottom: 0 }}
                value={form.note}
                onChange={handleChange}
              />
            </div>

            {error && <div className="error-text full-span" style={{ margin: 0 }}>{error}</div>}

            <div className="full-span" style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '12px 26px' }} disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Save Expense'}
              </button>
              <button type="button" className="btn-outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
