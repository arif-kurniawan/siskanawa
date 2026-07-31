import apiClient from '../lib/axios';

export const presensiSholatService = {
  async sesiHariIni() {
    const res = await apiClient.get('/api/presensi-sholat/sesi-hari-ini');
    return res.data;
  },
  async catat(data: { nis?: string; siswa_id?: number; metode: 'scan' | 'manual' }) {
    const res = await apiClient.post('/api/presensi-sholat/catat', data);
    return res.data;
  },
  async daftarHadir() {
    const res = await apiClient.get('/api/presensi-sholat/daftar-hadir');
    return res.data;
  },
  async cariSiswa(q: string) {
    const res = await apiClient.get('/api/presensi-sholat/cari-siswa', { params: { q } });
    return res.data;
  },
  async rekap(dari?: string, sampai?: string) {
    const res = await apiClient.get('/api/presensi-sholat/rekap', { params: { dari, sampai } });
    return res.data;
  },
};