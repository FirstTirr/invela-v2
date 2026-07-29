import { fetchWithAuth } from '@/lib/api/fetcher';
import { Kerusakan } from './laporan-kerusakan';

// Tipe User fleksibel untuk Perbaikan
export interface UserPerbaikan {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface Perbaikan {
  id: number;
  id_kerusakan: number;
  kerusakan?: Kerusakan;
  id_user: number;
  user?: UserPerbaikan;
  deskripsi_perbaikan: string;
  biaya: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePerbaikanInput {
  id_kerusakan: number;
  deskripsi_perbaikan: string;
  biaya: number;
}

export interface UpdatePerbaikanInput {
  deskripsi_perbaikan?: string;
  biaya?: number;
}

export const apiPerbaikan = {
  // Ambil semua daftar perbaikan
  getAll: async (): Promise<Perbaikan[]> => {
    const result = await fetchWithAuth('/api/perbaikan', {
      cache: 'no-store',
    });
    return result.data || [];
  },

  // Ambil detail perbaikan berdasarkan ID
  getById: async (id: number): Promise<Perbaikan> => {
    const result = await fetchWithAuth(`/api/perbaikan/${id}`);
    return result.data;
  },

  // Buat data perbaikan baru (User ID diambil otomatis oleh backend dari JWT Token)
  create: async (data: CreatePerbaikanInput): Promise<Perbaikan> => {
    const result = await fetchWithAuth('/api/perbaikan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  // Update data perbaikan (Partial Update)
  update: async (id: number, data: UpdatePerbaikanInput): Promise<Perbaikan> => {
    const result = await fetchWithAuth(`/api/perbaikan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  // Hapus data perbaikan
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/api/perbaikan/${id}`, {
      method: 'DELETE',
    });
  },
};