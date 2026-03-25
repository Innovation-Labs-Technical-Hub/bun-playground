import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, LoginRequest, LoginResponse } from "../types/auth.types";
import apiClient from "../utils/api-client";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function initializeFromStorage() {
    const storedToken = localStorage.getItem("auth_token");
    const storedRefreshToken = localStorage.getItem("auth_refresh_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      refreshToken.value = storedRefreshToken;
      try {
        user.value = JSON.parse(storedUser);
      } catch {
        clearStorage();
      }
    }
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    isLoading.value = true;
    try {
      // For demo purposes, simulate a successful login
      // In production, replace with: const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
      const response: LoginResponse = {
        token: "demo-jwt-token-" + Date.now(),
        refreshToken: "demo-refresh-token-" + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: "1",
          email: credentials.email,
          name: "Admin User",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      token.value = response.token;
      refreshToken.value = response.refreshToken;
      user.value = response.user;

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    clearStorage();
    user.value = null;
    token.value = null;
    refreshToken.value = null;
  }

  function clearStorage() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
  }

  return {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    initializeFromStorage,
    login,
    logout,
  };
});
