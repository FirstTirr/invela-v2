import { fetchWithAuth } from './fetcher';

// 1. PASTIKAN ADA KATA 'export'
export interface ItemInstance {
  id: number;
  id_perangkat?: number;  // 👈 Tambahkan ini
  perangkat_id?: number; // 👈 Jaga-jaga jika backend pakai field ini
  kode_asset: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const apiItemInstance = {
  async getAll(): Promise<ItemInstance[]> {
    const result = await fetchWithAuth('/api/item-instance', {
      method: 'GET',
      cache: 'no-store',
    });
    return result.data || [];
  },
  async getById(id: number): Promise<ItemInstance> {
    const result = await fetchWithAuth(`/api/item-instance/${id}`, {
      method: 'GET',
    });
    return result.data;
  },
  async create(payload: Partial<ItemInstance>): Promise<ItemInstance> {
    const result = await fetchWithAuth('/api/item-instance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result.data;
  },
  async update(id: number, payload: Partial<ItemInstance>): Promise<ItemInstance> {
    const result = await fetchWithAuth(`/api/item-instance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return result.data;
  },
  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/item-instance/${id}`, { method: 'DELETE' });
  },
};