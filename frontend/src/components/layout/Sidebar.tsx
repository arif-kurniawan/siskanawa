import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,

  GraduationCap,

  Database,

  ChevronDown,
  X,
} from 'lucide-react';
//belum terpakai : Users, BookOpen, Building2, Briefcase, HeartHandshake,CalendarDays, Layers,

import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type IconType = React.ComponentType<{ size?: number }>;

// Item menu bisa berupa link tunggal atau grup dengan submenu
interface MenuLink {
  type: 'link';
  label: string;
  path: string;
  icon: IconType;
  roles?: string[];
}

interface MenuGroup {
  type: 'group';
  label: string;
  icon: IconType;
  roles?: string[];
  children: {
    label: string;
    path: string;
    roles?: string[];
  }[];
}

type MenuItem = MenuLink | MenuGroup;

const menuItems: MenuItem[] = [
  {
    type: 'link',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    type: 'group',
    label: 'Master Data',
    icon: Database,
    roles: ['kepala_sekolah', 'tendik'],
    children: [
      { label: 'Jurusan', path: '/jurusan' },
      { label: 'Tahun Ajaran', path: '/tahun-ajaran' },
      { label: 'Kelas', path: '/kelas' },
      { label: 'Mata Pelajaran', path: '/mata-pelajaran' },
      { label: 'Data Siswa', path: '/siswa' },
      { label: 'Data Guru', path: '/guru' },
      { label: 'Data Tendik', path: '/tendik' },
    ],
  },
  {
    type: 'group',
    label: 'Kesiswaan',
    icon: GraduationCap,
    roles: ['kepala_sekolah', 'guru_bk', 'wali_kelas'],
    children: [
      { label: 'PKL', path: '/pkl' },
      { label: 'Bursa Kerja', path: '/bkk' },
      { label: 'Bimbingan Konseling', path: '/bk', roles: ['kepala_sekolah', 'guru_bk'] },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasRole } = useAuth();
  const location = useLocation();

  // Cek apakah user boleh lihat sebuah item (berdasarkan roles)
  const canSee = (roles?: string[]) => !roles || roles.some((r) => hasRole(r));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

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
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (!canSee(item.roles)) return null;

            if (item.type === 'link') {
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
            }

            // Grup dengan submenu
            return (
              <MenuGroupItem
                key={item.label}
                item={item}
                canSee={canSee}
                onNavigate={onClose}
                currentPath={location.pathname}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// Komponen terpisah untuk grup, supaya bisa punya state expand sendiri
interface MenuGroupItemProps {
  item: MenuGroup;
  canSee: (roles?: string[]) => boolean;
  onNavigate: () => void;
  currentPath: string;
}

function MenuGroupItem({ item, canSee, onNavigate, currentPath }: MenuGroupItemProps) {
  const visibleChildren = item.children.filter((c) => canSee(c.roles));

  // Kalau semua submenu tidak boleh dilihat, grup tidak ditampilkan
  if (visibleChildren.length === 0) return null;

  // Grup terbuka otomatis kalau salah satu submenu sedang aktif
  const hasActiveChild = visibleChildren.some((c) => currentPath === c.path);
  const [open, setOpen] = useState(hasActiveChild);

  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          hasActiveChild
            ? 'text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Submenu */}
      {open && (
        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
          {visibleChildren.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}