import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { kelasService } from '../../services/kelas';
import type { Kelas, KelasInput } from '../../services/kelas';
import { Modal } from '../../components/ui/Modal';
import { KelasForm } from './KelasForm';

export function KelasPage() {
  const [data, setData] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Kelas | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setData(await kelasService.getAll());
    } catch (err) {
      console.error('Gagal memuat kelas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (k: Kelas) => { setEditing(k); setModalOpen(true); };

  const handleSubmit = async (input: KelasInput) => {
    if (editing) {
      await kelasService.update(editing.id, input);
    } else {
      await kelasService.create(input);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (k: Kelas) => {
    if (!confirm(`Hapus kelas "${k.nama_lengkap}"?`)) return;
    try {
      await kelasService.remove(k.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Kelas</h1>
          <p className="text-slate-500 mt-1">Kelola rombongan belajar</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          <Plus size={18} />
          Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kelas</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Tahun Ajaran</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Wali Kelas</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Siswa</th>
                <th className="text-right font-semibold text-slate-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Belum ada data kelas.</td></tr>
              ) : (
                data.map((k) => (
                  <tr key={k.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{k.nama_lengkap}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {k.tahun_ajaran?.nama} <span className="capitalize text-slate-400">({k.tahun_ajaran?.semester})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {k.wali_kelas?.name || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{k.jumlah_siswa ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(k)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(k)}
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
        title={editing ? 'Edit Kelas' : 'Tambah Kelas'}
      >
        <KelasForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}