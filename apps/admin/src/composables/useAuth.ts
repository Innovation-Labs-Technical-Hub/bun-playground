import { computed } from "vue";
import { useAuthStore } from "../stores/auth.store";
import type { LoginRequest } from "../types/auth.types";

export function useAuth() {
  const authStore = useAuthStore();

  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isLoading = computed(() => authStore.isLoading);
  const userInitials = computed(() => {
    if (!authStore.user?.name) return "?";
    return authStore.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  const login = async (credentials: LoginRequest) => {
    return authStore.login(credentials);
  };

  const logout = () => {
    authStore.logout();
  };

  const checkAuth = () => {
    authStore.initializeFromStorage();
  };

  const hasRole = (role: string) => {
    return authStore.user?.role === role;
  };

  const isAdmin = computed(() => authStore.user?.role === "admin");

  return {
    user,
    isAuthenticated,
    isLoading,
    userInitials,
    isAdmin,
    login,
    logout,
    checkAuth,
    hasRole,
  };
}
