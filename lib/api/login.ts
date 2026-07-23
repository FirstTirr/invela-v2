const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.68.57:8080/api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      role: string;
      // Dapatkan jurusan dari DB via response backend
      jurusan_id?: number | null; 
      jurusan?: string | null; 
    };
  };
}

export const apiAuth = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal login");
    }

    return result;
  },
};