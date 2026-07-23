const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // 1. Ambil token dari localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 2. Siapkan Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 3. Sisipkan Bearer Token
  if (token && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Menjamin endpoint diawali slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 4. Eksekusi Fetch
  const response = await fetch(`${API_BASE_URL}${formattedEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // 5. Handle Token Expired / Invalid
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }

  return data;
}