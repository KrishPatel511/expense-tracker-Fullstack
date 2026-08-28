import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ExpenseList from './pages/ExpenseList';
import Reports from './pages/Reports';
import FaceSetup from './pages/FaceSetup';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/add-expense" element={
            <ProtectedRoute><AddExpense /></ProtectedRoute>
          } />
          <Route path="/edit-expense/:id" element={
            <ProtectedRoute><AddExpense /></ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute><ExpenseList /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          <Route path="/face-setup" element={
            <ProtectedRoute><FaceSetup /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
