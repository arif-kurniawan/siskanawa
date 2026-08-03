import { useState, useEffect } from 'react';
import { Search, Wand2 } from 'lucide-react';
import { deteksiDiniService } from '../../services/deteksiDini';
import type { DeteksiResponse } from '../../services/deteksiDini';
import { useAuth } from '../../contexts/AuthContext';

export function DeteksiDiniPage() {
  const { hasRole } = useAuth();
  const bolehGenerate = hasRole('guru_bk') || hasRole('kepala_sekolah');

  const [hari, setHari] = useState(30);
  const [data, setData] = useState<DeteksiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState<'semua' | 'merah' | 'kuning' | 'hijau'>('merah');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await deteksiDiniService.kehadiran(hari);
      setData(res);
      setSelected(new Set()); // reset pilihan tiap muat ulang
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [hari]);

  const kategoriBadge = (k: string) => ({
    hijau: 'bg-green-100 text-green-700',
    kuning: 'bg-amber-100 text-amber-700',
    merah: 'bg-red-100 text-red-700',
  }[k] || 'bg-slate-100');

  const filtered = (data?.siswa || []).filter((s) => {
    const cocokSearch =
      s.nama?.toLowerCase().includes(search.toLowerCase()) ||
      s.nis?.toLowerCase().includes(search.toLowerCase()) ||
      (s.kelas || '').toLowerCase().includes(search.toLowerCase());
    const cocokKategori = filterKategori === 'semua' || s.kategori === filterKategori;
    return cocokSearch && cocokKategori;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllMerah = () => {
    const merahIds = (data?.siswa || []).filter((s) => s.kategori === 'merah').map((s) => s.siswa_id);
    setSelected(new Set(merahIds));
  };

  const handleGenerate = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Generate draft kasus untuk ${selected.size} siswa terpilih?`)) return;
    setGenerating(true);
    try {
      const res = await deteksiDiniService.generateDraft(Array.from(selected), hari);
      alert(res.message);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal generate draft.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Deteksi Dini Kehadiran</h1>
        <p className="text-slate-500 mt-1">Siswa yang perlu perhatian berdasarkan data presensi kelas</p>
      </div>

      {/* Periode */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Periode Perhitungan</label>
        <div className="flex gap-2 flex-wrap">
          {[7, 14, 30, 60, 90].map((h) => (
            <button
              key={h}
              onClick={() => setHari(h)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${hari === h ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {h} hari
            </button>
          ))}
        </div>
        {data && (
          <p className="text-xs text-slate-400 mt-2">
            {data.periode.dari} s/d {data.periode.sampai} • Ambang: kuning ≥{data.ambang.kuning}%, merah ≥{data.ambang.merah}%
          </p>
        )}
      </div>

      {/* Ringkasan kategori (juga filter) */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <button onClick={() => setFilterKategori('merah')} className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'merah' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}>
            <div className="text-red-600 text-sm mb-1 font-medium">Mendesak</div>
            <p className="text-2xl font-bold text-slate-800">{data.ringkasan.merah}</p>
          </button>
          <button onClick={() => setFilterKategori('kuning')} className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'kuning' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'}`}>
            <div className="text-amber-600 text-sm mb-1 font-medium">Perhatian</div>
            <p className="text-2xl font-bold text-slate-800">{data.ringkasan.kuning}</p>
          </button>
          <button onClick={() => setFilterKategori('hijau')} className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'hijau' ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200'}`}>
            <div className="text-green-600 text-sm mb-1 font-medium">Aman</div>
            <p className="text-2xl font-bold text-slate-800">{data.ringkasan.hijau}</p>
          </button>
          <button onClick={() => setFilterKategori('semua')} className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'semua' ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}`}>
            <div className="text-slate-500 text-sm mb-1 font-medium">Total</div>
            <p className="text-2xl font-bold text-slate-800">{data.ringkasan.total}</p>
          </button>
        </div>
      )}

      {/* Toolbar generate (hanya BK/kepsek) */}
      {bolehGenerate && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={selectAllMerah} className="px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-700 hover:bg-red-100 transition">
            Pilih semua merah
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-sm text-slate-500">{selected.size} dipilih</span>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition disabled:opacity-60"
              >
                <Wand2 size={16} /> {generating ? 'Memproses...' : 'Generate Draft Kasus'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Pencarian */}
      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / NIS / kelas..."
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {bolehGenerate && <th className="px-4 py-3 w-10"></th>}
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Nama</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kelas</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">Hadir</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">Alpa</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">% Absen</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-8">Menghitung indikator...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-8">Tidak ada siswa dalam kategori ini.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.siswa_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    {bolehGenerate && (
                      <td className="px-4 py-3">
                        {s.kategori === 'merah' && (
                          <input
                            type="checkbox"
                            checked={selected.has(s.siswa_id)}
                            onChange={() => toggleSelect(s.siswa_id)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-100"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{s.nama}</p>
                      <p className="text-xs text-slate-400">{s.nis}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.kelas || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{s.hadir}/{s.total_pertemuan}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={s.alpa > 0 ? 'text-red-600 font-medium' : 'text-slate-400'}>{s.alpa}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{s.persen_tidak_hadir}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${kategoriBadge(s.kategori)}`}>
                        {s.kategori === 'merah' ? 'Mendesak' : s.kategori === 'kuning' ? 'Perhatian' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Indikator ini adalah alat bantu deteksi dini, bukan penilaian final. Draft kasus yang di-generate perlu ditinjau wali kelas sebelum ditindaklanjuti.
      </p>
    </div>
  );
}