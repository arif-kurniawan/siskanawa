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

  async create(data: SiswaInput): Promise<Siswa> {
    const response = await apiClient.post('/api/siswa', data);
    return response.data.data;
  },

  async update(id: number, data: SiswaInput): Promise<Siswa> {
    const response = await apiClient.put(`/api/siswa/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/siswa/${id}`);
  },
};

// Tambahan option kelas di service kelas atau di sini
export interface OptionKelas { id: number; nama_lengkap: string; }
export const optionKelasService = {
  async kelas(): Promise<OptionKelas[]> {
    const response = await apiClient.get('/api/options/kelas');
    return response.data;
  },
};