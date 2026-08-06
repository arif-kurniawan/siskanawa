import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight } from 'lucide-react';
import apiClient from '../../lib/axios';
import { catatanService, type RekapPoinRow } from '../../services/tatib';

interface KelasOption {
  id: number;
  nama_lengkap?: string;
  nama?: string;
}

// Warna baris/badge berdasarkan level sanksi
function sanksiBadge(level: number | null, status: string | null) {
  if (!status) {
    return <span className="text-xs text-slate-400">Aman</span>;
  }
  let cls = 'bg-slate-100 text-slate-700';
  if (level != null) {
    if (level >= 5) cls = 'bg-red-100 text-red-700';
    else if (level >= 3) cls = 'bg-orange-100 text-orange-700';
    else if (level >= 1) cls = 'bg-amber-100 text-amber-800';
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function poinColor(poin: number): string {
  if (poin >= 40) return 'text-red-600';
  if (poin >= 24) return 'text-orange-600';
  if (poin >= 10) return 'text-amber-600';
  return 'text-slate-900';
}

export function RekapPoinPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<RekapPoinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<{ tahun_ajaran: string; semester: string } | null>(null);

  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [filterKelas, setFilterKelas] = useState<number | ''>('');
  const [semester, setSemester] = useState<string>('');

  // Load daftar kelas untuk filter
  useEffect(() => {
    apiClient
      .get('/api/options/kelas')
      .then((res) => setKelasOptions(res.data ?? []))
      .catch(() => {});
  }, []);

  const loadRekap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { kelas_id?: number; semester?: string } = {};
      if (filterKelas) params.kelas_id = filterKelas;
      if (semester) params.semester = semester;

      const result = await catatanService.getRekap(params);
      setRows(result.data);
      setPeriode({ tahun_ajaran: result.tahun_ajaran, semester: result.semester });
    } catch {
      setError('Gagal memuat rekap poin.');
    } finally {
      setLoading(false);
    }
  }, [filterKelas, semester]);

  useEffect(() => {
    loadRekap();
  }, [loadRekap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <BarChart3 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Rekap Poin Pelanggaran</h1>
            <p className="text-sm text-slate-500">
              {periode
                ? `Tahun Ajaran ${periode.tahun_ajaran} — Semester ${periode.semester}`
                : 'Memuat periode...'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama_lengkap ?? k.nama}
            </option>
          ))}
        </select>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Semester Aktif</option>
          <option value="ganjil">Ganjil</option>
          <option value="genap">Genap</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tabel */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Siswa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Kelas
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Poin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  Memuat data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  Belum ada siswa dengan poin pelanggaran pada periode ini.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.siswa_id}
                  onClick={() => navigate(`/tatib/rekap-poin/${row.siswa_id}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{row.nama}</div>
                    <div className="text-xs text-slate-500">NIS {row.nis}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.kelas}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-lg font-bold ${poinColor(row.total_poin)}`}>
                      {row.total_poin}
                    </span>
                  </td>
                  <td className="px-4 py-3">{sanksiBadge(row.level_sanksi, row.status_sanksi)}</td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && rows.length > 0 && (
        <p className="text-sm text-slate-500">
          {rows.length} siswa memiliki catatan poin pada periode ini. Klik baris untuk melihat
          detail dan riwayat.
        </p>
      )}
    </div>
  );
}