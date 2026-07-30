import { useState, useEffect } from 'react';
import { optionService } from '../../services/kelas';
import type { Kelas, KelasInput, OptionJurusan, OptionTahunAjaran, OptionGuru } from '../../services/kelas';

interface Props {
  initial?: Kelas | null;
  onSubmit: (data: KelasInput) => Promise<void>;
  onCancel: () => void;
}

export function KelasForm({ initial, onSubmit, onCancel }: Props) {
  const [jurusanId, setJurusanId] = useState<number | ''>('');
  const [tahunAjaranId, setTahunAjaranId] = useState<number | ''>('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [namaRombel, setNamaRombel] = useState('');
  const [waliKelasId, setWaliKelasId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // State untuk isi dropdown
  const [jurusanOpts, setJurusanOpts] = useState<OptionJurusan[]>([]);
  const [taOpts, setTaOpts] = useState<OptionTahunAjaran[]>([]);
  const [guruOpts, setGuruOpts] = useState<OptionGuru[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(true);

  // Muat data dropdown saat form dibuka
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [jurusan, ta, guru] = await Promise.all([
          optionService.jurusan(),
          optionService.tahunAjaran(),
          optionService.guru(),
        ]);
        setJurusanOpts(jurusan);
        setTaOpts(ta);
        setGuruOpts(guru);

        // Default tahun ajaran = yang aktif (kalau mode tambah)
        if (!initial) {
          const aktif = ta.find((t) => t.is_active);
          if (aktif) setTahunAjaranId(aktif.id);
        }
      } catch (err) {
        console.error('Gagal memuat opsi:', err);
      } finally {
        setLoadingOpts(false);
      }
    };
    loadOptions();
  }, [initial]);

  // Isi form kalau mode edit
  useEffect(() => {
    if (initial) {
      setJurusanId(initial.jurusan?.id ?? '');
      setTahunAjaranId(initial.tahun_ajaran?.id ?? '');
      setTingkat(initial.tingkat);
      setNamaRombel(initial.nama_rombel);
      setWaliKelasId(initial.wali_kelas?.id ?? '');
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await onSubmit({
        jurusan_id: Number(jurusanId),
        tahun_ajaran_id: Number(tahunAjaranId),
        tingkat,
        nama_rombel: namaRombel,
        wali_kelas_id: waliKelasId ? Number(waliKelasId) : null,
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

  if (loadingOpts) {
    return <p className="text-center text-slate-400 py-4">Memuat pilihan...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Jurusan</label>
        <select
          value={jurusanId}
          onChange={(e) => setJurusanId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Jurusan —</option>
          {jurusanOpts.map((j) => (
            <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>
          ))}
        </select>
        {errors.jurusan_id && <p className="text-sm text-accent-500 mt-1">{errors.jurusan_id[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
        <select
          value={tahunAjaranId}
          onChange={(e) => setTahunAjaranId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Tahun Ajaran —</option>
          {taOpts.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama} - {t.semester}{t.is_active ? ' (Aktif)' : ''}
            </option>
          ))}
        </select>
        {errors.tahun_ajaran_id && <p className="text-sm text-accent-500 mt-1">{errors.tahun_ajaran_id[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
          <select
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value as 'X' | 'XI' | 'XII')}
            className={inputClass}
          >
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rombel</label>
          <input
            type="text"
            value={namaRombel}
            onChange={(e) => setNamaRombel(e.target.value)}
            className={inputClass}
            placeholder="1"
          />
          {errors.nama_rombel && <p className="text-sm text-accent-500 mt-1">{errors.nama_rombel[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Wali Kelas <span className="text-slate-400">(opsional)</span>
        </label>
        <select
          value={waliKelasId}
          onChange={(e) => setWaliKelasId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Belum ditentukan —</option>
          {guruOpts.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

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