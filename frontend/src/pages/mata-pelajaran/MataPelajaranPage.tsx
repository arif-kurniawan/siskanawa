import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { mataPelajaranService } from '../../services/mataPelajaran';
import type { MataPelajaran, MataPelajaranInput } from '../../services/mataPelajaran';
import { Modal } from '../../components/ui/Modal';
import { MataPelajaranForm } from './MataPelajaranForm';

export function MataPelajaranPage() {
  const [data, setData] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MataPelajaran | null>(null);

  const load = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await mataPelajaranService.getAll(searchTerm);
      setData(result);
    } catch (err) {
      console.error('Gagal memuat mata pelajaran:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Debounce pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      load(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (mapel: MataPelajaran) => {
    setEditing(mapel);
    setModalOpen(true);
  };

  const handleSubmit = async (input: MataPelajaranInput) => {
    if (editing) {
      await mataPelajaranService.update(editing.id, input);
    } else {
      await mataPelajaranService.create(input);
    }
    setModalOpen(false);
    load(search);
  };

  const handleDelete = async (mapel: MataPelajaran) => {
    if (!confirm(`Hapus mata pelajaran "${mapel.nama}"?`)) return;
    try {
      await mataPelajaranService.remove(mapel.id);
      load(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus mata pelajaran.');
    }
  };

  // Badge warna per kategori
  const kategoriBadge = (k: string) => {
    const map: Record<string, string> = {
      umum: 'bg-blue-100 text-blue-700',
      kejuruan: 'bg-brand-100 text-brand-700',
      muatan_lokal: 'bg-amber-100 text-amber-700',
    };
    return map[k] || 'bg-slate-100 text-slate-500';
  };

  // Label kategori jadi enak dibaca
  const kategoriLabel = (k: string) => {
    const map: Record<string, string> = {
      umum: 'Umum',
      kejuruan: 'Kejuruan',
      muatan_lokal: 'Muatan Lokal',
    };
    return map[k] || k;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mata Pelajaran</h1>
          <p className="text-slate-500 mt-1">Kelola daftar mata pelajaran sekolah</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          <Plus size={18} />
          Tambah Mapel
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari mata pelajaran..."
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kode</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Nama Mata Pelajaran</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kategori</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Jurusan</th>
                <th className="text-right font-semibold text-slate-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    Belum ada data mata pelajaran. Klik "Tambah Mapel" untuk memulai.
                  </td>
                </tr>
              ) : (
                data.map((mapel) => (
                  <tr key={mapel.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-brand-600">{mapel.kode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{mapel.nama}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${kategoriBadge(mapel.kategori)}`}>
                        {kategoriLabel(mapel.kategori)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {mapel.jurusan ? (
                        <span>{mapel.jurusan.kode}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(mapel)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mapel)}
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
        title={editing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
      >
        <MataPelajaranForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}