import apiClient from '../lib/axios';

export interface IndikatorSiswa {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string | null;
  kelas_id: number;
  total_pertemuan: number;
  hadir: number;
  alpa: number;
  izin: number;
  sakit: number;
  tidak_hadir: number;
  persen_tidak_hadir: number;
  kategori: 'hijau' | 'kuning' | 'merah';
}

export interface DeteksiResponse {
  periode: { dari: string; sampai: string; hari: number };
  ambang: { kuning: number; merah: number };
  ringkasan: { merah: number; kuning: number; hijau: number; total: number };
  siswa: IndikatorSiswa[];
}

export const deteksiDiniService = {
  async kehadiran(hari: number = 30, kelasId?: number): Promise<DeteksiResponse> {
    const res = await apiClient.get('/api/deteksi-dini/kehadiran', {
      params: { hari, ...(kelasId ? { kelas_id: kelasId } : {}) },
    });
    return res.data;
  },
  async generateDraft(siswaIds: number[], hari: number): Promise<{ message: string; dibuat: number; dilewati: number }> {
    const res = await apiClient.post('/api/deteksi-dini/generate-draft', { siswa_ids: siswaIds, hari });
    return res.data;
  },
};