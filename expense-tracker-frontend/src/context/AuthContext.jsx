import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // App load hote hi localStorage se pehle se saved user/token check karo
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  // Axios interceptor ka auth:logout event sun — React Router se navigate karo
  useEffect(() => {
    const handler = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [navigate]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data);
    return data;
  };

  const register = async (name, email, password, faceDescriptor = null) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveSession(data);
    if (faceDescriptor) {
      try {
        // Pass token explicitly — don't rely on localStorage timing
        await api.post(
          '/auth/face/register',
          { descriptor: Array.from(faceDescriptor) },
          { headers: { Authorization: `Bearer ${data.access_token}` } },
        );
      } catch (faceErr) {
        // Registration succeeded, face save failed — log it but don't block user
        console.error('Face save failed:', faceErr?.response?.data || faceErr.message);
      }
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const saveSession = (data) => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook - kisi bhi component me useAuth() likh kar user/login/logout mil jayega
export function useAuth() {
  return useContext(AuthContext);
}
