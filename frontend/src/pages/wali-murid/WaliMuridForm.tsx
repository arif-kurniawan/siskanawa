import { useState, useEffect, useCallback } from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import apiClient from '../../lib/axios';
import {
  waliMuridService,
  type WaliMurid,
  type WaliMuridInput,
} from '../../services/waliMurid';

interface Props {
  initial?: WaliMurid | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SiswaLite {
  id: number;
  nama: string;
  nis: string;
  kelas?: string;
}

interface AnakDipilih {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas?: string;
  hubungan: string;
  is_primary: boolean;
}

type FormErrors = Record<string, string[]>;

export function WaliMuridForm({ initial, onSuccess, onCancel }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nik, setNik] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');

  // Anak (hanya untuk mode buat)
  const [anak, setAnak] = useState<AnakDipilih[]>([]);
  const [siswaSearch, setSiswaSearch] = useState('');
  const [siswaResults, setSiswaResults] = useState<SiswaLite[]>([]);
  const [searching, setSearching] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initial;

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ' +
    'focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

  useEffect(() => {
    if (initial) {
      setName(initial.nama);
      setEmail(initial.email ?? '');
      setNik(initial.nik ?? '');
      setPekerjaan(initial.pekerjaan ?? '');
      setNoHp(initial.no_hp);
      setAlamat(initial.alamat);
    } else {
      setName('');
      setEmail('');
      setNik('');
      setPekerjaan('');
      setNoHp('');
      setAlamat('');
      setAnak([]);
    }
    setErrors({});
  }, [initial]);

  // Pencarian siswa (debounce), hanya di mode buat
  const searchSiswa = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSiswaResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await apiClient.get('/api/siswa', {
        params: { search: q.trim(), per_page: 10 },
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
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isEdit) return;
    const t = setTimeout(() => searchSiswa(siswaSearch), 300);
    return () => clearTimeout(t);
  }, [siswaSearch, searchSiswa, isEdit]);

  const tambahAnak = (s: SiswaLite) => {
    if (anak.some((a) => a.siswa_id === s.id)) return; // sudah dipilih
    setAnak((prev) => [
      ...prev,
      {
        siswa_id: s.id,
        nama: s.nama,
        nis: s.nis,
        kelas: s.kelas,
        hubungan: 'wali',
        is_primary: prev.length === 0, // anak pertama jadi primary
      },
    ]);
    setSiswaSearch('');
    setSiswaResults([]);
  };

  const hapusAnak = (siswaId: number) => {
    setAnak((prev) => prev.filter((a) => a.siswa_id !== siswaId));
  };

  const ubahHubungan = (siswaId: number, hubungan: string) => {
    setAnak((prev) =>
      prev.map((a) => (a.siswa_id === siswaId ? { ...a, hubungan } : a))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const payload: WaliMuridInput = {
      name: name.trim(),
      email: email.trim() || undefined,
      nik: nik.trim() || undefined,
      pekerjaan: pekerjaan.trim() || undefined,
      no_hp: noHp.trim(),
      alamat: alamat.trim(),
    };

    // Sertakan anak hanya di mode buat
    if (!isEdit && anak.length > 0) {
      payload.anak = anak.map((a) => ({
        siswa_id: a.siswa_id,
        hubungan: a.hubungan,
        is_primary: a.is_primary,
      }));
    }

    try {
      if (isEdit) {
        await waliMuridService.update(initial!.id, payload);
      } else {
        await waliMuridService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan data wali murid.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Data diri wali */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nama Wali <span className="text-accent-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Nama lengkap wali murid"
        />
        {errors.name && <p className="text-sm text-accent-500 mt-1">{errors.name[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nomor HP <span className="text-accent-500">*</span>
          </label>
          <input
            type="text"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            className={inputClass}
            placeholder="08xxxxxxxxxx"
          />
          {errors.no_hp && <p className="text-sm text-accent-500 mt-1">{errors.no_hp[0]}</p>}
          {!isEdit && (
            <p className="text-xs text-slate-400 mt-1">Jadi password awal login wali.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-slate-400">(opsional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="email@contoh.com"
          />
          {errors.email && <p className="text-sm text-accent-500 mt-1">{errors.email[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            NIK <span className="text-slate-400">(opsional)</span>
          </label>
          <input
            type="text"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            className={inputClass}
            placeholder="Nomor KTP"
          />
          {errors.nik && <p className="text-sm text-accent-500 mt-1">{errors.nik[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Pekerjaan <span className="text-slate-400">(opsional)</span>
          </label>
          <input
            type="text"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            className={inputClass}
            placeholder="Pekerjaan wali"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Alamat <span className="text-accent-500">*</span>
        </label>
        <textarea
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Alamat lengkap"
        />
        {errors.alamat && <p className="text-sm text-accent-500 mt-1">{errors.alamat[0]}</p>}
      </div>

      {/* Bagian anak — hanya saat buat */}
      {!isEdit && (
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Anak / Siswa Terkait <span className="text-slate-400">(opsional)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Cari dan tambahkan anak. Bisa juga dihubungkan nanti lewat halaman detail.
          </p>

          {/* Pencarian siswa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={siswaSearch}
              onChange={(e) => setSiswaSearch(e.target.value)}
              placeholder="Cari nama atau NIS siswa..."
              className={inputClass + ' pl-9'}
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                mencari...
              </span>
            )}
            {siswaResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {siswaResults.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
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

          {/* Daftar anak yang dipilih */}
          {anak.length > 0 && (
            <div className="mt-3 space-y-2">
              {anak.map((a) => (
                <div
                  key={a.siswa_id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{a.nama}</p>
                    <p className="text-xs text-slate-500">
                      NIS {a.nis}
                      {a.kelas ? ` • ${a.kelas}` : ''}
                    </p>
                  </div>
                  <select
                    value={a.hubungan}
                    onChange={(e) => ubahHubungan(a.siswa_id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    <option value="ayah">Ayah</option>
                    <option value="ibu">Ibu</option>
                    <option value="wali">Wali</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => hapusAnak(a.siswa_id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Hapus"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isEdit && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Untuk menambah atau melepas anak, gunakan halaman detail wali murid.
        </p>
      )}

      {/* Tombol */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Wali'}
        </button>
      </div>
    </div>
  );
}