import { fetchWithAuth } from '@/lib/api/fetcher';
import { Labor } from './labor';
import { Kelas } from './kelas';

export interface Penggunaan {
  id: number;
  id_user: number;
  nama_pengguna: string;
  id_labor: number;
  labor?: Labor;
  id_kelas: number;
  kelas?: Kelas;
  jam_pelajaran_mulai: number;
  jam_pelajaran_selesai: number;
  created_at: string;
}

export interface CreatePenggunaanInput {
  id_user: number;
  id_labor: number;
  id_kelas: number;
  jam_pelajaran_mulai: number;
  jam_pelajaran_selesai: number;
}

export const apiPenggunaan = {
  // Ambil semua log penggunaan
  getAll: async (): Promise<Penggunaan[]> => {
    const result = await fetchWithAuth('/api/penggunaan', {
      cache: 'no-store',
    });
    return result.data || [];
  },

  // Ambil detail penggunaan berdasarkan ID
  getById: async (id: number): Promise<Penggunaan> => {
    const result = await fetchWithAuth(`/api/penggunaan/${id}`);
    return result.data;
  },

  // Buat log penggunaan baru
  create: async (data: CreatePenggunaanInput): Promise<Penggunaan> => {
    const result = await fetchWithAuth('/api/penggunaan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  // Hapus log penggunaan
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/api/penggunaan/${id}`, {
      method: 'DELETE',
    });
  },
};