import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { tahunAjaranService } from '../../services/tahunAjaran';
import type { TahunAjaran, TahunAjaranInput } from '../../services/tahunAjaran';
import { Modal } from '../../components/ui/Modal';
import { TahunAjaranForm } from './TahunAjaranForm';

export function TahunAjaranPage() {
  const [data, setData] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TahunAjaran | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setData(await tahunAjaranService.getAll());
    } catch (err) {
      console.error('Gagal memuat tahun ajaran:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (ta: TahunAjaran) => {
    setEditing(ta);
    setModalOpen(true);
  };

  const handleSubmit = async (input: TahunAjaranInput) => {
    if (editing) {
      await tahunAjaranService.update(editing.id, input);
    } else {
      await tahunAjaranService.create(input);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (ta: TahunAjaran) => {
    if (!confirm(`Hapus tahun ajaran "${ta.nama} - ${ta.semester}"?`)) return;
    try {
      await tahunAjaranService.remove(ta.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  const handleSetActive = async (ta: TahunAjaran) => {
    try {
      await tahunAjaranService.setActive(ta.id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengaktifkan.');
    }
  };

  // Format tanggal jadi lebih enak dibaca
  const formatTanggal = (tgl: string) => {
    return new Date(tgl).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tahun Ajaran</h1>
          <p className="text-slate-500 mt-1">Kelola periode tahun ajaran dan semester</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition"
        >
          <Plus size={18} />
          Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Tahun Ajaran</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Semester</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Periode</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
                <th className="text-right font-semibold text-slate-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Belum ada data tahun ajaran.</td></tr>
              ) : (
                data.map((ta) => (
                  <tr key={ta.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{ta.nama}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{ta.semester}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatTanggal(ta.tanggal_mulai)} — {formatTanggal(ta.tanggal_selesai)}
                    </td>
                    <td className="px-4 py-3">
                      {ta.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 size={12} /> Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActive(ta)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="Klik untuk mengaktifkan"
                        >
                          <Circle size={12} /> Nonaktif
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(ta)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ta)}
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
        title={editing ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
      >
        <TahunAjaranForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}