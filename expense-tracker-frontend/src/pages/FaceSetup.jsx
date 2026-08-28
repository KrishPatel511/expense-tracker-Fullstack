import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FaceCapture from '../components/FaceCapture';
import api from '../api/axios';

export default function FaceSetup() {
  const [status, setStatus] = useState('idle'); // idle | saving | success | error
  const [message, setMessage] = useState('');

  const handleCapture = async (descriptor) => {
    setStatus('saving');
    setMessage('');
    try {
      await api.post('/auth/face/register', { descriptor: Array.from(descriptor) });
      setStatus('success');
      setMessage('Face register ho gaya! Ab tu Login page pe "Login with Face" use kar sakta hai.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Face register nahi ho paya.');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topline">
          <div>
            <h2>Face Login Setup</h2>
            <div className="sub-text">Apna chehra register kar taaki password ke bina bhi login kar sake</div>
          </div>
        </div>

        <div className="panel-card" style={{ maxWidth: 420 }}>
          <p className="sub-text" style={{ marginBottom: 20 }}>
            Camera ke saamne seedha dekho aur "Capture Face" pe click kar. Ye ek convenience feature hai —
            password login hamesha available rahega.
          </p>

          <FaceCapture onCapture={handleCapture} buttonLabel="Capture Face" />

          {status === 'saving' && <div className="loading-state">Saving...</div>}
          {status === 'success' && (
            <div style={{ color: 'var(--teal)', fontSize: 13, marginTop: 14, fontWeight: 600 }}>
              ✅ {message}
            </div>
          )}
          {status === 'error' && <div className="error-text" style={{ marginTop: 14 }}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
