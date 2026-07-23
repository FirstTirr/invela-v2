import { fetchWithAuth } from './fetcher';

// 1. Definisikan dan EXPORT interface Perangkat
export interface Perangkat {
  id: number;
  nama_perangkat?: string;
  deskripsi?: string;
  id_labor?: number | string;
  kategori_id?: number | string;
  created_at?: string;
  updated_at?: string;
}

export const apiPerangkat = {
  async getAll(): Promise<Perangkat[]> {
    const result = await fetchWithAuth('/api/perangkat', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },
  async getById(id: number): Promise<Perangkat> {
    const result = await fetchWithAuth(`/api/perangkat/${id}`, { method: 'GET' });
    return result.data;
  },
  async create(payload: Partial<Perangkat>): Promise<Perangkat> {
    const result = await fetchWithAuth('/api/perangkat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result.data;
  },
  async update(id: number, payload: Partial<Perangkat>): Promise<Perangkat> {
    const result = await fetchWithAuth(`/api/perangkat/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return result.data;
  },
  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/perangkat/${id}`, { method: 'DELETE' });
  },
};