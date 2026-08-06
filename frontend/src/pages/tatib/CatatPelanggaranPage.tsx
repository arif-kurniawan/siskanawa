import { useState, useEffect, useCallback } from 'react';
import { ClipboardPenLine, Search, Check } from 'lucide-react';
import apiClient from '../../lib/axios';
import {
  tatibService,
  catatanService,
  type JenisPelanggaran,
  type PasalOption,
  type CatatanInput,
} from '../../services/tatib';

interface SiswaLite {
  id: number;
  nama: string;
  nis: string;
  kelas?: string;
}

type FormErrors = Record<string, string[]>;

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

export function CatatPelanggaranPage() {
  // Pencarian siswa
  const [siswaSearch, setSiswaSearch] = useState('');
  const [siswaResults, setSiswaResults] = useState<SiswaLite[]>([]);
  const [searchingSiswa, setSearchingSiswa] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaLite | null>(null);

  // Pelanggaran
  const [pasalOptions, setPasalOptions] = useState<PasalOption[]>([]);
  const [pelanggaranList, setPelanggaranList] = useState<JenisPelanggaran[]>([]);
  const [filterPasal, setFilterPasal] = useState<number | ''>('');
  const [jenisPelanggaranId, setJenisPelanggaranId] = useState<number | ''>('');

  // Form
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ' +
    'focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

  // Load options pelanggaran
  useEffect(() => {
    Promise.all([tatibService.getPasalOptions(), tatibService.getJenisOptions()])
      .then(([pasal]) => {
        setPasalOptions(pasal);
      })
      .catch(() => {});
  }, []);

  // Load daftar pelanggaran (filter pasal)
  useEffect(() => {
    const params: { pasal_id?: number } = {};
    if (filterPasal) params.pasal_id = filterPasal;
    tatibService
      .getAll(params)
      .then((data) => setPelanggaranList(data.filter((p) => p.is_active)))
      .catch(() => {});
    setJenisPelanggaranId('');
  }, [filterPasal]);

  // Pencarian siswa (debounce)
  const searchSiswa = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSiswaResults([]);
      return;
    }
    setSearchingSiswa(true);
    try {
      // Memakai endpoint siswa dengan param search (pola CRUD siswa)
      const response = await apiClient.get('/api/siswa', { params: { search: q.trim(), per_page: 10 } });
      const rows = response.data.data ?? [];
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
    } finally {
      setSearchingSiswa(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchSiswa(siswaSearch), 300);
    return () => clearTimeout(t);
  }, [siswaSearch, searchSiswa]);

  const pickSiswa = (s: SiswaLite) => {
    setSelectedSiswa(s);
    setSiswaSearch('');
    setSiswaResults([]);
  };

  const selectedPelanggaran = pelanggaranList.find((p) => p.id === jenisPelanggaranId);

  const resetForm = () => {
    setSelectedSiswa(null);
    setJenisPelanggaranId('');
    setFilterPasal('');
    setKeterangan('');
    setTanggal(new Date().toISOString().slice(0, 10));
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});
    setSuccessMsg(null);

    const localErrors: FormErrors = {};
    if (!selectedSiswa) localErrors.siswa_id = ['Siswa wajib dipilih.'];
    if (!jenisPelanggaranId) localErrors.jenis_pelanggaran_id = ['Jenis pelanggaran wajib dipilih.'];
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setSubmitting(true);
    const payload: CatatanInput = {
      siswa_id: selectedSiswa!.id,
      jenis_pelanggaran_id: Number(jenisPelanggaranId),
      tanggal,
      keterangan: keterangan.trim() || undefined,
    };

    try {
      const result = await catatanService.create(payload);
      let pesan = `Pelanggaran "${selectedPelanggaran?.nama}" untuk ${selectedSiswa!.nama} berhasil dicatat (+${selectedPelanggaran?.poin} poin).`;
      if (result.kasus_dibuat) {
        pesan += result.kasus_dibuat.baru
          ? ` ⚠️ Poin mencapai ambang — kasus pembinaan otomatis dibuat.`
          : ` ⚠️ Ditambahkan ke kasus pembinaan yang sedang berjalan.`;
  }

  setSuccessMsg(pesan);
      resetForm();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan catatan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <ClipboardPenLine className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Catat Pelanggaran</h1>
          <p className="text-sm text-slate-500">Catat pelanggaran tata tertib siswa</p>
        </div>
      </div>

      {/* Sukses */}
      {successMsg && (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {/* Pilih siswa */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Siswa <span className="text-accent-500">*</span>
          </label>

          {selectedSiswa ? (
            <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
              <div>
                <div className="text-sm font-medium text-slate-900">{selectedSiswa.nama}</div>
                <div className="text-xs text-slate-500">
                  NIS {selectedSiswa.nis}
                  {selectedSiswa.kelas ? ` • ${selectedSiswa.kelas}` : ''}
                </div>
              </div>
              <button
                onClick={() => setSelectedSiswa(null)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Ganti
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={siswaSearch}
                onChange={(e) => setSiswaSearch(e.target.value)}
                placeholder="Cari nama atau NIS siswa..."
                className={inputClass + ' pl-9'}
              />
              {searchingSiswa && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  mencari...
                </div>
              )}
              {siswaResults.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {siswaResults.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => pickSiswa(s)}
                        className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span className="text-sm text-slate-900">{s.nama}</span>
                        <span className="text-xs text-slate-500">
                          NIS {s.nis}
                          {s.kelas ? ` • ${s.kelas}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {errors.siswa_id && <p className="text-sm text-accent-500 mt-1">{errors.siswa_id[0]}</p>}
        </div>

        {/* Filter pasal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori (Pasal)</label>
          <select
            value={filterPasal}
            onChange={(e) => setFilterPasal(e.target.value ? Number(e.target.value) : '')}
            className={inputClass}
          >
            <option value="">Semua Pasal</option>
            {pasalOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Pilih pelanggaran */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jenis Pelanggaran <span className="text-accent-500">*</span>
          </label>
          <select
            value={jenisPelanggaranId}
            onChange={(e) => setJenisPelanggaranId(e.target.value ? Number(e.target.value) : '')}
            className={inputClass}
          >
            <option value="">— Pilih Pelanggaran —</option>
            {pelanggaranList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} ({p.poin} poin)
              </option>
            ))}
          </select>
          {selectedPelanggaran && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${jenisBadgeClass(
                  selectedPelanggaran.jenis?.kode
                )}`}
              >
                {selectedPelanggaran.jenis?.nama}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                +{selectedPelanggaran.poin} poin
              </span>
            </div>
          )}
          {errors.jenis_pelanggaran_id && (
            <p className="text-sm text-accent-500 mt-1">{errors.jenis_pelanggaran_id[0]}</p>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal <span className="text-accent-500">*</span>
          </label>
          <input
            type="date"
            value={tanggal}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setTanggal(e.target.value)}
            className={inputClass}
          />
          {errors.tanggal && <p className="text-sm text-accent-500 mt-1">{errors.tanggal[0]}</p>}
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Keterangan <span className="text-slate-400">(opsional)</span>
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Detail kejadian, mis. datang pukul 07.15"
          />
          {errors.keterangan && (
            <p className="text-sm text-accent-500 mt-1">{errors.keterangan[0]}</p>
          )}
        </div>

        {/* Tombol */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={resetForm}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Catat Pelanggaran'}
          </button>
        </div>
      </div>
    </div>
  );
}