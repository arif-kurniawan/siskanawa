import apiClient from '../lib/axios';

export interface Kelas {
  id: number;
  tingkat: 'X' | 'XI' | 'XII';
  nama_rombel: string;
  nama_lengkap: string;
  jurusan?: { id: number; kode: string; nama: string };
  tahun_ajaran?: { id: number; nama: string; semester: string };
  wali_kelas?: { id: number; name: string } | null;
  jumlah_siswa?: number;
}

export interface KelasInput {
  jurusan_id: number;
  tahun_ajaran_id: number;
  tingkat: 'X' | 'XI' | 'XII';
  nama_rombel: string;
  wali_kelas_id?: number | null;
}

// Tipe untuk dropdown options
export interface OptionJurusan { id: number; kode: string; nama: string; }
export interface OptionTahunAjaran { id: number; nama: string; semester: string; is_active: boolean; }
export interface OptionGuru { id: number; name: string; }

export const kelasService = {
  async getAll(): Promise<Kelas[]> {
    const response = await apiClient.get('/api/kelas');
    return response.data.data;
  },

  async create(data: KelasInput): Promise<Kelas> {
    const response = await apiClient.post('/api/kelas', data);
    return response.data.data;
  },

  async update(id: number, data: KelasInput): Promise<Kelas> {
    const response = await apiClient.put(`/api/kelas/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/kelas/${id}`);
  },
};

export const optionService = {
  async jurusan(): Promise<OptionJurusan[]> {
    const response = await apiClient.get('/api/options/jurusan');
    return response.data;
  },
  async tahunAjaran(): Promise<OptionTahunAjaran[]> {
    const response = await apiClient.get('/api/options/tahun-ajaran');
    return response.data;
  },
  async guru(): Promise<OptionGuru[]> {
    const response = await apiClient.get('/api/options/guru');
    return response.data;
  },
};