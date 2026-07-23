import { fetchWithAuth } from './fetcher';

export interface Jurusan {
  id: number;
  nama_jurusan: string;
  created_at?: string;
  updated_at?: string;
}

export const apiJurusan = {
  async getAll(): Promise<Jurusan[]> {
    const result = await fetchWithAuth('/api/jurusan', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async create(namaJurusan: string): Promise<Jurusan> {
    const result = await fetchWithAuth('/api/jurusan', {
      method: 'POST',
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    return result.data;
  },

  async update(id: number, namaJurusan: string): Promise<Jurusan> {
    const result = await fetchWithAuth(`/api/jurusan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/jurusan/${id}`, { method: 'DELETE' });
  },
};