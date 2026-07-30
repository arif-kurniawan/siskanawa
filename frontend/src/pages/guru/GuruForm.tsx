import { useState, useEffect } from 'react';
import type { Guru, GuruInput } from '../../services/guru';

interface Props {
  initial?: Guru | null;
  onSubmit: (data: GuruInput) => Promise<void>;
  onCancel: () => void;
}

export function GuruForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<GuruInput>({
    nama: '', nip: '', nuptk: '', jenis_kelamin: 'L',
    tanggal_lahir: '', no_hp: '', alamat: '', status_kepegawaian: '', email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        nama: initial.nama,
        nip: initial.nip ?? '',
        nuptk: initial.nuptk ?? '',
        jenis_kelamin: initial.jenis_kelamin,
        tanggal_lahir: initial.tanggal_lahir ?? '',
        no_hp: initial.no_hp ?? '',
        alamat: initial.alamat ?? '',
        status_kepegawaian: initial.status_kepegawaian ?? '',
        email: initial.email,
      });
    }
  }, [initial]);

  const set = (f: keyof GuruInput, v: any) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await onSubmit(form);
    } catch (err: any) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';
  const errClass = 'text-sm text-accent-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
        <input type="text" value={form.nama} onChange={(e) => set('nama', e.target.value)} className={inputClass} />
        {errors.nama && <p className={errClass}>{errors.nama[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">NIP <span className="text-slate-400">(opsional)</span></label>
          <input type="text" value={form.nip} onChange={(e) => set('nip', e.target.value)} className={inputClass} />
          {errors.nip && <p className={errClass}>{errors.nip[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">NUPTK <span className="text-slate-400">(opsional)</span></label>
          <input type="text" value={form.nuptk} onChange={(e) => set('nuptk', e.target.value)} className={inputClass} />
          {errors.nuptk && <p className={errClass}>{errors.nuptk[0]}</p>}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Status Kepegawaian</label>
          <select value={form.status_kepegawaian} onChange={(e) => set('status_kepegawaian', e.target.value)} className={inputClass}>
            <option value="">— Pilih —</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="GTT">GTT</option>
            <option value="GTY">GTY</option>
            <option value="Honorer">Honorer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir <span className="text-slate-400">(opsional)</span></label>
          <input type="date" value={form.tanggal_lahir} onChange={(e) => set('tanggal_lahir', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. HP <span className="text-slate-400">(opsional)</span></label>
          <input type="text" value={form.no_hp} onChange={(e) => set('no_hp', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Alamat <span className="text-slate-400">(opsional)</span></label>
        <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} className={inputClass} rows={2} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(opsional)</span></label>
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="otomatis dari NIP/nama" />
        {errors.email && <p className={errClass}>{errors.email[0]}</p>}
      </div>

      {!initial && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          Akun login guru dibuat otomatis. Password default: NIP (atau "guru12345" jika tanpa NIP).
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">Batal</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}