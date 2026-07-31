import { useState, useEffect } from 'react';
import { jurnalService } from '../../services/jurnal';
import type { JurnalInput, StatusKehadiran, SiswaKelas } from '../../services/jurnal';
import { optionKelasService } from '../../services/siswa';
import type { OptionKelas } from '../../services/siswa';

interface OptionMapel { id: number; kode: string; nama: string; }

interface Props {
  onSubmit: (data: JurnalInput) => Promise<void>;
  onCancel: () => void;
}

// Baris presensi per siswa
interface PresensiRow {
  siswa_id: number;
  nis: string;
  nama: string;
  status: StatusKehadiran;
  keterangan: string;
}

const statusOptions: { value: StatusKehadiran; label: string; color: string }[] = [
  { value: 'hadir', label: 'H', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'izin', label: 'I', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'sakit', label: 'S', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'alpa', label: 'A', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'dispensasi', label: 'D', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export function JurnalForm({ onSubmit, onCancel }: Props) {
  const [kelasId, setKelasId] = useState<number | ''>('');
  const [mapelId, setMapelId] = useState<number | ''>('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jamKe, setJamKe] = useState(1);
  const [materi, setMateri] = useState('');
  const [catatan, setCatatan] = useState('');
  const [presensi, setPresensi] = useState<PresensiRow[]>([]);

  const [kelasOpts, setKelasOpts] = useState<OptionKelas[]>([]);
  const [mapelOpts, setMapelOpts] = useState<OptionMapel[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Muat dropdown kelas & mapel
  useEffect(() => {
    const load = async () => {
      try {
        const [kelas, mapelRes] = await Promise.all([
          optionKelasService.kelas(),
          apiClientMapel(),
        ]);
        setKelasOpts(kelas);
        setMapelOpts(mapelRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOpts(false);
      }
    };
    load();
  }, []);

  // Saat kelas dipilih, muat daftar siswa kelas itu
  useEffect(() => {
    if (!kelasId) {
      setPresensi([]);
      return;
    }
    const loadSiswa = async () => {
      setLoadingSiswa(true);
      try {
        const siswa = await jurnalService.siswaByKelas(Number(kelasId));
        // Default semua hadir
        setPresensi(
          siswa.map((s: SiswaKelas) => ({
            siswa_id: s.id,
            nis: s.nis,
            nama: s.nama,
            status: 'hadir' as StatusKehadiran,
            keterangan: '',
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSiswa(false);
      }
    };
    loadSiswa();
  }, [kelasId]);

  const setStatus = (siswaId: number, status: StatusKehadiran) => {
    setPresensi((prev) =>
      prev.map((p) => (p.siswa_id === siswaId ? { ...p, status } : p))
    );
  };

  /**
    const setKeterangan = (siswaId: number, keterangan: string) => {
    setPresensi((prev) =>
      prev.map((p) => (p.siswa_id === siswaId ? { ...p, keterangan } : p))
    );
   */
  

  // Tombol cepat: tandai semua hadir
  const semuaHadir = () => {
    setPresensi((prev) => prev.map((p) => ({ ...p, status: 'hadir' as StatusKehadiran })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!kelasId || !mapelId) {
      setError('Kelas dan mata pelajaran wajib dipilih.');
      return;
    }
    if (presensi.length === 0) {
      setError('Belum ada siswa untuk dipresensi.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        kelas_id: Number(kelasId),
        mata_pelajaran_id: Number(mapelId),
        tanggal,
        jam_ke: jamKe,
        materi,
        catatan: catatan || undefined,
        presensi: presensi.map((p) => ({
          siswa_id: p.siswa_id,
          status: p.status,
          keterangan: p.keterangan || undefined,
        })),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan jurnal.');
    } finally {
      setLoading(false);
    }
  };

  // Hitung rekap untuk ditampilkan
  const rekap = presensi.reduce(
    (acc, p) => {
      acc[p.status]++;
      return acc;
    },
    { hadir: 0, izin: 0, sakit: 0, alpa: 0, dispensasi: 0 } as Record<StatusKehadiran, number>
  );

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';

  if (loadingOpts) return <p className="text-center text-slate-400 py-4">Memuat...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Info jurnal */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
          <select value={kelasId} onChange={(e) => setKelasId(e.target.value ? Number(e.target.value) : '')} className={inputClass}>
            <option value="">— Pilih Kelas —</option>
            {kelasOpts.map((k) => <option key={k.id} value={k.id}>{k.nama_lengkap}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran</label>
          <select value={mapelId} onChange={(e) => setMapelId(e.target.value ? Number(e.target.value) : '')} className={inputClass}>
            <option value="">— Pilih Mapel —</option>
            {mapelOpts.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jam ke-</label>
          <input type="number" min={1} max={12} value={jamKe} onChange={(e) => setJamKe(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Materi yang Diajarkan</label>
        <textarea value={materi} onChange={(e) => setMateri(e.target.value)} className={inputClass} rows={2} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan <span className="text-slate-400">(opsional)</span></label>
        <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} className={inputClass} rows={2} />
      </div>

      {/* Presensi */}
      {kelasId && (
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Presensi Siswa</h3>
            <button type="button" onClick={semuaHadir} className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition">
              Tandai Semua Hadir
            </button>
          </div>

          {/* Rekap ringkas */}
          <div className="flex gap-2 mb-3 text-xs">
            <span className="px-2 py-1 rounded bg-green-50 text-green-700">H: {rekap.hadir}</span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">I: {rekap.izin}</span>
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-700">S: {rekap.sakit}</span>
            <span className="px-2 py-1 rounded bg-red-50 text-red-700">A: {rekap.alpa}</span>
            <span className="px-2 py-1 rounded bg-purple-50 text-purple-700">D: {rekap.dispensasi}</span>
          </div>

          {loadingSiswa ? (
            <p className="text-center text-slate-400 py-4">Memuat siswa...</p>
          ) : presensi.length === 0 ? (
            <p className="text-center text-slate-400 py-4 text-sm">Kelas ini belum punya siswa.</p>
          ) : (
            <div className="space-y-2">
              {presensi.map((p, idx) => (
                <div key={p.siswa_id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <span className="text-xs text-slate-400 w-6">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.nama}</p>
                    <p className="text-xs text-slate-400">{p.nis}</p>
                  </div>
                  <div className="flex gap-1">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(p.siswa_id, opt.value)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition ${
                          p.status === opt.value
                            ? opt.color
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                        title={opt.value}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-accent-500">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">Batal</button>
        <button type="submit" disabled={loading || !kelasId} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan Jurnal & Presensi'}
        </button>
      </div>
    </form>
  );
}

// Helper ambil mapel (bisa dipindah ke service)
async function apiClientMapel(): Promise<OptionMapel[]> {
  const { default: apiClient } = await import('../../lib/axios');
  const response = await apiClient.get('/api/options/mata-pelajaran');
  return response.data;
}