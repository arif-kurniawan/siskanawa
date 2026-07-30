import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { guruService } from '../../services/guru';
import type { Guru, GuruInput } from '../../services/guru';
import { Modal } from '../../components/ui/Modal';
import { GuruForm } from './GuruForm';

export function GuruPage() {
  const [data, setData] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guru | null>(null);

  const load = async (searchTerm?: string, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await guruService.getAll({ search: searchTerm, page: pageNum });
      setData(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
      setPage(res.meta.current_page);
    } catch (err) {
      console.error('Gagal memuat guru:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search, 1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (g: Guru) => { setEditing(g); setModalOpen(true); };

  const handleSubmit = async (input: GuruInput) => {
    if (editing) {
      await guruService.update(editing.id, input);
    } else {
      await guruService.create(input);
    }
    setModalOpen(false);
    load(search, page);
  };

  const handleDelete = async (g: Guru) => {
    if (!confirm(`Hapus guru "${g.nama}"? Akun login-nya juga akan dihapus.`)) return;
    try {
      await guruService.remove(g.id);
      load(search, page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Guru</h1>
          <p className="text-slate-500 mt-1">{total} guru terdaftar</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
          <Plus size={18} /> Tambah Guru
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / NIP..." className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">NIP</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Nama</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Status Kepegawaian</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Jenis Kelamin</th>
                <th className="text-right font-semibold text-slate-600 px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-8">Belum ada data guru.</td></tr>
              ) : (
                data.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-600">{g.nip || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{g.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{g.status_kepegawaian || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{g.jenis_kelamin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(g)} className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(g)} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">Halaman {page} dari {lastPage}</span>
            <div className="flex gap-1">
              <button
                onClick={() => load(search, page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => load(search, page + 1)}
                disabled={page >= lastPage}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Guru' : 'Tambah Guru'}>
        <GuruForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}