import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  HeartHandshake,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  roles?: string[];
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasRole } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  );

  return (
    <>
      {/* Overlay gelap — hanya muncul di HP saat drawer terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-brand-500 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-siskanawa.png" alt="Logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-base font-bold leading-tight">SIM SMKN 9</h1>
              <p className="text-xs text-white/60">Malang</p>
            </div>
          </div>
          {/* Tombol tutup — hanya di HP */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
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
    </>
  );
}