import { useState, useEffect } from 'react';
import { Search, Users, TrendingDown } from 'lucide-react';
import { presensiSholatService } from '../../services/presensiSholat';

interface RekapSiswa {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string | null;
  hadir: number;
  tidak_hadir: number;
  persen_tidak_hadir: number;
  kategori: 'hijau' | 'kuning' | 'merah';
  foto_url?: string | null;
}

interface RekapData {
  total_sesi: number;
  periode: { dari: string; sampai: string };
  siswa: RekapSiswa[];
}

export function RekapSholatPage() {
  // Default periode: awal bulan ini sampai hari ini
  const awalBulan = new Date();
  awalBulan.setDate(1);
  const [dari, setDari] = useState(awalBulan.toISOString().slice(0, 10));
  const [sampai, setSampai] = useState(new Date().toISOString().slice(0, 10));

  const [data, setData] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState<'semua' | 'hijau' | 'kuning' | 'merah'>('semua');

  const load = async () => {
    setLoading(true);
    try {
      const result = await presensiSholatService.rekap(dari, sampai);
      setData(result);
    } catch (err) {
      console.error('Gagal memuat rekap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dari, sampai]);

  const kategoriBadge = (k: string) => {
    const map: Record<string, string> = {
      hijau: 'bg-green-100 text-green-700',
      kuning: 'bg-amber-100 text-amber-700',
      merah: 'bg-red-100 text-red-700',
    };
    return map[k] || 'bg-slate-100 text-slate-500';
  };

  const kategoriLabel = (k: string) => {
    const map: Record<string, string> = {
      hijau: 'Baik',
      kuning: 'Perhatian',
      merah: 'Mendesak',
    };
    return map[k] || k;
  };

  // Filter siswa berdasarkan pencarian & kategori
  const filtered = (data?.siswa || []).filter((s) => {
    const cocokSearch =
      s.nama?.toLowerCase().includes(search.toLowerCase()) ||
      s.nis?.toLowerCase().includes(search.toLowerCase()) ||
      (s.kelas || '').toLowerCase().includes(search.toLowerCase());
    const cocokKategori = filterKategori === 'semua' || s.kategori === filterKategori;
    return cocokSearch && cocokKategori;
  });

  // Hitung ringkasan per kategori
  const ringkasan = (data?.siswa || []).reduce(
    (acc, s) => {
      acc[s.kategori]++;
      acc.total++;
      return acc;
    },
    { hijau: 0, kuning: 0, merah: 0, total: 0 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Rekap Presensi Sholat</h1>
        <p className="text-slate-500 mt-1">
          Rekapitulasi kehadiran sholat berjamaah siswa muslim
        </p>
      </div>

      {/* Filter periode */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dari}
              onChange={(e) => setDari(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        {data && (
          <p className="text-sm text-slate-500 mt-3">
            Total sesi wajib dalam periode ini: <span className="font-semibold text-slate-700">{data.total_sesi} sesi</span>
          </p>
        )}
      </div>

      {/* Ringkasan kategori (juga berfungsi sebagai filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => setFilterKategori('semua')}
          className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'semua' ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Users size={16} /> Total
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{ringkasan.total}</p>
        </button>

        <button
          onClick={() => setFilterKategori('hijau')}
          className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'hijau' ? 'border-green-500 ring-2 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="text-green-600 text-sm mb-1 font-medium">Baik</div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{ringkasan.hijau}</p>
        </button>

        <button
          onClick={() => setFilterKategori('kuning')}
          className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'kuning' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="text-amber-600 text-sm mb-1 font-medium">Perhatian</div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{ringkasan.kuning}</p>
        </button>

        <button
          onClick={() => setFilterKategori('merah')}
          className={`bg-white rounded-xl border p-4 text-left transition ${filterKategori === 'merah' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className="text-red-600 text-sm mb-1 font-medium">Mendesak</div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">{ringkasan.merah}</p>
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative mb-4 max-w-xs">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / NIS / kelas..."
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
        />
      </div>

      {/* Tabel rekap */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Nama</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kelas</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">Hadir</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">Tidak Hadir</th>
                <th className="text-center font-semibold text-slate-600 px-4 py-3">% Absen</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Kategori</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-8">Memuat data...</td>
                </tr>
              ) : !data || data.total_sesi === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    Belum ada sesi presensi dalam periode ini.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    Tidak ada siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.siswa_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.foto_url ? (
                          <img src={s.foto_url} alt={s.nama} className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500">
                            {s.nama.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{s.nama}</p>
                          <p className="text-xs text-slate-400">{s.nis}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.kelas || '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-600 tabular-nums">{s.hadir}</td>
                    <td className="px-4 py-3 text-center text-slate-600 tabular-nums">{s.tidak_hadir}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 tabular-nums font-medium text-slate-700">
                        {s.persen_tidak_hadir > 40 && <TrendingDown size={14} className="text-red-500" />}
                        {s.persen_tidak_hadir}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${kategoriBadge(s.kategori)}`}>
                        {kategoriLabel(s.kategori)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keterangan kategori */}
      {data && data.total_sesi > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-medium text-slate-700">Keterangan kategori</span> (berdasarkan persentase ketidakhadiran):
            {' '}<span className="text-green-600 font-medium">Baik</span> ≤ 20%,
            {' '}<span className="text-amber-600 font-medium">Perhatian</span> 21–40%,
            {' '}<span className="text-red-600 font-medium">Mendesak</span> &gt; 40%.
            Rekap ini adalah satu masukan untuk pembinaan BK, bukan penilaian tunggal.
          </p>
        </div>
      )}
    </div>
  );
}