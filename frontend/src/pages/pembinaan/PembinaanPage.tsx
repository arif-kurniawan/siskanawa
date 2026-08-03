import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pembinaanService } from '../../services/pembinaan';
import type { Kasus, KasusInput } from '../../services/pembinaan';
import { Modal } from '../../components/ui/Modal';
import { KasusForm } from './KasusForm';

export function PembinaanPage() {
  const [data, setData] = useState<Kasus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await pembinaanService.getAll(statusFilter ? { status: statusFilter } : {});
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

    const handleSubmit = async (input: KasusInput) => {
        await pembinaanService.create(input);
        setModalOpen(false);
        load();
    };

  useEffect(() => { load(); }, [statusFilter]);

  const tingkatBadge = (t: string) => ({
    ringan: 'bg-blue-100 text-blue-700',
    sedang: 'bg-amber-100 text-amber-700',
    berat: 'bg-red-100 text-red-700',
  }[t] || 'bg-slate-100');

  const statusBadge = (s: string) => ({
    baru: 'bg-purple-100 text-purple-700',
    ditangani: 'bg-blue-100 text-blue-700',
    dipantau: 'bg-amber-100 text-amber-700',
    selesai: 'bg-green-100 text-green-700',
  }[s] || 'bg-slate-100');

  const kategoriLabel = (k: string) => ({
    kehadiran: 'Kehadiran', akademik: 'Akademik', etika: 'Etika',
    poin_tatib: 'Poin Tatib', lainnya: 'Lainnya',
  }[k] || k);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pembinaan Siswa</h1>
          <p className="text-slate-500 mt-1">Penanganan dan pemantauan siswa yang perlu perhatian</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
          <Plus size={18} /> Buat Kasus
        </button>
      </div>

      {/* Filter status */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'baru', 'ditangani', 'dipantau', 'selesai'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Memuat...</p>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-400">Belum ada kasus pembinaan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((k) => (
            <button
              key={k.id}
              onClick={() => navigate(`/pembinaan/${k.id}`)}
              className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 transition flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{k.siswa?.user?.name}</span>
                  <span className="text-xs text-slate-400">{k.siswa?.kelas?.nama_lengkap}</span>
                  {k.is_rahasia && <Lock size={14} className="text-red-500" />}
                </div>
                <p className="text-sm text-slate-700 mt-1 truncate">{k.judul}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tingkatBadge(k.tingkat)}`}>{k.tingkat}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(k.status)}`}>{k.status}</span>
                  <span className="text-xs text-slate-400">{kategoriLabel(k.kategori)}</span>
                  <span className="text-xs text-slate-400">• Level: {k.level_penanganan}</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Kasus Pembinaan">
        <KasusForm
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
        />
        </Modal>
    </div>
  );
}