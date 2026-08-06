import { useState, useEffect } from 'react';
import {
  tatibService,
  type JenisPelanggaran,
  type JenisPelanggaranInput,
  type PasalOption,
  type JenisOption,
} from '../../services/tatib';

interface Props {
  initial?: JenisPelanggaran | null;
  pasalOptions: PasalOption[];
  jenisOptions: JenisOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

type FormErrors = Record<string, string[]>;

export function JenisPelanggaranForm({
  initial,
  pasalOptions,
  jenisOptions,
  onSuccess,
  onCancel,
}: Props) {
  const [pasalTatibId, setPasalTatibId] = useState<number | ''>('');
  const [jenisTatibId, setJenisTatibId] = useState<number | ''>('');
  const [nama, setNama] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setPasalTatibId(initial.pasal?.id ?? '');
      setJenisTatibId(initial.jenis?.id ?? '');
      setNama(initial.nama);
      setKeterangan(initial.keterangan ?? '');
      setIsActive(initial.is_active);
    } else {
      setPasalTatibId('');
      setJenisTatibId('');
      setNama('');
      setKeterangan('');
      setIsActive(true);
    }
    setErrors({});
  }, [initial]);

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ' +
    'focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none';

  // Poin dari jenis yang dipilih (preview)
  const selectedJenis = jenisOptions.find((j) => j.id === jenisTatibId);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const payload: JenisPelanggaranInput = {
      pasal_tatib_id: Number(pasalTatibId),
      jenis_tatib_id: Number(jenisTatibId),
      nama: nama.trim(),
      keterangan: keterangan.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (initial) {
        await tatibService.update(initial.id, payload);
      } else {
        await tatibService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pasal */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Pasal <span className="text-accent-500">*</span>
        </label>
        <select
          value={pasalTatibId}
          onChange={(e) => setPasalTatibId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Pasal —</option>
          {pasalOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
        {errors.pasal_tatib_id && (
          <p className="text-sm text-accent-500 mt-1">{errors.pasal_tatib_id[0]}</p>
        )}
      </div>

      {/* Jenis (tingkat) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Jenis / Tingkat <span className="text-accent-500">*</span>
        </label>
        <select
          value={jenisTatibId}
          onChange={(e) => setJenisTatibId(e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        >
          <option value="">— Pilih Jenis —</option>
          {jenisOptions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama} ({j.poin} poin)
            </option>
          ))}
        </select>
        {selectedJenis && (
          <p className="text-xs text-slate-500 mt-1">
            Pelanggaran ini bernilai <strong>{selectedJenis.poin} poin</strong>.
            Poin mengikuti pengaturan jenis, bukan disimpan per pelanggaran.
          </p>
        )}
        {errors.jenis_tatib_id && (
          <p className="text-sm text-accent-500 mt-1">{errors.jenis_tatib_id[0]}</p>
        )}
      </div>

      {/* Nama pelanggaran */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nama Pelanggaran <span className="text-accent-500">*</span>
        </label>
        <textarea
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Contoh: Terlambat masuk sekolah"
        />
        {errors.nama && <p className="text-sm text-accent-500 mt-1">{errors.nama[0]}</p>}
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
          placeholder="Catatan tambahan, definisi, atau batasan"
        />
        {errors.keterangan && (
          <p className="text-sm text-accent-500 mt-1">{errors.keterangan[0]}</p>
        )}
      </div>

      {/* Status aktif */}
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="is_active" className="text-sm text-slate-700">
          Aktif (bisa dipilih saat mencatat pelanggaran)
        </label>
      </div>

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
          {submitting ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Tambah'}
        </button>
      </div>
    </div>
  );
}