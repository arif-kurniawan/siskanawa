import apiClient from '../lib/axios';

export type Kategori = 'kehadiran' | 'akademik' | 'etika' | 'poin_tatib' | 'lainnya';
export type Tingkat = 'ringan' | 'sedang' | 'berat';
export type StatusKasus = 'baru' | 'ditangani' | 'dipantau' | 'selesai';
export type Level = 'guru' | 'wali_kelas' | 'bk' | 'kepala_sekolah';

export interface Kasus {
  id: number;
  kategori: Kategori;
  tingkat: Tingkat;
  judul: string;
  deskripsi: string;
  status: StatusKasus;
  level_penanganan: Level;
  is_rahasia: boolean;
  siswa?: { id: number; user?: { name: string }; kelas?: { nama_lengkap: string } };
  pelapor?: { id: number; name: string };
  penanggung_jawab?: { id: number; name: string } | null;
  tindak_lanjut_count?: number;
  tindak_lanjut?: TindakLanjut[];
  created_at: string;
}

export interface TindakLanjut {
  id: number;
  jenis: 'catatan' | 'komunikasi_ortu' | 'eskalasi' | 'perubahan_status';
  isi: string;
  ditujukan_ke_ortu: boolean;
  level_dari: string | null;
  level_ke: string | null;
  user?: { name: string };
  created_at: string;
}

export interface KasusInput {
  siswa_id: number;
  kategori: Kategori;
  tingkat: Tingkat;
  judul: string;
  deskripsi: string;
  is_rahasia?: boolean;
}

export const pembinaanService = {
  async getAll(params?: { status?: string; kategori?: string; page?: number }) {
    const res = await apiClient.get('/api/pembinaan', { params });
    return res.data;
  },
  async getById(id: number): Promise<Kasus> {
    const res = await apiClient.get(`/api/pembinaan/${id}`);
    return res.data;
  },
  async create(data: KasusInput) {
    const res = await apiClient.post('/api/pembinaan', data);
    return res.data;
  },
  async tambahTindakLanjut(id: number, data: { jenis: string; isi: string; ditujukan_ke_ortu?: boolean; ubah_status?: string }) {
    const res = await apiClient.post(`/api/pembinaan/${id}/tindak-lanjut`, data);
    return res.data;
  },
  async eskalasi(id: number, catatan: string) {
    const res = await apiClient.post(`/api/pembinaan/${id}/eskalasi`, { catatan });
    return res.data;
  },
};