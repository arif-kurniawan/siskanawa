import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Topbar() {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Format role jadi lebih enak dibaca
  const roleLabel = roles[0]
    ?.split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
          <UserIcon size={18} />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-accent-500 hover:bg-slate-50 rounded-lg transition-colors"
          title="Keluar"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </header>
  );
}