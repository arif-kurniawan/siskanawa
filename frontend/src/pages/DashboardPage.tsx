import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Users, BookOpen, Building2 } from 'lucide-react';

export function DashboardPage() {
  const { user, roles } = useAuth();

  const roleLabel = roles[0]
    ?.split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || '';

  // Data statistik dummy — nanti diganti data asli dari API
  const stats = [
    { label: 'Total Siswa', value: '1.080', icon: GraduationCap, hint: '5 jurusan aktif' },
    { label: 'Guru & Tendik', value: '112', icon: Users, hint: '90 guru, 22 tendik' },
    { label: 'Rombel', value: '30', icon: BookOpen, hint: '10 per angkatan' },
    { label: 'Mitra DUDI', value: '48', icon: Building2, hint: 'Untuk PKL' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat datang, {user?.name}
        </h1>
        <p className="text-slate-500 mt-1">
          Anda masuk sebagai {roleLabel}. Berikut ringkasan data sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500">
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-4 tabular-nums">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-600 mt-1">
                {stat.label}
              </p>
              <p className="text-xs text-slate-400 mt-1">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800">Mulai dari sini</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sistem masih dalam pengembangan. Modul akan ditambahkan bertahap:
          data akademik, PKL, bursa kerja, dan bimbingan konseling.
        </p>
      </div>
    </div>
  );
}