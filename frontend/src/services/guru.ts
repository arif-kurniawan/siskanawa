import apiClient from '../lib/axios';

export interface Guru {
  id: number;
  nama: string;
  email: string;
  nip: string | null;
  nuptk: string | null;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string | null;
  no_hp: string | null;
  alamat: string | null;
  status_kepegawaian: string | null;
}

export interface GuruInput {
  nama: string;
  nip?: string;
  nuptk?: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir?: string;
  no_hp?: string;
  alamat?: string;
  status_kepegawaian?: string;
  email?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page: number; };
}

export const guruService = {
  async getAll(params?: { search?: string; page?: number }): Promise<Paginated<Guru>> {
    const response = await apiClient.get('/api/guru', { params });
    return response.data;
  },
  async create(data: GuruInput): Promise<Guru> {
    const response = await apiClient.post('/api/guru', data);
    return response.data.data;
  },
  async update(id: number, data: GuruInput): Promise<Guru> {
    const response = await apiClient.put(`/api/guru/${id}`, data);
    return response.data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/guru/${id}`);
  },
};