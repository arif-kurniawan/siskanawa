import apiClient from '../lib/axios';

export interface Siswa {
  id: number;
  nis: string;
  nisn: string | null;
  nama: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  alamat: string;
  no_hp: string | null;
  status: 'aktif' | 'lulus' | 'pindah' | 'keluar';
  angkatan: number;
  jurusan?: { id: number; kode: string; nama: string };
  kelas?: { id: number; nama_lengkap: string } | null;
  foto_url?: string | null;
}

export interface SiswaInput {
  nama: string;
  nis: string;
  nisn?: string;
  jurusan_id: number;
  kelas_id?: number | null;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  alamat: string;
  no_hp?: string;
  angkatan: number;
  email?: string;
  status?: string;
  foto_url?: string | null;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export const siswaService = {
  async getAll(params?: { search?: string; page?: number; kelas_id?: number }): Promise<Paginated<Siswa>> {
    const response = await apiClient.get('/api/siswa', { params });
    return response.data;
  },

  // create menerima FormData (supaya foto ikut)
  async create(data: FormData): Promise<Siswa> {
    const response = await apiClient.post('/api/siswa', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // update: POST + _method PUT (spoofing) supaya file terbaca PHP
  async update(id: number, data: FormData): Promise<Siswa> {
    data.append('_method', 'PUT');
    const response = await apiClient.post(`/api/siswa/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // ganti foto saja (endpoint khusus)
  async updateFoto(id: number, foto: File) {
    const form = new FormData();
    form.append('foto', foto);
    const res = await apiClient.post(`/api/siswa/${id}/foto`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async import(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/api/siswa/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/siswa/${id}`);
  },
};

export interface OptionKelas { id: number; nama_lengkap: string; }
export const optionKelasService = {
  async kelas(): Promise<OptionKelas[]> {
    const response = await apiClient.get('/api/options/kelas');
    return response.data;
  },
};