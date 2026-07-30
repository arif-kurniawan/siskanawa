import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = roles[0]
    ?.split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      {/* Tombol hamburger — hanya di HP */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-600 hover:text-slate-900 -ml-1 p-1"
        aria-label="Buka menu"
      >
        <Menu size={24} />
      </button>

      {/* Spacer supaya bagian kanan tetap di kanan saat hamburger tidak ada (desktop) */}
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
          <UserIcon size={18} />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-slate-600 hover:text-accent-500 hover:bg-slate-50 rounded-lg transition-colors"
          title="Keluar"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}