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
  foto_url?: string | null;
  dokumen_url?: string | null;
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
  async tambahTindakLanjut(id: number, data: { jenis: string; isi: string; ditujukan_ke_ortu?: boolean; ubah_status?: string; foto?: File | null; dokumen?: File | null }) 
  {
    const form = new FormData();
    form.append('jenis', data.jenis);
    form.append('isi', data.isi);
    form.append('ditujukan_ke_ortu', data.ditujukan_ke_ortu ? '1' : '0');
    if (data.ubah_status) form.append('ubah_status', data.ubah_status);
    if (data.foto) form.append('foto', data.foto);
    if (data.dokumen) form.append('dokumen', data.dokumen);

    const res = await apiClient.post(`/api/pembinaan/${id}/tindak-lanjut`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async eskalasi(id: number, catatan: string) {
    const res = await apiClient.post(`/api/pembinaan/${id}/eskalasi`, { catatan });
    return res.data;
  },

  
};