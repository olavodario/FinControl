import type { User } from "@fincontrol/types";
import { create } from "zustand";
import * as authService from "../services/auth.service.js";

interface AuthState {
  user: Omit<User, "createdAt" | "updatedAt"> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  restoreSession() {
    const token = localStorage.getItem("accessToken");
    const raw = localStorage.getItem("user");
    if (token && raw) {
      const user = JSON.parse(raw) as Omit<User, "createdAt" | "updatedAt">;
      set({ user, accessToken: token, isAuthenticated: true });
    }
  },

  async login(email, password) {
    const data = await authService.login({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
  },

  async register(name, email, password) {
    const data = await authService.register({ name, email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
  },

  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => undefined);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
