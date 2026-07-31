import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { jurnalService } from '../../services/jurnal';
import type { JurnalInput } from '../../services/jurnal';
import { Modal } from '../../components/ui/Modal';
import { JurnalForm } from './JurnalForm';

export function JurnalPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tanggalFilter, setTanggalFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await jurnalService.getAll(tanggalFilter ? { tanggal: tanggalFilter } : {});
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tanggalFilter]);

  const handleSubmit = async (input: JurnalInput) => {
    await jurnalService.create(input);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jurnal ini beserta presensinya?')) return;
    await jurnalService.remove(id);
    load();
  };

  const formatTanggal = (t: string) =>
    new Date(t).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jurnal Mengajar</h1>
          <p className="text-slate-500 mt-1">Catatan mengajar dan presensi siswa</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
          <Plus size={18} /> Isi Jurnal
        </button>
      </div>

      <div className="mb-4 max-w-xs">
        <label className="block text-sm font-medium text-slate-700 mb-1">Filter Tanggal</label>
        <input type="date" value={tanggalFilter} onChange={(e) => setTanggalFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Memuat...</p>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-400">Belum ada jurnal. Klik "Isi Jurnal" untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((j) => (
            <div key={j.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{j.kelas?.nama_lengkap}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">{j.mata_pelajaran?.nama}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-600">Jam ke-{j.jam_ke}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{formatTanggal(j.tanggal)} • {j.guru?.name}</p>
                <p className="text-sm text-slate-700 mt-2 line-clamp-2">{j.materi}</p>
                <p className="text-xs text-slate-400 mt-1">{j.presensi_count} siswa dipresensi</p>
              </div>
              <button onClick={() => handleDelete(j.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition shrink-0" title="Hapus">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Isi Jurnal & Presensi">
        <JurnalForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}