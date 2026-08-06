import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Trash2, AlertTriangle } from 'lucide-react';
import { catatanService, type DetailPoin } from '../../services/tatib';
import { Modal } from '../../components/ui/Modal';

function poinColor(poin: number): string {
  if (poin >= 40) return 'text-red-600';
  if (poin >= 24) return 'text-orange-600';
  if (poin >= 10) return 'text-amber-600';
  return 'text-slate-900';
}

export function DetailPoinSiswaPage() {
  const { siswaId } = useParams<{ siswaId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<DetailPoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal penghapusan poin
  const [modalOpen, setModalOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [tanggalHapus, setTanggalHapus] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [hapusError, setHapusError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!siswaId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await catatanService.getDetail(Number(siswaId));
      setDetail(result);
    } catch {
      setError('Gagal memuat detail poin siswa.');
    } finally {
      setLoading(false);
    }
  }, [siswaId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ' +
    'focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

  const handlePenghapusan = async () => {
    if (!detail) return;
    setHapusError(null);
    if (!alasan.trim()) {
      setHapusError('Alasan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      await catatanService.penghapusanPoin({
        siswa_id: detail.siswa.id,
        tanggal: tanggalHapus,
        keterangan: alasan.trim(),
      });
      setModalOpen(false);
      setAlasan('');
      loadDetail();
    } catch (err: any) {
      setHapusError(err.response?.data?.message || 'Gagal memproses penghapusan poin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCatatan = async (id: number) => {
    if (!confirm('Hapus catatan ini? Poin akan dihitung ulang.')) return;
    try {
      await catatanService.remove(id);
      loadDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus catatan.');
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-slate-500">Memuat data...</div>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/tatib/rekap-poin')}
          className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Data tidak ditemukan.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Kembali */}
      <button
        onClick={() => navigate('/tatib/rekap-poin')}
        className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Rekap
      </button>

      {/* Kartu ringkasan */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{detail.siswa.nama}</h1>
            <p className="text-sm text-slate-500">
              NIS {detail.siswa.nis} • {detail.siswa.kelas}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tahun Ajaran {detail.tahun_ajaran} — Semester {detail.semester}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${poinColor(detail.total_poin)}`}>
              {detail.total_poin}
            </div>
            <div className="text-xs text-slate-500">total poin</div>
          </div>
        </div>

        {/* Status sanksi */}
        {detail.status_sanksi && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <div className="text-sm font-semibold text-amber-800">
                Status: {detail.status_sanksi}
              </div>
              {detail.tindakan_sanksi && (
                <div className="mt-0.5 text-xs text-amber-700">{detail.tindakan_sanksi}</div>
              )}
            </div>
          </div>
        )}

        {/* Tombol penghapusan poin */}
        <div className="mt-4">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
          >
            <Award className="h-4 w-4" />
            Penghapusan Poin (Kegiatan Positif)
          </button>
          <p className="mt-1 text-xs text-slate-400">
            Mengurangi 3 poin. Maksimal 1x per bulan per siswa.
          </p>
        </div>
      </div>

      {/* Riwayat */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Riwayat Catatan</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Catatan
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                  Poin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Pencatat
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {detail.riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Belum ada catatan.
                  </td>
                </tr>
              ) : (
                detail.riwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{item.tanggal}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900">{item.pelanggaran}</div>
                      {item.keterangan && (
                        <div className="mt-0.5 text-xs text-slate-400">{item.keterangan}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          item.poin < 0 ? 'text-green-600' : 'text-slate-900'
                        }`}
                      >
                        {item.poin > 0 ? `+${item.poin}` : item.poin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.pencatat ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteCatatan(item.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Hapus catatan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal penghapusan poin */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Penghapusan Poin (Kegiatan Positif)"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Mengurangi 3 poin dari {detail.siswa.nama} karena kegiatan positif (mis. petugas
            upacara, juara lomba, kegiatan sosial). Maksimal 1x per bulan.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal <span className="text-accent-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalHapus}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setTanggalHapus(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alasan <span className="text-accent-500">*</span>
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Contoh: Petugas upacara bendera 5 Agustus 2026"
            />
          </div>

          {hapusError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{hapusError}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handlePenghapusan}
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Kurangi 3 Poin'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}