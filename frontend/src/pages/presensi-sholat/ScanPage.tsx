import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Check, X, Users, Search, Camera, CameraOff } from 'lucide-react';
import { presensiSholatService } from '../../services/presensiSholat';

interface HadirItem {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  waktu: string;
  metode: string;
  foto_url?: string | null;   // ← tambahkan
}

export function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [jumlahHadir, setJumlahHadir] = useState(0);
  const [daftarHadir, setDaftarHadir] = useState<HadirItem[]>([]);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
    siswa?: { nama: string; nis: string; kelas?: string | null; foto_url?: string | null };
  } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string>(''); // cegah scan sama berturut-turut
  const lastScanTimeRef = useRef<number>(0);
  

  // Muat sesi & daftar hadir awal
  useEffect(() => {
    presensiSholatService.sesiHariIni().then((d) => setJumlahHadir(d.jumlah_hadir)).catch(console.error);
    refreshDaftar();
  }, []);

  const refreshDaftar = async () => {
    try {
      const d = await presensiSholatService.daftarHadir();
      setDaftarHadir(d.hadir);
      setJumlahHadir(d.jumlah);
    } catch (e) {
      console.error(e);
    }
  };

  const showFeedback = (
    type: 'success' | 'error' | 'warning',
    text: string,
    siswa?: { nama: string; nis: string; kelas?: string | null; foto_url?: string | null }
  ) => {
    setFeedback({ type, text, siswa });
    setTimeout(() => setFeedback(null), 4000); // perpanjang jadi 4 detik biar sempat lihat foto
};

  const prosesNis = async (nis: string, metode: 'scan' | 'manual') => {
    try {
      const res = await presensiSholatService.catat({ nis, metode });
      if (res.duplikat) {
        showFeedback('warning', res.message);
      }
      else {
        showFeedback('success', `${res.siswa.nama} — hadir`, res.siswa);
        refreshDaftar();
      }
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Gagal mencatat.');
    }
  };

  // Mulai kamera
  const startScan = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' }, // kamera belakang
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Debounce: abaikan scan sama dalam 3 detik
          const now = Date.now();
          if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 3000) return;
          lastScanRef.current = decodedText;
          lastScanTimeRef.current = now;
          prosesNis(decodedText.trim(), 'scan');
        },
        () => {} // abaikan error per-frame
      );
    } catch (err) {
      showFeedback('error', 'Tidak bisa mengakses kamera.');
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) { /* ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Bersihkan kamera saat keluar halaman
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Pencarian manual
  useEffect(() => {
    if (!manualMode || searchQ.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await presensiSholatService.cariSiswa(searchQ);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, manualMode]);

  const catatManual = async (siswa: any) => {
    try {
      const res = await presensiSholatService.catat({ siswa_id: siswa.id, metode: 'manual' });
      if (res.duplikat) {
        showFeedback('warning', res.message);
      } else {
        showFeedback('success', `${res.siswa.nama} — hadir`, res.siswa);
        refreshDaftar();
        setSearchQ('');
        setSearchResults([]);
      }
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Gagal mencatat.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Presensi Sholat Berjamaah</h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Counter hadir */}
      <div className="bg-brand-500 text-white rounded-2xl p-5 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-1">
          <Users size={16} /> Total Hadir
        </div>
        <p className="text-4xl font-bold tabular-nums">{jumlahHadir}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-xl mb-4 ${
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' :
          feedback.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
          'bg-red-50 border border-red-200'
        }`}>
          {feedback.type === 'success' && feedback.siswa ? (
            // Kartu besar dengan foto untuk konfirmasi visual
            <div className="flex items-center gap-4 p-4">
              {feedback.siswa.foto_url ? (
                <img
                  src={feedback.siswa.foto_url}
                  alt={feedback.siswa.nama}
                  className="h-24 w-24 rounded-xl object-cover border-2 border-green-300 shrink-0"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-green-200 text-3xl font-bold text-green-700 shrink-0">
                  {feedback.siswa.nama.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-green-700 font-semibold">
                  <Check size={18} /> Hadir
                </div>
                <p className="text-lg font-bold text-slate-800 truncate">{feedback.siswa.nama}</p>
                <p className="text-sm text-slate-500">
                  NIS {feedback.siswa.nis}
                  {feedback.siswa.kelas ? ` • ${feedback.siswa.kelas}` : ''}
                </p>
              </div>
            </div>
          ) : (
            // Feedback biasa untuk warning/error
            <div className={`p-3 flex items-center gap-2 font-medium ${
              feedback.type === 'warning' ? 'text-amber-700' : 'text-red-700'
            }`}>
              {feedback.type === 'warning' ? <Users size={18} /> : <X size={18} />}
              {feedback.text}
            </div>
          )}
        </div>
      )}

      {/* Toggle scan / manual */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setManualMode(false); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${!manualMode ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          Scan QR
        </button>
        <button
          onClick={() => { setManualMode(true); if (scanning) stopScan(); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${manualMode ? 'bg-brand-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          Input Manual
        </button>
      </div>

      {/* Mode Scan */}
      {!manualMode && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
          <div id="qr-reader" className="rounded-xl overflow-hidden" />
          {!scanning ? (
            <button onClick={startScan} className="w-full mt-3 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium flex items-center justify-center gap-2">
              <Camera size={18} /> Mulai Scan
            </button>
          ) : (
            <button onClick={stopScan} className="w-full mt-3 py-3 rounded-lg bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-2">
              <CameraOff size={18} /> Hentikan
            </button>
          )}
        </div>
      )}

      {/* Mode Manual */}
      {manualMode && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => catatManual(s)}
                  className="w-full text-left p-3 rounded-lg hover:bg-brand-50 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* Foto siswa */}
                    {s.foto_url ? (
                      <img
                        src={s.foto_url}
                        alt={s.nama}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-base font-bold text-slate-500">
                        {s.nama.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{s.nama}</p>
                      <p className="text-xs text-slate-400">{s.nis} • {s.kelas}</p>
                    </div>
                  </div>
                  <Check size={16} className="text-brand-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daftar hadir terakhir */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Hadir Terakhir</h2>
        {daftarHadir.length === 0 ? (
          <p className="text-center text-slate-400 py-4 text-sm">Belum ada yang presensi.</p>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {daftarHadir.slice(0, 20).map((h) => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Foto siswa */}
                  {h.foto_url ? (
                    <img
                      src={h.foto_url}
                      alt={h.nama}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500 shrink-0">
                      {h.nama.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{h.nama}</p>
                    <p className="text-xs text-slate-400">{h.nis} • {h.kelas}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{h.waktu}</p>
                  {h.metode === 'manual' && <span className="text-xs text-amber-600">manual</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}