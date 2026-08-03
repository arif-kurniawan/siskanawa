import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, MessageSquare, FileText, ArrowUpCircle,
  RefreshCw, Send, Users, ChevronUp,
} from 'lucide-react';
import { pembinaanService} from '../../services/pembinaan';
import type { Kasus, TindakLanjut } from '../../services/pembinaan';
import { useAuth } from '../../contexts/AuthContext';

export function KasusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [kasus, setKasus] = useState<Kasus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form tambah tindak lanjut
  const [jenis, setJenis] = useState<'catatan' | 'komunikasi_ortu'>('catatan');
  const [isi, setIsi] = useState('');
  const [ditujukanKeOrtu, setDitujukanKeOrtu] = useState(false);
  const [ubahStatus, setUbahStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form eskalasi
  const [eskalasiMode, setEskalasiMode] = useState(false);
  const [catatanEskalasi, setCatatanEskalasi] = useState('');
  const [eskalasiLoading, setEskalasiLoading] = useState(false);

  const bolehEskalasi = hasRole('wali_kelas') || hasRole('guru_bk') || hasRole('kepala_sekolah');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await pembinaanService.getById(Number(id));
      setKasus(data);
    } catch (err: any) {
      setError(err.response?.status === 403
        ? 'Anda tidak memiliki akses ke kasus ini.'
        : 'Gagal memuat kasus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTambahTindakLanjut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim() || !id) return;
    setSubmitting(true);
    try {
      await pembinaanService.tambahTindakLanjut(Number(id), {
        jenis,
        isi,
        ditujukan_ke_ortu: ditujukanKeOrtu,
        ubah_status: ubahStatus || undefined,
      });
      // Reset form & reload
      setIsi('');
      setDitujukanKeOrtu(false);
      setUbahStatus('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah tindak lanjut.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEskalasi = async () => {
    if (!catatanEskalasi.trim() || !id) return;
    setEskalasiLoading(true);
    try {
      const res = await pembinaanService.eskalasi(Number(id), catatanEskalasi);
      alert(res.message);
      setEskalasiMode(false);
      setCatatanEskalasi('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengeskalasi.');
    } finally {
      setEskalasiLoading(false);
    }
  };

  // Label & warna helper
  const levelLabel = (l: string) => ({
    guru: 'Guru', wali_kelas: 'Wali Kelas', bk: 'Guru BK', kepala_sekolah: 'Kepala Sekolah',
  }[l] || l);

  const tingkatBadge = (t: string) => ({
    ringan: 'bg-blue-100 text-blue-700',
    sedang: 'bg-amber-100 text-amber-700',
    berat: 'bg-red-100 text-red-700',
  }[t] || 'bg-slate-100 text-slate-500');

  const statusBadge = (s: string) => ({
    baru: 'bg-purple-100 text-purple-700',
    ditangani: 'bg-blue-100 text-blue-700',
    dipantau: 'bg-amber-100 text-amber-700',
    selesai: 'bg-green-100 text-green-700',
  }[s] || 'bg-slate-100 text-slate-500');

  const kategoriLabel = (k: string) => ({
    kehadiran: 'Kehadiran', akademik: 'Akademik', etika: 'Etika / Perilaku',
    poin_tatib: 'Poin Tatib', lainnya: 'Lainnya',
  }[k] || k);

  // Ikon per jenis tindak lanjut
  const jenisIcon = (jenis: string) => {
    switch (jenis) {
      case 'catatan': return <FileText size={14} />;
      case 'komunikasi_ortu': return <MessageSquare size={14} />;
      case 'eskalasi': return <ArrowUpCircle size={14} />;
      case 'perubahan_status': return <RefreshCw size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const formatWaktu = (t: string) =>
    new Date(t).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) {
    return <p className="text-center text-slate-400 py-12">Memuat kasus...</p>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Lock className="mx-auto text-slate-300 mb-3" size={40} />
        <p className="text-slate-500">{error}</p>
        <button onClick={() => navigate('/pembinaan')} className="mt-4 text-brand-600 hover:underline text-sm">
          Kembali ke daftar
        </button>
      </div>
    );
  }

  if (!kasus) return null;

  const sudahLevelTertinggi = kasus.level_penanganan === 'kepala_sekolah';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <button onClick={() => navigate('/pembinaan')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-4">
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Info kasus */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{kasus.siswa?.user?.name}</h1>
              {kasus.is_rahasia && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <Lock size={12} /> Rahasia
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{kasus.siswa?.kelas?.nama_lengkap}</p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-semibold text-slate-800">{kasus.judul}</h2>
          <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{kasus.deskripsi}</p>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tingkatBadge(kasus.tingkat)}`}>
            {kasus.tingkat}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(kasus.status)}`}>
            {kasus.status}
          </span>
          <span className="text-xs text-slate-500">{kategoriLabel(kasus.kategori)}</span>
        </div>

        {/* Level penanganan (eskalasi) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
          <Users size={16} className="text-slate-400" />
          <span className="text-slate-500">Ditangani oleh:</span>
          <span className="font-medium text-brand-600">{levelLabel(kasus.level_penanganan)}</span>
          {kasus.pelapor && (
            <span className="text-slate-400 ml-auto text-xs">Dilaporkan: {kasus.pelapor.name}</span>
          )}
        </div>
      </div>

      {/* Tombol eskalasi */}
      {bolehEskalasi && !sudahLevelTertinggi && kasus.status !== 'selesai' && (
        <div className="mb-4">
          {!eskalasiMode ? (
            <button
              onClick={() => setEskalasiMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium text-sm transition border border-amber-200"
            >
              <ChevronUp size={16} /> Eskalasi ke level berikutnya
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">
                Eskalasi ke jenjang berikutnya
              </p>
              <textarea
                value={catatanEskalasi}
                onChange={(e) => setCatatanEskalasi(e.target.value)}
                placeholder="Alasan eskalasi..."
                className="w-full px-3 py-2 rounded-lg border border-amber-200 outline-none focus:ring-2 focus:ring-amber-100 text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setEskalasiMode(false); setCatatanEskalasi(''); }}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-white transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleEskalasi}
                  disabled={eskalasiLoading || !catatanEskalasi.trim()}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition disabled:opacity-60"
                >
                  {eskalasiLoading ? 'Memproses...' : 'Eskalasi'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Linimasa tindak lanjut */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4">Linimasa Penanganan</h2>

        {!kasus.tindak_lanjut || kasus.tindak_lanjut.length === 0 ? (
          <p className="text-center text-slate-400 py-4 text-sm">Belum ada tindak lanjut.</p>
        ) : (
          <div className="space-y-4">
            {kasus.tindak_lanjut.map((t: TindakLanjut, idx: number) => (
              <div key={t.id} className="flex gap-3">
                {/* Garis & titik linimasa */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    t.jenis === 'eskalasi' ? 'bg-amber-100 text-amber-600' :
                    t.jenis === 'komunikasi_ortu' ? 'bg-blue-100 text-blue-600' :
                    t.jenis === 'perubahan_status' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {jenisIcon(t.jenis)}
                  </div>
                  {idx < (kasus.tindak_lanjut?.length ?? 0) - 1 && (
                    <div className="w-px flex-1 bg-slate-200 my-1" />
                  )}
                </div>

                {/* Isi */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{t.user?.name}</span>
                    {t.jenis === 'komunikasi_ortu' && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600">Komunikasi Ortu</span>
                    )}
                    {t.ditujukan_ke_ortu && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-600">Terlihat Ortu</span>
                    )}
                    {t.jenis === 'eskalasi' && t.level_dari && t.level_ke && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-600">
                        {levelLabel(t.level_dari)} → {levelLabel(t.level_ke)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{t.isi}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatWaktu(t.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form tambah tindak lanjut — sembunyikan kalau kasus sudah selesai */}
      {kasus.status !== 'selesai' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Tambah Tindak Lanjut</h2>
          <form onSubmit={handleTambahTindakLanjut} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJenis('catatan')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${jenis === 'catatan' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Catatan Internal
              </button>
              <button
                type="button"
                onClick={() => setJenis('komunikasi_ortu')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${jenis === 'komunikasi_ortu' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Komunikasi Ortu
              </button>
            </div>

            <textarea
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder={jenis === 'catatan' ? 'Catatan penanganan...' : 'Isi komunikasi dengan orang tua...'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm"
              rows={3}
            />

            {jenis === 'komunikasi_ortu' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ditujukanKeOrtu}
                  onChange={(e) => setDitujukanKeOrtu(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-100"
                />
                <span className="text-sm text-slate-600">Tampilkan di portal orang tua (buku penghubung)</span>
              </label>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Ubah status:</label>
                <select
                  value={ubahStatus}
                  onChange={(e) => setUbahStatus(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">— Tidak diubah —</option>
                  <option value="ditangani">Ditangani</option>
                  <option value="dipantau">Dipantau</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !isi.trim()}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition disabled:opacity-60"
              >
                <Send size={16} /> {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {kasus.status === 'selesai' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-sm text-green-700 font-medium">Kasus ini telah selesai ditangani.</p>
        </div>
      )}
    </div>
  );
}