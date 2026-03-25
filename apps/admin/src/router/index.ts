import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import TenantsView from "../views/TenantsView.vue";
import TenantDetailView from "../views/TenantDetailView.vue";
import UsersView from "../views/UsersView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false, title: "Login" },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true, title: "Dashboard" },
  },
  {
    path: "/tenants",
    name: "tenants",
    component: TenantsView,
    meta: { requiresAuth: true, title: "Tenants" },
  },
  {
    path: "/tenants/:id",
    name: "tenant-detail",
    component: TenantDetailView,
    meta: { requiresAuth: true, title: "Tenant Detail" },
  },
  {
    path: "/users",
    name: "users",
    component: UsersView,
    meta: { requiresAuth: true, title: "Users" },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
    meta: { requiresAuth: true, title: "Settings" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    authStore.initializeFromStorage();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.name === "login" && authStore.isAuthenticated) {
    next({ name: "dashboard" });
  } else {
    next();
  }
});

router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} - Admin` : "Admin";
});

export default router;
