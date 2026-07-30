import { useState, useEffect } from 'react';
import { optionKelasService } from '../../services/siswa';
import type { Siswa, SiswaInput, OptionKelas } from '../../services/siswa';
import { optionService } from '../../services/kelas';
import type { OptionJurusan } from '../../services/kelas';

interface Props {
  initial?: Siswa | null;
  onSubmit: (data: SiswaInput) => Promise<void>;
  onCancel: () => void;
}

export function SiswaForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<SiswaInput>({
    nama: '', nis: '', nisn: '', jurusan_id: 0, kelas_id: null,
    jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '',
    alamat: '', no_hp: '', angkatan: new Date().getFullYear(),
    email: '', status: 'aktif',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [jurusanOpts, setJurusanOpts] = useState<OptionJurusan[]>([]);
  const [kelasOpts, setKelasOpts] = useState<OptionKelas[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [jurusan, kelas] = await Promise.all([
          optionService.jurusan(),
          optionKelasService.kelas(),
        ]);
        setJurusanOpts(jurusan);
        setKelasOpts(kelas);
      } catch (err) {
        console.error('Gagal memuat opsi:', err);
      } finally {
        setLoadingOpts(false);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        nama: initial.nama,
        nis: initial.nis,
        nisn: initial.nisn ?? '',
        jurusan_id: initial.jurusan?.id ?? 0,
        kelas_id: initial.kelas?.id ?? null,
        jenis_kelamin: initial.jenis_kelamin,
        tempat_lahir: initial.tempat_lahir,
        tanggal_lahir: initial.tanggal_lahir,
        alamat: initial.alamat,
        no_hp: initial.no_hp ?? '',
        angkatan: initial.angkatan,
        email: initial.email,
        status: initial.status,
      });
    }
  }, [initial]);

  const set = (field: keyof SiswaInput, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await onSubmit(form);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';
  const errClass = 'text-sm text-accent-500 mt-1';

  if (loadingOpts) {
    return <p className="text-center text-slate-400 py-4">Memuat pilihan...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
        <input type="text" value={form.nama} onChange={(e) => set('nama', e.target.value)} className={inputClass} />
        {errors.nama && <p className={errClass}>{errors.nama[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
          <input type="text" value={form.nis} onChange={(e) => set('nis', e.target.value)} className={inputClass} />
          {errors.nis && <p className={errClass}>{errors.nis[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">NISN <span className="text-slate-400">(opsional)</span></label>
          <input type="text" value={form.nisn} onChange={(e) => set('nisn', e.target.value)} className={inputClass} />
          {errors.nisn && <p className={errClass}>{errors.nisn[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan</label>
          <select value={form.jurusan_id || ''} onChange={(e) => set('jurusan_id', Number(e.target.value))} className={inputClass}>
            <option value="">— Pilih —</option>
            {jurusanOpts.map((j) => <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>)}
          </select>
          {errors.jurusan_id && <p className={errClass}>{errors.jurusan_id[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kelas <span className="text-slate-400">(opsional)</span></label>
          <select value={form.kelas_id || ''} onChange={(e) => set('kelas_id', e.target.value ? Number(e.target.value) : null)} className={inputClass}>
            <option value="">— Belum ditempatkan —</option>
            {kelasOpts.map((k) => <option key={k.id} value={k.id}>{k.nama_lengkap}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
          <select value={form.jenis_kelamin} onChange={(e) => set('jenis_kelamin', e.target.value)} className={inputClass}>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Angkatan</label>
          <input type="number" value={form.angkatan} onChange={(e) => set('angkatan', Number(e.target.value))} className={inputClass} />
          {errors.angkatan && <p className={errClass}>{errors.angkatan[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir</label>
          <input type="text" value={form.tempat_lahir} onChange={(e) => set('tempat_lahir', e.target.value)} className={inputClass} />
          {errors.tempat_lahir && <p className={errClass}>{errors.tempat_lahir[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
          <input type="date" value={form.tanggal_lahir} onChange={(e) => set('tanggal_lahir', e.target.value)} className={inputClass} />
          {errors.tanggal_lahir && <p className={errClass}>{errors.tanggal_lahir[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
        <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} className={inputClass} rows={2} />
        {errors.alamat && <p className={errClass}>{errors.alamat[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. HP <span className="text-slate-400">(opsional)</span></label>
          <input type="text" value={form.no_hp} onChange={(e) => set('no_hp', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(opsional)</span></label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="otomatis dari NIS" />
          {errors.email && <p className={errClass}>{errors.email[0]}</p>}
        </div>
      </div>

      {/* Status hanya muncul di mode edit */}
      {initial && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="pindah">Pindah</option>
            <option value="keluar">Keluar</option>
          </select>
        </div>
      )}

      {!initial && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          Akun login siswa akan dibuat otomatis. Email default dari NIS, password default dari tanggal lahir (format ddmmyyyy).
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">
          Batal
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}