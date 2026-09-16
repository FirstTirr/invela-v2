import { fetchWithAuth } from './fetcher';

export interface Jurusan {
  id: number;
  nama_jurusan: string; // Sesuai dengan field database backend Go
  jurusan?: string;     // Alias cadangan jika komponen memanggil .jurusan
  created_at?: string;
  updated_at?: string;
}

interface RawJurusanResponse extends Partial<Jurusan> {
  NamaJurusan?: string;
}

export const apiJurusan = {
  async getAll(): Promise<Jurusan[]> {
    const result = await fetchWithAuth('/api/jurusan', { method: 'GET', cache: 'no-store' });
    const rawData = (result.data || []) as RawJurusanResponse[];
    
    // Mapping otomatis agar properti 'nama_jurusan' dan 'jurusan' sinkron dua arah
    return rawData.map((item) => ({
      ...item,
      id: item.id || 0,
      nama_jurusan: item.nama_jurusan || item.jurusan || item.NamaJurusan || '',
      jurusan: item.jurusan || item.nama_jurusan || item.NamaJurusan || '',
    }));
  },

  async create(namaJurusan: string): Promise<Jurusan> {
    const result = await fetchWithAuth('/api/jurusan', {
      method: 'POST',
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    const item = (result.data || {}) as RawJurusanResponse;
    return {
      ...item,
      id: item.id || 0,
      nama_jurusan: item.nama_jurusan || item.jurusan || namaJurusan,
      jurusan: item.jurusan || item.nama_jurusan || namaJurusan,
    };
  },

  async update(id: number, namaJurusan: string): Promise<Jurusan> {
    const result = await fetchWithAuth(`/api/jurusan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    const item = (result.data || {}) as RawJurusanResponse;
    return {
      ...item,
      id: item.id || id,
      nama_jurusan: item.nama_jurusan || item.jurusan || namaJurusan,
      jurusan: item.jurusan || item.nama_jurusan || namaJurusan,
    };
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/jurusan/${id}`, { method: 'DELETE' });
  },
};