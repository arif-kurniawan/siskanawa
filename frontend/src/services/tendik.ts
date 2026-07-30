import apiClient from '../lib/axios';

export interface Tendik {
  id: number;
  nama: string;
  email: string;
  nip: string | null;
  unit_kerja: string | null;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string | null;
  no_hp: string | null;
  alamat: string | null;
  jabatan: string | null;
}

export interface TendikInput {
  nama: string;
  nip?: string;
  nuptk?: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir?: string;
  no_hp?: string;
  alamat?: string;
  unit_kerja?: string;
  jabatan?: string;
  email?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number; };
}

export const tendikService = {
  async getAll(params?: { search?: string; page?: number }): Promise<Paginated<Tendik>> {
    const response = await apiClient.get('/api/tendik', { params });
    return response.data;
  },
  async create(data: TendikInput): Promise<Tendik> {
    const response = await apiClient.post('/api/tendik', data);
    return response.data.data;
  },
  async update(id: number, data: TendikInput): Promise<Tendik> {
    const response = await apiClient.put(`/api/tendik/${id}`, data);
    return response.data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/tendik/${id}`);
  },
};