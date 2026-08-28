import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => 'side-item' + (isActive ? ' active' : '');

  return (
    <div className="sidebar">
      <div className="brand">💰 ExpenseTrack</div>
      <NavLink to="/dashboard" className={linkClass}>🏠 &nbsp;Dashboard</NavLink>
      <NavLink to="/add-expense" className={linkClass}>➕ &nbsp;Add Expense</NavLink>
      <NavLink to="/expenses" className={linkClass}>📄 &nbsp;All Expenses</NavLink>
      <NavLink to="/reports" className={linkClass}>📈 &nbsp;Reports</NavLink>
      {/* <NavLink to="/face-setup" className={linkClass}>🙂 &nbsp;Face Login Setup</NavLink> */}
      <div className="side-item" onClick={handleLogout}>🚪 &nbsp;Logout</div>
    </div>
  );
}
