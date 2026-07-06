import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceCapture from '../components/FaceCapture';
import api from '../api/axios';

export default function Login() {
  const [mode, setMode] = useState('password'); // 'password' | 'face'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, saveSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (descriptor) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/face/login', { email, descriptor });
      saveSession(data);   // AuthContext state update — no hard reload
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Face not recognized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">₹</div>
        <h2>Welcome back</h2>
        <div className="sub">Log in to track your spending</div>

        {/* Password vs Face login toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className={mode === 'password' ? 'btn-primary' : 'btn-outline'}
            style={{ flex: 1, padding: '9px' }}
            onClick={() => setMode('password')}
          >
            Password
          </button>
          <button
            type="button"
            className={mode === 'face' ? 'btn-primary' : 'btn-outline'}
            style={{ flex: 1, padding: '9px' }}
            onClick={() => setMode('face')}
          >
            Login with Face
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handleSubmit}>
            <div className="field-label">Email</div>
            <input
              className="field"
              type="email"
              placeholder="krish@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="field-label">Password</div>
            <input
              className="field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="error-text">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <div>
            <div className="field-label">Email</div>
            <input
              className="field"
              type="email"
              placeholder="krish@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!email ? (
              <div className="sub-text" style={{ marginBottom: 12 }}>
                Pehle email daal, fir camera khulega.
              </div>
            ) : (
              <FaceCapture onCapture={handleFaceCapture} buttonLabel="Login with Face" />
            )}

            {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
          </div>
        )}

        <div className="auth-footer">
          New here? <Link to="/register" className="link">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
