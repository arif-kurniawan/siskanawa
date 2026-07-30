import apiClient from '../lib/axios';

export interface TahunAjaran {
  id: number;
  nama: string;
  semester: 'ganjil' | 'genap';
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_active: boolean;
  created_at: string;
}

export interface TahunAjaranInput {
  nama: string;
  semester: 'ganjil' | 'genap';
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_active: boolean;
}

export const tahunAjaranService = {
  async getAll(): Promise<TahunAjaran[]> {
    const response = await apiClient.get('/api/tahun-ajaran');
    return response.data.data;
  },

  async create(data: TahunAjaranInput): Promise<TahunAjaran> {
    const response = await apiClient.post('/api/tahun-ajaran', data);
    return response.data.data;
  },

  async update(id: number, data: TahunAjaranInput): Promise<TahunAjaran> {
    const response = await apiClient.put(`/api/tahun-ajaran/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/tahun-ajaran/${id}`);
  },

  async setActive(id: number): Promise<TahunAjaran> {
    const response = await apiClient.patch(`/api/tahun-ajaran/${id}/set-active`);
    return response.data.data;
  },
};