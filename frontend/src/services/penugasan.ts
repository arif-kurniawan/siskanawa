import apiClient from '../lib/axios';

export interface Penugasan {
  id: number;
  guru: { id: number; name: string };
  mata_pelajaran: { id: number; nama: string };
  kelas: { id: number; nama_lengkap: string };
  tahun_ajaran: { id: number; nama: string };
}

export interface PenugasanInput {
  guru_id: number;
  mata_pelajaran_id: number;
  kelas_id: number;
  tahun_ajaran_id: number;
}

export interface PenugasanSaya {
  id: number;
  mata_pelajaran: { id: number; nama: string };
  kelas: { id: number; nama_lengkap: string };
}

export const penugasanService = {
  async getAll(guruId?: number): Promise<Penugasan[]> {
    const response = await apiClient.get('/api/penugasan', { params: guruId ? { guru_id: guruId } : {} });
    return response.data;
  },
  async create(data: PenugasanInput) {
    const response = await apiClient.post('/api/penugasan', data);
    return response.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/penugasan/${id}`);
  },
  async milikSaya(): Promise<PenugasanSaya[]> {
    const response = await apiClient.get('/api/penugasan/milik-saya');
    return response.data;
  },
};