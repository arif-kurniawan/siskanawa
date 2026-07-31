import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JurusanPage } from './pages/jurusan/JurusanPage';
import { TahunAjaranPage } from './pages/tahun-ajaran/TahunAjaranPage';
import { KelasPage } from './pages/kelas/KelasPage';
import { SiswaPage } from './pages/siswa/SiswaPage';
import { GuruPage } from './pages/guru/GuruPage';
import { TendikPage } from './pages/tendik/TendikPage';
import { MataPelajaranPage } from './pages/mata-pelajaran/MataPelajaranPage';
import { PenugasanPage } from './pages/penugasan/PenugasanPage';
import { JurnalPage } from './pages/jurnal/JurnalPage';
import { ScanPage } from './pages/presensi-sholat/ScanPage';
import { RekapSholatPage } from './pages/presensi-sholat/RekapSholatPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Semua halaman dalam layout utama, terproteksi */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jurusan" element={<JurusanPage />} />
            <Route path="/tahun-ajaran" element={<TahunAjaranPage />} />
            <Route path="/kelas" element={<KelasPage />} />
            <Route path="/siswa" element={<SiswaPage />} />
            <Route path="/guru" element={<GuruPage />} />
            <Route path="/tendik" element={<TendikPage />} />
            <Route path="/mata-pelajaran" element={<MataPelajaranPage />} />
            <Route path="/penugasan" element={<PenugasanPage />} />
            <Route path="/jurnal" element={<JurnalPage />} />
            <Route path="/presensi-sholat/scan" element={<ScanPage />} />
            <Route path="/presensi-sholat/rekap" element={<RekapSholatPage />} />
            {/* Halaman lain nanti ditambahkan di sini */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;