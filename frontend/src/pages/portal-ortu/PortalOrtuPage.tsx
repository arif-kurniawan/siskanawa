import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Bell } from 'lucide-react';
import { portalOrtuService, type AnakItem } from '../../services/portalOrtu';

export function PortalOrtuPage() {
  const navigate = useNavigate();
  const [anak, setAnak] = useState<AnakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalOrtuService
      .anakSaya()
      .then((res) => setAnak(res.anak))
      .catch(() => setError('Gagal memuat data. Silakan coba lagi.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
          <BookOpen className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buku Penghubung</h1>
          <p className="text-slate-500">Komunikasi sekolah dengan orang tua</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="py-10 text-center text-slate-500">Memuat data anak...</p>
      ) : anak.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Belum ada data anak yang terhubung dengan akun Anda. Silakan hubungi sekolah.
        </div>
      ) : (
        <div className="space-y-3">
          {anak.map((a) => (
            <button
              key={a.siswa_id}
              onClick={() => navigate(`/portal-ortu/anak/${a.siswa_id}`)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Avatar inisial */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                  {a.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{a.nama}</p>
                  <p className="text-sm text-slate-500">
                    {a.kelas} • NIS {a.nis}
                  </p>
                  <p className="text-xs capitalize text-slate-400">Sebagai {a.hubungan}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {a.perlu_perhatian > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    <Bell className="h-4 w-4" />
                    {a.perlu_perhatian}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info kecil */}
      {!loading && anak.length > 0 && (
        <p className="text-center text-sm text-slate-400">
          Ketuk nama anak untuk melihat pesan dari sekolah dan membalasnya.
        </p>
      )}
    </div>
  );
}