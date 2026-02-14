import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { login, register } from "@/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  updateToken: (token: string) => void;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const res = await login({ email, password });
          localStorage.setItem("token", res.token);

          set({
            user: res.user,
            token: res.token,
            refreshToken: res.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });

        try {
          const res = await register({
            email,
            password,
            name,
          });

          localStorage.setItem("token", res.token);

          set({
            user: res.user,
            token: res.token,
            refreshToken: res.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      clearAuth: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      updateToken: (token) => set({ token }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
