import apiClient from '../lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  roles: string[];
  permissions: string[];
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/login', {
      email,
      password,
    });
    // Simpan token setelah login sukses
    localStorage.setItem('auth_token', response.data.token);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/logout');
    } finally {
      // Hapus token apapun yang terjadi
      localStorage.removeItem('auth_token');
    }
  },

  async me(): Promise<Omit<AuthResponse, 'token'>> {
    const response = await apiClient.get('/api/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};