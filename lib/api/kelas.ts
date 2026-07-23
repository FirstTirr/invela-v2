import { fetchWithAuth } from './fetcher';

export interface Kelas {
  id: number;
  kelas: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKelas = {
  async getAll(): Promise<Kelas[]> {
    const result = await fetchWithAuth('/api/kelas', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async create(kelasName: string): Promise<Kelas> {
    const result = await fetchWithAuth('/api/kelas', {
      method: 'POST',
      body: JSON.stringify({ kelas: kelasName }),
    });
    return result.data;
  },

  async update(id: number, kelasName: string): Promise<Kelas> {
    const result = await fetchWithAuth(`/api/kelas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ kelas: kelasName }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/kelas/${id}`, { method: 'DELETE' });
  },
};