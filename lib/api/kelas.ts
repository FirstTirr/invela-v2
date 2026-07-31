import { fetchWithAuth } from './fetcher';
import { Jurusan } from './jurusan';

export interface Kelas {
  id: number;
  id_jurusan: number;
  jurusan?: Jurusan;
  kelas: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKelas = {
  async getAll(): Promise<Kelas[]> {
    const result = await fetchWithAuth('/api/kelas', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async create(kelasName: string, idJurusan: number): Promise<Kelas> {
    const result = await fetchWithAuth('/api/kelas', {
      method: 'POST',
      body: JSON.stringify({ kelas: kelasName, id_jurusan: idJurusan }),
    });
    return result.data;
  },

  async update(id: number, kelasName: string, idJurusan: number): Promise<Kelas> {
    const result = await fetchWithAuth(`/api/kelas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ kelas: kelasName, id_jurusan: idJurusan }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/kelas/${id}`, { method: 'DELETE' });
  },
};