import { fetchWithAuth } from './fetcher';

export interface UserResponse {
  id: number;
  username: string;
  role: string;
  jurusan_id?: string | null;
  jurusan?: {
    id: number;
    nama_jurusan: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  username: string;
  password_hash: string;
  role_id: number;
  jurusan_id?: number | null;
}

export interface UpdateUserInput {
  username?: string;
  password_hash?: string;
  role_id?: number;
  jurusan_id?: number | null;
}

export const apiUsers = {
  async getAll(): Promise<UserResponse[]> {
    const result = await fetchWithAuth('/api/user', { method: 'GET', cache: 'no-store' });
    return result.data || [];
  },

  async getById(id: number): Promise<UserResponse> {
    const result = await fetchWithAuth(`/api/user/${id}`, { method: 'GET' });
    return result.data;
  },

  async create(input: CreateUserInput): Promise<UserResponse> {
    const result = await fetchWithAuth('/api/user', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return result.data;
  },

  async update(id: number, input: UpdateUserInput): Promise<UserResponse> {
    const result = await fetchWithAuth(`/api/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return result.data;
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/user/${id}`, { method: 'DELETE' });
  },
};