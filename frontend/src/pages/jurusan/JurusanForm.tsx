import { useState, useEffect } from 'react';
import type { Jurusan, JurusanInput } from '../../services/jurusan';

interface JurusanFormProps {
  initial?: Jurusan | null;
  onSubmit: (data: JurusanInput) => Promise<void>;
  onCancel: () => void;
}

export function JurusanForm({ initial, onSubmit, onCancel }: JurusanFormProps) {
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Isi form kalau mode edit
  useEffect(() => {
    if (initial) {
      setKode(initial.kode);
      setNama(initial.nama);
      setDeskripsi(initial.deskripsi || '');
      setIsActive(initial.is_active);
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await onSubmit({
        kode,
        nama,
        deskripsi: deskripsi || undefined,
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
          Kode Jurusan
        </label>
        <input
          type="text"
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="RPL"
          maxLength={10}
        />
        {errors.kode && <p className="text-sm text-accent-500 mt-1">{errors.kode[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nama Jurusan
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className={inputClass}
          placeholder="Rekayasa Perangkat Lunak"
        />
        {errors.nama && <p className="text-sm text-accent-500 mt-1">{errors.nama[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Deskripsi <span className="text-slate-400">(opsional)</span>
        </label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className={inputClass}
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-100"
        />
        <span className="text-sm text-slate-700">Jurusan aktif</span>
      </label>

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