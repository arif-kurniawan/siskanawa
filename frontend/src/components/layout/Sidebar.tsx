import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  roles?: string[]; // kalau kosong, semua role bisa lihat
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Siswa', path: '/siswa', icon: GraduationCap, roles: ['kepala_sekolah', 'tendik', 'wali_kelas'] },
  { label: 'Data Guru', path: '/guru', icon: Users, roles: ['kepala_sekolah', 'tendik'] },
  { label: 'Jurusan', path: '/jurusan', icon: BookOpen, roles: ['kepala_sekolah', 'tendik'] },
  { label: 'PKL', path: '/pkl', icon: Building2, roles: ['kepala_sekolah', 'guru_mapel', 'siswa'] },
  { label: 'Bursa Kerja', path: '/bkk', icon: Briefcase, roles: ['kepala_sekolah', 'tendik', 'siswa'] },
  { label: 'Bimbingan Konseling', path: '/bk', icon: HeartHandshake, roles: ['kepala_sekolah', 'guru_bk'] },
];

export function Sidebar() {
  const { hasRole } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  );

  return (
    <aside className="w-64 bg-brand-500 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <img src="/logo-siskanawa.png" alt="Logo" className="h-9 w-auto" />
        <div>
            <h1 className="text-base font-bold leading-tight">SIM SMKN 9</h1>
            <p className="text-xs text-white/60">Malang</p>
        </div>
        </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}