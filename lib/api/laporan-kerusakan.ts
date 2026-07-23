// lib/api/laporan-kerusakan.ts
import { ItemInstance } from './item-instance';

export interface Kerusakan {
  id: number;
  id_item_instance: number;
  item_instance?: ItemInstance;
  id_user: number;
  user?: any; // 👈 Ubah jadi any jika tipe User di users.ts belum ada/berbeda
  deskripsi: string;
  status: 'butuh tindakan' | 'sedang diperbaiki' | 'selesai' | string;
  created_at: string;
  updated_at: string;
}

export interface CreateKerusakanInput {
  id_item_instance: number;
  deskripsi: string;
  status?: string;
}

export interface UpdateKerusakanInput {
  id_item_instance?: number;
  deskripsi?: string;
  status?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiKerusakan = {
  getAll: async (): Promise<Kerusakan[]> => {
    const res = await fetch(`${API_BASE_URL}/api/kerusakan`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil daftar kerusakan');
    const json = await res.json();
    return json.data || [];
  },

  create: async (data: CreateKerusakanInput): Promise<Kerusakan> => {
    const res = await fetch(`${API_BASE_URL}/api/kerusakan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal membuat laporan kerusakan');
    }
    return json.data;
  },

  getById: async (id: number): Promise<Kerusakan> => {
    const res = await fetch(`${API_BASE_URL}/api/kerusakan/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Kerusakan tidak ditemukan');
    const json = await res.json();
    return json.data;
  },

  update: async (id: number, data: UpdateKerusakanInput): Promise<Kerusakan> => {
    const res = await fetch(`${API_BASE_URL}/api/kerusakan/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal memperbarui laporan kerusakan');
    }
    return json.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/kerusakan/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus data kerusakan');
  },
};