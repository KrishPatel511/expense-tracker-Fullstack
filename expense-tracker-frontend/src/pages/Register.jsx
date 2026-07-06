import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceCapture from '../components/FaceCapture';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = form, 2 = face capture
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleFormNext = (e) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleFaceCaptured = (descriptor) => {
    setFaceDescriptor(descriptor);
  };

  const handleSubmit = async (skipFace = false) => {
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, skipFace ? null : faceDescriptor);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
      setStep(1); // go back to form on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">₹</div>
        <h2>Create your account</h2>
        <div className="sub">Start tracking expenses in minutes</div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, margin: '16px 0', justifyContent: 'center' }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                width: 28, height: 6, borderRadius: 3,
                background: step >= s ? 'var(--teal)' : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleFormNext}>
            <div className="field-label">Full Name</div>
            <input
              className="field"
              type="text"
              placeholder="Krish Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              minLength={6}
              required
            />

            {error && <div className="error-text">{error}</div>}

            <button className="btn-primary" type="submit">
              Next: Setup Face Login →
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="sub-text" style={{ marginBottom: 16, textAlign: 'center' }}>
              📸 Capture your face for quick face login (optional)
            </div>

            <FaceCapture onCapture={handleFaceCaptured} buttonLabel="Capture Face" />

            {faceDescriptor && (
              <div style={{ color: 'var(--teal)', fontSize: 13, textAlign: 'center', margin: '10px 0', fontWeight: 600 }}>
                ✅ Face captured! Click "Create Account" to finish.
              </div>
            )}

            {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}

            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => handleSubmit(false)}
              disabled={loading || !faceDescriptor}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 10, width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              Skip face setup, register without it
            </button>

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginTop: 8, display: 'block', width: '100%' }}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </div>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="link">Log in</Link>
        </div>
      </div>
    </div>
  );
}
