import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { jurusanService } from '../../services/jurusan';
import type { Jurusan, JurusanInput } from '../../services/jurusan';
import { Modal } from '../../components/ui/Modal';
import { JurusanForm } from './JurusanForm';

export function JurusanPage() {
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Jurusan | null>(null);

  const loadJurusan = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const data = await jurusanService.getAll(searchTerm);
      setJurusan(data);
    } catch (err) {
      console.error('Gagal memuat jurusan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJurusan();
  }, []);

  // Debounce pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      loadJurusan(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (j: Jurusan) => {
    setEditing(j);
    setModalOpen(true);
  };

  const handleSubmit = async (data: JurusanInput) => {
    if (editing) {
      await jurusanService.update(editing.id, data);
    } else {
      await jurusanService.create(data);
    }
    setModalOpen(false);
    loadJurusan(search);
  };

  const handleDelete = async (j: Jurusan) => {
    if (!confirm(`Hapus jurusan "${j.nama}"?`)) return;
    try {
      await jurusanService.remove(j.id);
      loadJurusan(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus jurusan.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Jurusan</h1>
          <p className="text-slate-500 mt-1">Kelola program keahlian sekolah</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          <Plus size={18} />
          Tambah Jurusan
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari jurusan..."
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
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Nama Jurusan</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Siswa</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
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
              ) : jurusan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    Belum ada data jurusan. Klik "Tambah Jurusan" untuk memulai.
                  </td>
                </tr>
              ) : (
                jurusan.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-brand-600">{j.kode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{j.nama}</td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{j.jumlah_siswa ?? 0}</td>
                    <td className="px-4 py-3">
                      {j.is_active ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(j)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(j)}
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
        title={editing ? 'Edit Jurusan' : 'Tambah Jurusan'}
      >
        <JurusanForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}