import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, ShieldAlert } from 'lucide-react';
import {
  tatibService,
  type JenisPelanggaran,
  type PasalOption,
  type JenisOption,
} from '../../services/tatib';
import { Modal } from '../../components/ui/Modal';
import { JenisPelanggaranForm } from './JenisPelanggaranForm';

// Warna badge per tingkat keparahan
function jenisBadgeClass(kode?: string): string {
  switch (kode) {
    case 'HARIAN':
      return 'bg-slate-100 text-slate-700';
    case 'KHUSUS':
      return 'bg-amber-100 text-amber-800';
    case 'BERAT':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function JenisPelanggaranPage() {
  const [data, setData] = useState<JenisPelanggaran[]>([]);
  const [pasalOptions, setPasalOptions] = useState<PasalOption[]>([]);
  const [jenisOptions, setJenisOptions] = useState<JenisOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [search, setSearch] = useState('');
  const [filterPasal, setFilterPasal] = useState<number | ''>('');
  const [filterJenis, setFilterJenis] = useState<number | ''>('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JenisPelanggaran | null>(null);

  // Load options sekali di awal
  useEffect(() => {
    Promise.all([tatibService.getPasalOptions(), tatibService.getJenisOptions()])
      .then(([pasal, jenis]) => {
        setPasalOptions(pasal);
        setJenisOptions(jenis);
      })
      .catch(() => setError('Gagal memuat data pasal/jenis.'));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { search?: string; pasal_id?: number; jenis_id?: number } = {};
      if (search.trim()) params.search = search.trim();
      if (filterPasal) params.pasal_id = filterPasal;
      if (filterJenis) params.jenis_id = filterJenis;

      const result = await tatibService.getAll(params);
      setData(result);
    } catch {
      setError('Gagal memuat daftar jenis pelanggaran.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPasal, filterJenis]);

  // Debounce pencarian + reload saat filter berubah
  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: JenisPelanggaran) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditing(null);
    loadData();
  };

  const handleDelete = async (item: JenisPelanggaran) => {
    if (!confirm(`Hapus pelanggaran "${item.nama}"?`)) return;
    try {
      await tatibService.remove(item.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <ShieldAlert className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Jenis Pelanggaran</h1>
            <p className="text-sm text-slate-500">
              Master aturan tata tertib — poin mengikuti pengaturan jenis
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggaran..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <select
          value={filterPasal}
          onChange={(e) => setFilterPasal(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Semua Pasal</option>
          {pasalOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Semua Jenis</option>
          {jenisOptions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tabel */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Pelanggaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Pasal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Jenis
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Poin
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    <div className="max-w-md">{item.nama}</div>
                    {item.keterangan && (
                      <div className="mt-0.5 text-xs text-slate-400">{item.keterangan}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.pasal?.nama ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${jenisBadgeClass(
                        item.jenis?.kode
                      )}`}
                    >
                      {item.jenis?.nama ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    {item.poin}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info jumlah */}
      {!loading && data.length > 0 && (
        <p className="text-sm text-slate-500">
          Menampilkan {data.length} jenis pelanggaran.
        </p>
      )}

      {/* Modal form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Jenis Pelanggaran' : 'Tambah Jenis Pelanggaran'}
      >
        <JenisPelanggaranForm
          initial={editing}
          pasalOptions={pasalOptions}
          jenisOptions={jenisOptions}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}