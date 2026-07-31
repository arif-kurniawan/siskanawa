import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import apiClient from '../../lib/axios';
import { penugasanService } from '../../services/penugasan';
import type { Penugasan, PenugasanInput } from '../../services/penugasan';
import { optionKelasService } from '../../services/siswa';
import type { OptionKelas } from '../../services/siswa';
import { Modal } from '../../components/ui/Modal';

// Tipe untuk dropdown yang belum ada di service lain
interface OptionGuru {
  id: number;
  name: string;
}
interface OptionMapel {
  id: number;
  kode: string;
  nama: string;
}
interface OptionTahunAjaran {
  id: number;
  nama: string;
  semester: string;
  is_active: boolean;
}

export function PenugasanPage() {
  const [data, setData] = useState<Penugasan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await penugasanService.getAll();
      setData(result);
    } catch (err) {
      console.error('Gagal memuat penugasan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p: Penugasan) => {
    if (!confirm(`Hapus penugasan ${p.guru.name} — ${p.mata_pelajaran.nama} di ${p.kelas.nama_lengkap}?`)) return;
    try {
      await penugasanService.remove(p.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus penugasan.');
    }
  };

  const handleSubmit = async (input: PenugasanInput) => {
    await penugasanService.create(input);
    setModalOpen(false);
    load();
  };

  // Filter di sisi klien berdasarkan pencarian (nama guru / mapel / kelas)
  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.guru.name.toLowerCase().includes(q) ||
      p.mata_pelajaran.nama.toLowerCase().includes(q) ||
      p.kelas.nama_lengkap.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Penugasan Mengajar</h1>
          <p className="text-slate-500 mt-1">Atur guru mengampu mata pelajaran di kelas tertentu</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          <Plus size={18} />
          Tambah Penugasan
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari guru / mapel / kelas..."
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Guru</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Mata Pelajaran</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kelas</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Tahun Ajaran</th>
                <th className="text-right font-semibold text-slate-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">Memuat data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    {search ? 'Tidak ada penugasan yang cocok.' : 'Belum ada penugasan mengajar.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.guru.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.mata_pelajaran.nama}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand-600">{p.kelas.nama_lengkap}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.tahun_ajaran.nama}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Penugasan Mengajar"
      >
        <PenugasanForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

// ============================================================
// Form Penugasan (di file yang sama supaya ringkas)
// ============================================================

interface PenugasanFormProps {
  onSubmit: (data: PenugasanInput) => Promise<void>;
  onCancel: () => void;
}

function PenugasanForm({ onSubmit, onCancel }: PenugasanFormProps) {
  const [guruId, setGuruId] = useState<number | ''>('');
  const [mapelId, setMapelId] = useState<number | ''>('');
  const [kelasId, setKelasId] = useState<number | ''>('');
  const [tahunAjaranId, setTahunAjaranId] = useState<number | ''>('');

  const [guruOpts, setGuruOpts] = useState<OptionGuru[]>([]);
  const [mapelOpts, setMapelOpts] = useState<OptionMapel[]>([]);
  const [kelasOpts, setKelasOpts] = useState<OptionKelas[]>([]);
  const [taOpts, setTaOpts] = useState<OptionTahunAjaran[]>([]);

  const [loadingOpts, setLoadingOpts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Muat semua dropdown paralel
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [guru, mapel, kelas, ta] = await Promise.all([
          apiClient.get('/api/options/guru').then((r) => r.data),
          apiClient.get('/api/options/mata-pelajaran').then((r) => r.data),
          optionKelasService.kelas(),
          apiClient.get('/api/options/tahun-ajaran').then((r) => r.data),
        ]);
        setGuruOpts(guru);
        setMapelOpts(mapel);
        setKelasOpts(kelas);
        setTaOpts(ta);

        // Default tahun ajaran = yang aktif
        const aktif = (ta as OptionTahunAjaran[]).find((t) => t.is_active);
        if (aktif) setTahunAjaranId(aktif.id);
      } catch (err) {
        console.error('Gagal memuat opsi:', err);
        setError('Gagal memuat pilihan. Coba tutup dan buka lagi.');
      } finally {
        setLoadingOpts(false);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!guruId || !mapelId || !kelasId || !tahunAjaranId) {
      setError('Semua field wajib dipilih.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        guru_id: Number(guruId),
        mata_pelajaran_id: Number(mapelId),
        kelas_id: Number(kelasId),
        tahun_ajaran_id: Number(tahunAjaranId),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan penugasan.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';

  if (loadingOpts) {
    return <p className="text-center text-slate-400 py-4">Memuat pilihan...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Guru</label>
        <select
          value={guruId}
          onChange={(e) => setGuruId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Guru —</option>
          {guruOpts.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mata Pelajaran</label>
        <select
          value={mapelId}
          onChange={(e) => setMapelId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Mata Pelajaran —</option>
          {mapelOpts.map((m) => (
            <option key={m.id} value={m.id}>{m.kode} - {m.nama}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Kelas —</option>
          {kelasOpts.map((k) => (
            <option key={k.id} value={k.id}>{k.nama_lengkap}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
        <select
          value={tahunAjaranId}
          onChange={(e) => setTahunAjaranId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Tahun Ajaran —</option>
          {taOpts.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama} - {t.semester}{t.is_active ? ' (Aktif)' : ''}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-accent-500">{error}</p>}

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
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}