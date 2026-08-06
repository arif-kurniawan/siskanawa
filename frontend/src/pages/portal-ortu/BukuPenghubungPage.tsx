import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, School, MessageCircle } from 'lucide-react';
import { portalOrtuService, type CatatanOrtu } from '../../services/portalOrtu';

export function BukuPenghubungPage() {
  const { siswaId } = useParams<{ siswaId: string }>();
  const navigate = useNavigate();

  const [catatan, setCatatan] = useState<CatatanOrtu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State balasan per catatan (id catatan -> teks)
  const [balasanText, setBalasanText] = useState<Record<number, string>>({});
  const [mengirim, setMengirim] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!siswaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await portalOrtuService.bukuPenghubung(Number(siswaId));
      setCatatan(res.catatan);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Anda tidak berhak mengakses data ini.'
          : 'Gagal memuat buku penghubung.'
      );
    } finally {
      setLoading(false);
    }
  }, [siswaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBalas = async (tindakLanjutId: number) => {
    const isi = (balasanText[tindakLanjutId] || '').trim();
    if (!isi) return;

    setMengirim(tindakLanjutId);
    try {
      await portalOrtuService.balas(tindakLanjutId, isi);
      setBalasanText((prev) => ({ ...prev, [tindakLanjutId]: '' }));
      loadData(); // muat ulang supaya balasan muncul
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim balasan.');
    } finally {
      setMengirim(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Kembali */}
      <button
        onClick={() => navigate('/portal-ortu')}
        className="flex items-center gap-1 text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Anak
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <MessageCircle className="h-5 w-5 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Pesan dari Sekolah</h1>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="py-10 text-center text-slate-500">Memuat pesan...</p>
      ) : catatan.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Belum ada pesan dari sekolah untuk saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {catatan.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Pesan dari sekolah */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100">
                    <School className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-slate-900">{c.dari}</p>
                      <span className="shrink-0 text-xs text-slate-400">{c.tanggal}</span>
                    </div>
                    {c.kasus_judul && (
                      <p className="text-xs text-slate-400 mb-1">Terkait: {c.kasus_judul}</p>
                    )}
                    <p className="text-slate-700 whitespace-pre-line">{c.isi}</p>
                  </div>
                </div>
              </div>

              {/* Balasan yang sudah ada */}
              {c.respons.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                  {c.respons.map((r) => (
                    <div key={r.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                        {r.dari.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{r.dari}</p>
                          <span className="shrink-0 text-xs text-slate-400">{r.tanggal}</span>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{r.isi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form balasan */}
              <div className="border-t border-slate-100 p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={balasanText[c.id] || ''}
                    onChange={(e) =>
                      setBalasanText((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    rows={2}
                    placeholder="Tulis balasan Anda..."
                    className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleBalas(c.id)}
                    disabled={mengirim === c.id || !(balasanText[c.id] || '').trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                    title="Kirim balasan"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}