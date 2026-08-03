import { useState, useEffect } from 'react';
import apiClient from '../../lib/axios';
import type { KasusInput, Kategori, Tingkat } from '../../services/pembinaan';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  onSubmit: (data: KasusInput) => Promise<void>;
  onCancel: () => void;
}

interface SiswaOption {
  id: number;
  nis: string;
  nama: string;
  kelas: string | null;
}

export function KasusForm({ onSubmit, onCancel }: Props) {
  const { hasRole } = useAuth();
  const bolehRahasia = hasRole('guru_bk') || hasRole('kepala_sekolah');

  const [siswaId, setSiswaId] = useState<number | ''>('');
  const [siswaTerpilih, setSiswaTerpilih] = useState<SiswaOption | null>(null);
  const [kategori, setKategori] = useState<Kategori>('kehadiran');
  const [tingkat, setTingkat] = useState<Tingkat>('ringan');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isRahasia, setIsRahasia] = useState(false);

  // Pencarian siswa
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<SiswaOption[]>([]);
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');

  // Cari siswa dengan debounce (pakai endpoint cari-siswa dari modul presensi sholat,
  // atau endpoint siswa umum — di sini pakai /api/siswa dengan param search)
  useEffect(() => {
    if (searchQ.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get('/api/siswa', { params: { search: searchQ } });
        // response siswa pakai pagination: res.data.data
        const list = (res.data.data || []).map((s: any) => ({
          id: s.id,
          nis: s.nis,
          nama: s.nama,
          kelas: s.kelas?.nama_lengkap ?? null,
        }));
        setSearchResults(list);
      } catch (err) {
        console.error('Gagal mencari siswa:', err);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const pilihSiswa = (s: SiswaOption) => {
    setSiswaId(s.id);
    setSiswaTerpilih(s);
    setSearchQ('');
    setSearchResults([]);
  };

  const gantiSiswa = () => {
    setSiswaId('');
    setSiswaTerpilih(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!siswaId) {
      setError('Pilih siswa terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        siswa_id: Number(siswaId),
        kategori,
        tingkat,
        judul,
        deskripsi,
        is_rahasia: bolehRahasia ? isRahasia : false,
      });
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan kasus.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';
  const errClass = 'text-sm text-accent-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {/* Pilih siswa */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Siswa</label>
        {siswaTerpilih ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50 border border-brand-100">
            <div>
              <p className="font-medium text-slate-800">{siswaTerpilih.nama}</p>
              <p className="text-xs text-slate-500">{siswaTerpilih.nis} • {siswaTerpilih.kelas || 'Tanpa kelas'}</p>
            </div>
            <button type="button" onClick={gantiSiswa} className="text-sm text-brand-600 hover:underline">
              Ganti
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Ketik nama atau NIS siswa..."
              className={inputClass}
            />
            {searching && <p className="text-xs text-slate-400 mt-1">Mencari...</p>}
            {searchResults.length > 0 && (
              <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pilihSiswa(s)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-slate-800">{s.nama}</p>
                    <p className="text-xs text-slate-400">{s.nis} • {s.kelas || 'Tanpa kelas'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kategori & Tingkat */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select value={kategori} onChange={(e) => setKategori(e.target.value as Kategori)} className={inputClass}>
            <option value="kehadiran">Kehadiran</option>
            <option value="akademik">Akademik</option>
            <option value="etika">Etika / Perilaku</option>
            <option value="poin_tatib">Poin Tatib</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
          <select value={tingkat} onChange={(e) => setTingkat(e.target.value as Tingkat)} className={inputClass}>
            <option value="ringan">Ringan</option>
            <option value="sedang">Sedang</option>
            <option value="berat">Berat</option>
          </select>
        </div>
      </div>

      {/* Judul */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Masalah</label>
        <input
          type="text"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className={inputClass}
          placeholder="Ringkasan singkat, mis. Sering terlambat masuk kelas"
          maxLength={150}
        />
        {errors.judul && <p className={errClass}>{errors.judul[0]}</p>}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className={inputClass}
          rows={4}
          placeholder="Jelaskan detail permasalahan yang ditemukan..."
        />
        {errors.deskripsi && <p className={errClass}>{errors.deskripsi[0]}</p>}
      </div>

      {/* Opsi rahasia — hanya untuk BK & kepsek */}
      {bolehRahasia && (
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRahasia}
              onChange={(e) => setIsRahasia(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-brand-500 focus:ring-brand-100"
            />
            <span className="text-sm text-slate-700">
              Tandai sebagai kasus rahasia
              <span className="block text-xs text-slate-400">
                Hanya guru BK dan kepala sekolah yang dapat melihat kasus ini.
              </span>
            </span>
          </label>
        </div>
      )}

      {error && <p className={errClass}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Buat Kasus'}
        </button>
      </div>
    </form>
  );
}