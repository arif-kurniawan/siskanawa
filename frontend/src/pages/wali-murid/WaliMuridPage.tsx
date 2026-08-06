import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Users, X, UserPlus } from 'lucide-react';
import apiClient from '../../lib/axios';
import {
  waliMuridService,
  type WaliMurid,
  type AnakWali,
} from '../../services/waliMurid';
import { Modal } from '../../components/ui/Modal';
import { WaliMuridForm } from './WaliMuridForm';

interface SiswaLite {
  id: number;
  nama: string;
  nis: string;
  kelas?: string;
}

export function WaliMuridPage() {
  const [data, setData] = useState<WaliMurid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal form (buat/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WaliMurid | null>(null);

  // Modal kelola anak
  const [anakModalOpen, setAnakModalOpen] = useState(false);
  const [detailWali, setDetailWali] = useState<WaliMurid | null>(null);
  const [siswaSearch, setSiswaSearch] = useState('');
  const [siswaResults, setSiswaResults] = useState<SiswaLite[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await waliMuridService.getAll(search.trim() ? { search: search.trim() } : {});
      setData(res.data);
    } catch {
      setError('Gagal memuat data wali murid.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (wali: WaliMurid) => {
    setEditing(wali);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditing(null);
    loadData();
  };

  const handleDelete = async (wali: WaliMurid) => {
    if (!confirm(`Hapus wali murid "${wali.nama}"? Akun login-nya juga akan dihapus.`)) return;
    try {
      await waliMuridService.remove(wali.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus wali murid.');
    }
  };

  // ===== Kelola anak =====
  const openKelolaAnak = async (wali: WaliMurid) => {
    try {
      const detail = await waliMuridService.getById(wali.id);
      setDetailWali(detail);
      setAnakModalOpen(true);
      setSiswaSearch('');
      setSiswaResults([]);
    } catch {
      alert('Gagal memuat detail wali.');
    }
  };

  // Pencarian siswa di modal kelola anak
  useEffect(() => {
    if (!anakModalOpen || siswaSearch.trim().length < 2) {
      setSiswaResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await apiClient.get('/api/siswa', {
          params: { search: siswaSearch.trim(), per_page: 10 },
        });
        const rows = res.data.data ?? [];
        setSiswaResults(
          rows.map((s: any) => ({
            id: s.id,
            nama: s.nama,
            nis: s.nis,
            kelas: s.kelas?.nama_lengkap ?? s.kelas?.nama ?? undefined,
          }))
        );
      } catch {
        setSiswaResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [siswaSearch, anakModalOpen]);

  const refreshDetail = async () => {
    if (!detailWali) return;
    const detail = await waliMuridService.getById(detailWali.id);
    setDetailWali(detail);
    loadData(); // supaya jumlah anak di tabel ikut ter-update
  };

  const tambahAnak = async (s: SiswaLite) => {
    if (!detailWali) return;
    if (detailWali.anak?.some((a) => a.siswa_id === s.id)) {
      alert('Siswa ini sudah terhubung.');
      return;
    }
    try {
      await waliMuridService.tambahAnak(detailWali.id, {
        siswa_id: s.id,
        hubungan: 'wali',
        is_primary: (detailWali.anak?.length ?? 0) === 0,
      });
      setSiswaSearch('');
      setSiswaResults([]);
      refreshDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah anak.');
    }
  };

  const lepasAnak = async (anak: AnakWali) => {
    if (!detailWali) return;
    if (!confirm(`Lepas hubungan dengan ${anak.nama}?`)) return;
    try {
      await waliMuridService.lepasAnak(detailWali.id, anak.siswa_id);
      refreshDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal melepas anak.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Wali Murid</h1>
            <p className="text-sm text-slate-500">Kelola akun wali murid dan hubungannya dengan siswa</p>
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, NIK, atau no HP..."
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Tabel */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">No HP</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Pekerjaan</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Anak</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  Belum ada data wali murid.
                </td>
              </tr>
            ) : (
              data.map((wali) => (
                <tr key={wali.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{wali.nama}</div>
                    {wali.email && <div className="text-xs text-slate-400">{wali.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wali.no_hp}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{wali.pekerjaan ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openKelolaAnak(wali)}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                    >
                      <Users className="h-3 w-3" />
                      {wali.jumlah_anak ?? 0} anak
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(wali)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(wali)}
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

      {/* Modal form buat/edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Wali Murid' : 'Tambah Wali Murid'}
      >
        <WaliMuridForm
          initial={editing}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal kelola anak */}
      <Modal
        isOpen={anakModalOpen}
        onClose={() => setAnakModalOpen(false)}
        title={detailWali ? `Anak dari ${detailWali.nama}` : 'Kelola Anak'}
      >
        {detailWali && (
          <div className="space-y-4">
            {/* Daftar anak terhubung */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Anak Terhubung</p>
              {(detailWali.anak?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-400">Belum ada anak terhubung.</p>
              ) : (
                <div className="space-y-2">
                  {detailWali.anak!.map((a) => (
                    <div
                      key={a.siswa_id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{a.nama}</p>
                        <p className="text-xs text-slate-500">
                          NIS {a.nis}
                          {a.kelas ? ` • ${a.kelas}` : ''} • <span className="capitalize">{a.hubungan}</span>
                          {a.is_primary && ' • utama'}
                        </p>
                      </div>
                      <button
                        onClick={() => lepasAnak(a)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Lepas"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tambah anak */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Tambah Anak</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={siswaSearch}
                  onChange={(e) => setSiswaSearch(e.target.value)}
                  placeholder="Cari nama atau NIS siswa..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
                {siswaResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {siswaResults.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => tambahAnak(s)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <UserPlus className="h-4 w-4 text-brand-500" />
                          <span>
                            <span className="block text-sm text-slate-900">{s.nama}</span>
                            <span className="block text-xs text-slate-500">
                              NIS {s.nis}
                              {s.kelas ? ` • ${s.kelas}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAnakModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}