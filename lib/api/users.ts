const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  // GET: Fetch list seluruh user
  async getAll(): Promise<UserResponse[]> {
    const res = await fetch(`${BASE_URL}/api/user`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data pengguna');
    }

    const result = await res.json();
    return result.data || [];
  },

  // GET: Fetch detail user berdasarkan ID
  async getById(id: number): Promise<UserResponse> {
    const res = await fetch(`${BASE_URL}/api/user/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Pengguna tidak ditemukan');
    }

    const result = await res.json();
    return result.data;
  },

  // POST: Tambah user baru
  async create(input: CreateUserInput): Promise<UserResponse> {
    const res = await fetch(`${BASE_URL}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal membuat akun pengguna');
    }

    const result = await res.json();
    return result.data;
  },

  // PUT: Update data user
  async update(id: number, input: UpdateUserInput): Promise<UserResponse> {
    const res = await fetch(`${BASE_URL}/api/user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal memperbarui pengguna');
    }

    const result = await res.json();
    return result.data;
  },

  // DELETE: Hapus user
  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/user/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menghapus pengguna');
    }
  },
};