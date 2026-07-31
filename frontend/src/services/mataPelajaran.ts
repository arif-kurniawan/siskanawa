import apiClient from '../lib/axios';

export interface MataPelajaran {
  id: number;
  kode: string;
  nama: string;
  kategori: 'umum' | 'kejuruan' | 'muatan_lokal';
  jurusan?: { id: number; kode: string; nama: string } | null;
}

export interface MataPelajaranInput {
  kode: string;
  nama: string;
  kategori: 'umum' | 'kejuruan' | 'muatan_lokal';
  jurusan_id?: number | null;
}

export const mataPelajaranService = {
  async getAll(search?: string): Promise<MataPelajaran[]> {
    const response = await apiClient.get('/api/mata-pelajaran', { params: search ? { search } : {} });
    return response.data.data;
  },
  async create(data: MataPelajaranInput): Promise<MataPelajaran> {
    const response = await apiClient.post('/api/mata-pelajaran', data);
    return response.data.data;
  },
  async update(id: number, data: MataPelajaranInput): Promise<MataPelajaran> {
    const response = await apiClient.put(`/api/mata-pelajaran/${id}`, data);
    return response.data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/mata-pelajaran/${id}`);
  },
};