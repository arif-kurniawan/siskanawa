import { useState, useEffect } from 'react';
import type { TahunAjaran, TahunAjaranInput } from '../../services/tahunAjaran';

interface Props {
  initial?: TahunAjaran | null;
  onSubmit: (data: TahunAjaranInput) => Promise<void>;
  onCancel: () => void;
}

export function TahunAjaranForm({ initial, onSubmit, onCancel }: Props) {
  const [nama, setNama] = useState('');
  const [semester, setSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (initial) {
      setNama(initial.nama);
      setSemester(initial.semester);
      setTanggalMulai(initial.tanggal_mulai);
      setTanggalSelesai(initial.tanggal_selesai);
      setIsActive(initial.is_active);
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await onSubmit({
        nama,
        semester,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        is_active: isActive,
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nama Tahun Ajaran
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className={inputClass}
          placeholder="2025/2026"
        />
        {errors.nama && <p className="text-sm text-accent-500 mt-1">{errors.nama[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value as 'ganjil' | 'genap')}
          className={inputClass}
        >
          <option value="ganjil">Ganjil</option>
          <option value="genap">Genap</option>
        </select>
        {errors.semester && <p className="text-sm text-accent-500 mt-1">{errors.semester[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            className={inputClass}
          />
          {errors.tanggal_mulai && <p className="text-sm text-accent-500 mt-1">{errors.tanggal_mulai[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            className={inputClass}
          />
          {errors.tanggal_selesai && <p className="text-sm text-accent-500 mt-1">{errors.tanggal_selesai[0]}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-100"
        />
        <span className="text-sm text-slate-700">Jadikan tahun ajaran aktif</span>
      </label>
      {isActive && (
        <p className="text-xs text-slate-500 -mt-2">
          Tahun ajaran aktif lainnya akan otomatis dinonaktifkan.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium transition disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}