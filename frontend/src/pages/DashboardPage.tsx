import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, roles, permissions, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        <h2>Selamat datang, {user?.name}</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Peran:</strong> {roles.join(', ')}</p>
        <p><strong>Hak akses:</strong></p>
        <ul>
          {permissions.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}