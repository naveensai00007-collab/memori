import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserSettings } from '../../../shared/types';
import { authApi } from '../api/auth';
import { generateSaltBase64 } from '../lib/encryption';

interface AuthState {
  user: User | null;
  token: string | null;
  encryptionPassword: string | null; // Kept in memory only during active session
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, masterPassword: string) => Promise<void>;
  register: (email: string, masterPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  setEncryptionPassword: (pwd: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('memori_token'),
      encryptionPassword: null,
      isAuthenticated: !!localStorage.getItem('memori_token'),
      isLoading: false,

      login: async (email: string, masterPassword: string) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, masterPassword);
          localStorage.setItem('memori_token', res.token);
          if (res.refresh_token) {
            localStorage.setItem('memori_refresh_token', res.refresh_token);
          }

          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              encryption_salt: res.user.encryption_salt,
              settings: res.user.settings,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            token: res.token,
            encryptionPassword: masterPassword,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email: string, masterPassword: string) => {
        set({ isLoading: true });
        try {
          const clientSalt = generateSaltBase64();
          const res = await authApi.register(email, masterPassword, clientSalt);
          localStorage.setItem('memori_token', res.token);
          if (res.refresh_token) {
            localStorage.setItem('memori_refresh_token', res.refresh_token);
          }

          set({
            user: {
              id: res.user.id,
              email: res.user.email,
              encryption_salt: res.user.encryption_salt,
              settings: res.user.settings,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            token: res.token,
            encryptionPassword: masterPassword,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('memori_token');
        localStorage.removeItem('memori_refresh_token');
        localStorage.removeItem('memori_last_sync_timestamp');
        set({
          user: null,
          token: null,
          encryptionPassword: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userUpdates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...userUpdates } as User });
        }
      },

      updateSettings: async (settingsUpdate) => {
        const res = await authApi.updateSettings(settingsUpdate);
        const current = get().user;
        if (current) {
          set({ user: { ...current, settings: res.settings } });
        }
      },

      setEncryptionPassword: (pwd: string) => {
        set({ encryptionPassword: pwd });
      },
    }),
    {
      name: 'memori_auth_state',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
