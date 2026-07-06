import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ye component check karta hai ki user login hai ya nahi
// Agar nahi hai to seedha /login pe bhej deta hai
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
