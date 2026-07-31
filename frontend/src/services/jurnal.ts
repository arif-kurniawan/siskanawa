import apiClient from '../lib/axios';

export type StatusKehadiran = 'hadir' | 'izin' | 'sakit' | 'alpa' | 'dispensasi';

export interface PresensiInput {
  siswa_id: number;
  status: StatusKehadiran;
  keterangan?: string;
}

export interface JurnalInput {
  kelas_id: number;
  mata_pelajaran_id: number;
  tanggal: string;
  jam_ke: number;
  materi: string;
  catatan?: string;
  presensi: PresensiInput[];
}

export interface Jurnal {
  id: number;
  tanggal: string;
  jam_ke: number;
  materi: string;
  catatan: string | null;
  kelas?: { id: number; nama_lengkap: string };
  mata_pelajaran?: { id: number; nama: string };
  guru?: { id: number; name: string };
  presensi_count?: number;
  rekap?: Record<StatusKehadiran, number>;
}

export interface SiswaKelas {
  id: number;
  nis: string;
  nama: string;
}

export const jurnalService = {
  async getAll(params?: { tanggal?: string; page?: number }) {
    const response = await apiClient.get('/api/jurnal', { params });
    return response.data; // paginated
  },
  async getById(id: number): Promise<Jurnal & { presensi: any[] }> {
    const response = await apiClient.get(`/api/jurnal/${id}`);
    return response.data;
  },
  async create(data: JurnalInput) {
    const response = await apiClient.post('/api/jurnal', data);
    return response.data;
  },
  async update(id: number, data: Partial<JurnalInput>) {
    const response = await apiClient.put(`/api/jurnal/${id}`, data);
    return response.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/jurnal/${id}`);
  },
  async siswaByKelas(kelasId: number): Promise<SiswaKelas[]> {
    const response = await apiClient.get(`/api/options/siswa-by-kelas/${kelasId}`);
    return response.data;
  },
};