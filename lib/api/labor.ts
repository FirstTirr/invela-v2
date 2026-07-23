import { fetchWithAuth } from './fetcher';

export interface Labor {
  id: number;
  labor: string;
  created_at?: string;
  updated_at?: string;
}

export const apiLabor = {
  async getAll(): Promise<Labor[]> {
    const result = await fetchWithAuth('/api/labor', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async getById(id: number): Promise<Labor> {
    const result = await fetchWithAuth(`/api/labor/${id}`, { method: 'GET' });
    return result.data;
  },

  async create(laborName: string): Promise<Labor> {
    const result = await fetchWithAuth('/api/labor', {
      method: 'POST',
      body: JSON.stringify({ labor: laborName }),
    });
    return result.data;
  },

  async update(id: number, laborName: string): Promise<Labor> {
    const result = await fetchWithAuth(`/api/labor/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ labor: laborName }),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/labor/${id}`, { method: 'DELETE' });
  },
};