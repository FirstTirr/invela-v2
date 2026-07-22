// lib/api/item-instance.ts
import { Perangkat } from './perangkat';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ItemInstance {
  id: number;
  id_perangkat: number;
  perangkat?: Perangkat; // 👈 Hasil Preload dari Backend GORM
  kode_asset: string;
  status: 'aktif' | 'rusak' | 'perbaikan' | 'nonaktif';
  created_at?: string;
  updated_at?: string;
}

export interface CreateItemInstanceInput {
  id_perangkat: number;
  kode_asset: string;
  status: string;
}

export interface UpdateItemInstanceInput {
  id_perangkat?: number;
  kode_asset?: string;
  status?: string;
}

export const apiItemInstance = {
  getAll: async (): Promise<ItemInstance[]> => {
    const res = await fetch(`${BASE_URL}/api/item-instance`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil data item instance');
    const json = await res.json();
    return json.data || [];
  },

  getById: async (id: number): Promise<ItemInstance> => {
    const res = await fetch(`${BASE_URL}/api/item-instance/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil detail item instance');
    const json = await res.json();
    return json.data;
  },

  create: async (data: CreateItemInstanceInput): Promise<ItemInstance> => {
    const res = await fetch(`${BASE_URL}/api/item-instance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menambahkan unit instance');
    }
    const json = await res.json();
    return json.data;
  },

  update: async (id: number, data: UpdateItemInstanceInput): Promise<ItemInstance> => {
    const res = await fetch(`${BASE_URL}/api/item-instance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal mengubah unit instance');
    }
    const json = await res.json();
    return json.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/item-instance/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menghapus unit instance');
    }
  },
};