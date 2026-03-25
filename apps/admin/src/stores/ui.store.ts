import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useUiStore = defineStore("ui", () => {
  const sidebarCollapsed = ref(false);
  const darkMode = ref(false);
  const isMobileMenuOpen = ref(false);

  function initializeFromStorage() {
    const storedSidebar = localStorage.getItem("ui_sidebar_collapsed");
    const storedDarkMode = localStorage.getItem("ui_dark_mode");

    if (storedSidebar !== null) {
      sidebarCollapsed.value = storedSidebar === "true";
    }
    if (storedDarkMode !== null) {
      darkMode.value = storedDarkMode === "true";
    } else {
      darkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    applyDarkMode();
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem("ui_sidebar_collapsed", String(sidebarCollapsed.value));
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    localStorage.setItem("ui_dark_mode", String(darkMode.value));
    applyDarkMode();
  }

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false;
  }

  function applyDarkMode() {
    if (darkMode.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return {
    sidebarCollapsed,
    darkMode,
    isMobileMenuOpen,
    initializeFromStorage,
    toggleSidebar,
    toggleDarkMode,
    toggleMobileMenu,
    closeMobileMenu,
  };
});
