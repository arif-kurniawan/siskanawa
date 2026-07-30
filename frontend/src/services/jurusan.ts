import apiClient from '../lib/axios';

export interface Jurusan {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  is_active: boolean;
  kaprodi?: { id: number; name: string } | null;
  jumlah_siswa?: number;
  created_at: string;
}

export interface JurusanInput {
  kode: string;
  nama: string;
  deskripsi?: string;
  kaprodi_id?: number | null;
  is_active: boolean;
}

export const jurusanService = {
  async getAll(search?: string): Promise<Jurusan[]> {
    const response = await apiClient.get('/api/jurusan', {
      params: search ? { search } : {},
    });
    return response.data.data; // API Resource membungkus dalam "data"
  },

  async getById(id: number): Promise<Jurusan> {
    const response = await apiClient.get(`/api/jurusan/${id}`);
    return response.data.data;
  },

  async create(data: JurusanInput): Promise<Jurusan> {
    const response = await apiClient.post('/api/jurusan', data);
    return response.data.data;
  },

  async update(id: number, data: JurusanInput): Promise<Jurusan> {
    const response = await apiClient.put(`/api/jurusan/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/jurusan/${id}`);
  },
};