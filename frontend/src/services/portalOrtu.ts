import apiClient from '../lib/axios';

export interface AnakItem {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string;
  hubungan: string;
  perlu_perhatian: number;
}

export interface ResponsItem {
  id: number;
  isi: string;
  dari: string;
  tanggal: string;
}

export interface CatatanOrtu {
  id: number;
  isi: string;
  dari: string;
  tanggal: string;
  kasus_judul: string | null;
  respons: ResponsItem[];
}

export const portalOrtuService = {
  async anakSaya(): Promise<{ anak: AnakItem[] }> {
    const res = await apiClient.get('/api/portal-ortu/anak-saya');
    return res.data;
  },
  async bukuPenghubung(siswaId: number): Promise<{ catatan: CatatanOrtu[] }> {
    const res = await apiClient.get(`/api/portal-ortu/buku-penghubung/${siswaId}`);
    return res.data;
  },
  async balas(tindakLanjutId: number, isi: string) {
    const res = await apiClient.post(`/api/portal-ortu/buku-penghubung/balas/${tindakLanjutId}`, { isi });
    return res.data;
  },
};