import { useState, useEffect } from 'react';
import type { MataPelajaran, MataPelajaranInput } from '../../services/mataPelajaran';
import { optionService } from '../../services/kelas';
import type { OptionJurusan } from '../../services/kelas';

interface Props {
  initial?: MataPelajaran | null;
  onSubmit: (data: MataPelajaranInput) => Promise<void>;
  onCancel: () => void;
}

export function MataPelajaranForm({ initial, onSubmit, onCancel }: Props) {
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<'umum' | 'kejuruan' | 'muatan_lokal'>('umum');
  const [jurusanId, setJurusanId] = useState<number | ''>('');
  const [jurusanOpts, setJurusanOpts] = useState<OptionJurusan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    optionService.jurusan().then(setJurusanOpts).catch(console.error);
  }, []);

  useEffect(() => {
    if (initial) {
      setKode(initial.kode);
      setNama(initial.nama);
      setKategori(initial.kategori);
      setJurusanId(initial.jurusan?.id ?? '');
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
        kategori,
        // jurusan hanya relevan untuk kejuruan
        jurusan_id: kategori === 'kejuruan' && jurusanId ? Number(jurusanId) : null,
      });
    } catch (err: any) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition';
  const errClass = 'text-sm text-accent-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
          <input type="text" value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} className={inputClass} placeholder="MTK" />
          {errors.kode && <p className={errClass}>{errors.kode[0]}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Mapel</label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className={inputClass} placeholder="Matematika" />
          {errors.nama && <p className={errClass}>{errors.nama[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
        <select value={kategori} onChange={(e) => setKategori(e.target.value as any)} className={inputClass}>
          <option value="umum">Umum (Nasional)</option>
          <option value="kejuruan">Kejuruan (Produktif)</option>
          <option value="muatan_lokal">Muatan Lokal</option>
        </select>
      </div>

      {/* Jurusan hanya untuk mapel kejuruan */}
      {kategori === 'kejuruan' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan</label>
          <select value={jurusanId} onChange={(e) => setJurusanId(e.target.value ? Number(e.target.value) : '')} className={inputClass}>
            <option value="">— Pilih Jurusan —</option>
            {jurusanOpts.map((j) => <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>)}
          </select>
          <p className="text-xs text-slate-400 mt-1">Mapel kejuruan spesifik untuk jurusan tertentu.</p>
        </div>
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