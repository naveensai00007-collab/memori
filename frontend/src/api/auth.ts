import { apiClient } from './client';
import { AuthResponse, UserSettings } from '../../../shared/types';

export const authApi = {
  async register(email: string, masterPassword: string, salt: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      master_password: masterPassword,
      encryption_salt: salt,
    });
    return res.data;
  },

  async login(email: string, masterPassword: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      master_password: masterPassword,
    });
    return res.data;
  },

  async getProfile() {
    const res = await apiClient.get<{ user: any }>('/auth/me');
    return res.data.user;
  },

  async updateSettings(settings: Partial<UserSettings>) {
    const res = await apiClient.put('/users/me/settings', settings);
    return res.data;
  },

  async changePassword(oldPassword: string, newPassword: string, newSalt?: string) {
    const res = await apiClient.post('/users/me/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
      new_salt: newSalt,
    });
    return res.data;
  },

  async deleteAccount(masterPassword: string) {
    const res = await apiClient.post('/users/me/delete-account', {
      master_password: masterPassword,
    });
    return res.data;
  },

  async exportData() {
    const res = await apiClient.get('/users/me/export');
    return res.data;
  },
};
