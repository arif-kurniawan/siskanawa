import apiClient from '../lib/axios';

export interface AnakWali {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string;
  hubungan: string;
  is_primary: boolean;
}

export interface WaliMurid {
  id: number;
  nama: string;
  email: string | null;
  nik: string | null;
  pekerjaan: string | null;
  no_hp: string;
  alamat: string;
  jumlah_anak?: number;
  anak?: AnakWali[];
}

export interface WaliMuridInput {
  name: string;
  email?: string;
  nik?: string;
  pekerjaan?: string;
  no_hp: string;
  alamat: string;
  anak?: { siswa_id: number; hubungan: string; is_primary?: boolean }[];
}

export const waliMuridService = {
  async getAll(params?: { search?: string; page?: number }) {
    const res = await apiClient.get('/api/wali-murid', { params: params || {} });
    return res.data; // { data, meta, ... } paginate
  },
  async getById(id: number): Promise<WaliMurid> {
    const res = await apiClient.get(`/api/wali-murid/${id}`);
    return res.data.data;
  },
  async create(data: WaliMuridInput) {
    const res = await apiClient.post('/api/wali-murid', data);
    return res.data.data;
  },
  async update(id: number, data: WaliMuridInput) {
    const res = await apiClient.put(`/api/wali-murid/${id}`, data);
    return res.data.data;
  },
  async remove(id: number) {
    await apiClient.delete(`/api/wali-murid/${id}`);
  },
  async tambahAnak(id: number, data: { siswa_id: number; hubungan: string; is_primary?: boolean }) {
    const res = await apiClient.post(`/api/wali-murid/${id}/anak`, data);
    return res.data.data;
  },
  async lepasAnak(id: number, siswaId: number) {
    await apiClient.delete(`/api/wali-murid/${id}/anak/${siswaId}`);
  },
};