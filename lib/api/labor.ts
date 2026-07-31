import { fetchWithAuth } from './fetcher';
import { Jurusan } from './jurusan';

export interface Labor {
  id: number;
  id_jurusan?: number;
  idJurusan?: number;
  ID_Jurusan?: number;
  jurusan?: Jurusan | any;
  Jurusan?: Jurusan | any;
  labor: string;
  created_at?: string;
  updated_at?: string;
}

export const apiLabor = {
  async getAll(): Promise<Labor[]> {
    const result = await fetchWithAuth('/api/labor', { method: 'GET', cache: 'no-store' });
    const rawData = result.data || [];
    
    return rawData.map((item: any) => {
      const resolvedJurusanId = item.id_jurusan ?? item.idJurusan ?? item.ID_Jurusan ?? item.IDJurusan;
      const resolvedJurusanObj = item.jurusan || item.Jurusan;

      return {
        ...item,
        id_jurusan: resolvedJurusanId,
        jurusan: resolvedJurusanObj ? {
          ...resolvedJurusanObj,
          jurusan: resolvedJurusanObj.jurusan || resolvedJurusanObj.nama_jurusan || resolvedJurusanObj.NamaJurusan || ''
        } : null
      };
    });
  },

  async getById(id: number): Promise<Labor> {
    const result = await fetchWithAuth(`/api/labor/${id}`, { method: 'GET' });
    return result.data;
  },

  async create(laborName: string, idJurusan?: number): Promise<Labor> {
    const result = await fetchWithAuth('/api/labor', {
      method: 'POST',
      body: JSON.stringify({ labor: laborName, id_jurusan: idJurusan }),
    });
    return result.data;
  },

  async update(id: number, laborName: string, idJurusan?: number): Promise<Labor> {
    const result = await fetchWithAuth(`/api/labor/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ labor: laborName, id_jurusan: idJurusan }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/labor/${id}`, { method: 'DELETE' });
  },
};