import apiClient from '../lib/axios';

export interface PasalOption {
  id: number;
  kode: string;
  nama: string;
}

export interface JenisOption {
  id: number;
  kode: string;
  nama: string;
  poin: number;
}

export interface JenisPelanggaran {
  id: number;
  nama: string;
  keterangan: string | null;
  is_active: boolean;
  poin: number;
  pasal?: { id: number; kode: string; nama: string };
  jenis?: { id: number; kode: string; nama: string; poin: number };
}

export interface JenisPelanggaranInput {
  pasal_tatib_id: number;
  jenis_tatib_id: number;
  nama: string;
  keterangan?: string;
  is_active: boolean;
}

export interface PengaturanSanksi {
  id: number;
  nama: string;
  poin_min: number;
  poin_max: number | null;
  tindakan: string;
  level: number;
  is_active: boolean;
}

export interface CatatanInput {
  siswa_id: number;
  jenis_pelanggaran_id: number;
  tanggal: string;
  keterangan?: string;
}

export interface PenghapusanInput {
  siswa_id: number;
  tanggal: string;
  keterangan: string;
}

export interface RekapPoinRow {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string;
  total_poin: number;
  status_sanksi: string | null;
  level_sanksi: number | null;
  foto_url?: string | null;   // ← tambahkan
}

export interface RiwayatItem {
  id: number;
  tanggal: string;
  tipe: string;
  pelanggaran: string;
  poin: number;
  keterangan: string | null;
  pencatat: string | null;
}

export interface DetailPoin {
  siswa: { id: number; nama: string; nis: string; kelas: string };
  tahun_ajaran: string;
  semester: string;
  total_poin: number;
  status_sanksi: string | null;
  tindakan_sanksi: string | null;
  riwayat: RiwayatItem[];
}

export const tatibService = {
  async getPasalOptions(): Promise<PasalOption[]> {
    const response = await apiClient.get('/api/tatib/options/pasal');
    return response.data;
  },

  async getJenisOptions(): Promise<JenisOption[]> {
    const response = await apiClient.get('/api/tatib/options/jenis');
    return response.data;
  },

  async updateJenisPoin(jenisId: number, poin: number): Promise<void> {
    await apiClient.patch(`/api/tatib/jenis/${jenisId}/poin`, { poin });
  },

  async getSanksi(): Promise<PengaturanSanksi[]> {
    const response = await apiClient.get('/api/tatib/sanksi');
    return response.data;
  },

  async getAll(params?: { search?: string; pasal_id?: number; jenis_id?: number }): Promise<JenisPelanggaran[]> {
    const response = await apiClient.get('/api/tatib/jenis-pelanggaran', { params: params || {} });
    return response.data.data;
  },

  async create(data: JenisPelanggaranInput): Promise<JenisPelanggaran> {
    const response = await apiClient.post('/api/tatib/jenis-pelanggaran', data);
    return response.data.data;
  },

  async update(id: number, data: JenisPelanggaranInput): Promise<JenisPelanggaran> {
    const response = await apiClient.put(`/api/tatib/jenis-pelanggaran/${id}`, data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/tatib/jenis-pelanggaran/${id}`);
  },
};

export const catatanService = {
  async create(data: CatatanInput) {
    const response = await apiClient.post('/api/tatib/catatan', data);
    return response.data.data;
  },

  async penghapusanPoin(data: PenghapusanInput) {
    const response = await apiClient.post('/api/tatib/catatan/penghapusan-poin', data);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/tatib/catatan/${id}`);
  },

  async getRekap(params?: { kelas_id?: number; semester?: string }): Promise<{
    tahun_ajaran: string;
    semester: string;
    data: RekapPoinRow[];
  }> {
    const response = await apiClient.get('/api/tatib/rekap-poin', { params: params || {} });
    return response.data;
  },

  async getDetail(siswaId: number, semester?: string): Promise<DetailPoin> {
    const response = await apiClient.get(`/api/tatib/rekap-poin/${siswaId}`, {
      params: semester ? { semester } : {},
    });
    return response.data;
  },
};