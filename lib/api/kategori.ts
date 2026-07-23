import { fetchWithAuth } from './fetcher';

export interface Kategori {
  id: number;
  kategori: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKategori = {
  async getAll(): Promise<Kategori[]> {
    const result = await fetchWithAuth('/api/kategori', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async create(kategoriName: string): Promise<Kategori> {
    const result = await fetchWithAuth('/api/kategori', {
      method: 'POST',
      body: JSON.stringify({ Kategori: kategoriName }),
    });
    return result.data;
  },

  async update(id: number, kategoriName: string): Promise<Kategori> {
    const result = await fetchWithAuth(`/api/kategori/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ Kategori: kategoriName }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/kategori/${id}`, { method: 'DELETE' });
  },
};