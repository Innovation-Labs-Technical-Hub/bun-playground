<script setup lang="ts">
import { ref } from "vue";
import AppLayout from "../components/layout/AppLayout.vue";
import { useAuth } from "../composables/useAuth";
import { useUiStore } from "../stores/ui.store";

const { user } = useAuth();
const uiStore = useUiStore();

const activeTab = ref<"general" | "security" | "notifications">("general");

const generalForm = ref({
  siteName: "Admin Dashboard",
  siteUrl: "https://admin.example.com",
  supportEmail: "support@example.com",
  defaultLanguage: "en",
  timezone: "UTC",
});

const securityForm = ref({
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  enforcePasswordPolicy: true,
  require2FA: false,
  allowedIPs: "",
});

const notificationForm = ref({
  emailNotifications: true,
  newTenantAlert: true,
  tenantSuspensionAlert: true,
  storageThresholdAlert: true,
  storageThreshold: 80,
  weeklyReport: true,
  securityAlerts: true,
});

const isSaving = ref(false);

const handleSave = async () => {
  isSaving.value = true;
  // Simulate save
  await new Promise((resolve) => setTimeout(resolve, 800));
  isSaving.value = false;
};
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="mt-1 text-sm text-gray-500">Manage your application configuration and preferences.</p>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- Settings Navigation -->
        <nav class="w-full shrink-0 lg:w-56">
          <div class="rounded-xl border border-gray-200 bg-white p-2">
            <button
              v-for="tab in (['general', 'security', 'notifications'] as const)"
              :key="tab"
              :class="[
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
              @click="activeTab = tab"
            >
              <svg v-if="tab === 'general'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-if="tab === 'security'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <svg v-if="tab === 'notifications'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
            </button>
          </div>

          <!-- User Info Card -->
          <div class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {{ user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?' }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
                <p class="text-xs text-gray-500">{{ user?.email }}</p>
              </div>
            </div>
          </div>
        </nav>

        <!-- Settings Content -->
        <div class="flex-1">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="rounded-xl border border-gray-200 bg-white">
            <div class="border-b border-gray-200 px-6 py-4">
              <h2 class="text-base font-semibold text-gray-900">General Settings</h2>
              <p class="mt-1 text-sm text-gray-500">Basic application configuration.</p>
            </div>
            <div class="space-y-5 p-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Site Name</label>
                <input
                  v-model="generalForm.siteName"
                  type="text"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Site URL</label>
                <input
                  v-model="generalForm.siteUrl"
                  type="url"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Support Email</label>
                <input
                  v-model="generalForm.supportEmail"
                  type="email"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    v-model="generalForm.defaultLanguage"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    v-model="generalForm.timezone"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Berlin">Berlin</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p class="text-xs text-gray-500">Toggle dark mode for the interface</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    uiStore.darkMode ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="uiStore.toggleDarkMode()"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      uiStore.darkMode ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>
            </div>
            <div class="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                :disabled="isSaving"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                @click="handleSave"
              >
                {{ isSaving ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="rounded-xl border border-gray-200 bg-white">
            <div class="border-b border-gray-200 px-6 py-4">
              <h2 class="text-base font-semibold text-gray-900">Security Settings</h2>
              <p class="mt-1 text-sm text-gray-500">Configure authentication and access controls.</p>
            </div>
            <div class="space-y-5 p-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                  <input
                    v-model.number="securityForm.sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Max Login Attempts</label>
                  <input
                    v-model.number="securityForm.maxLoginAttempts"
                    type="number"
                    min="1"
                    max="20"
                    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <p class="text-sm font-medium text-gray-900">Enforce Password Policy</p>
                    <p class="text-xs text-gray-500">Require strong passwords with mixed characters</p>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      securityForm.enforcePasswordPolicy ? 'bg-primary-600' : 'bg-gray-300',
                    ]"
                    @click="securityForm.enforcePasswordPolicy = !securityForm.enforcePasswordPolicy"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        securityForm.enforcePasswordPolicy ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    />
                  </button>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <p class="text-sm font-medium text-gray-900">Require Two-Factor Authentication</p>
                    <p class="text-xs text-gray-500">All users must enable 2FA to access the platform</p>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      securityForm.require2FA ? 'bg-primary-600' : 'bg-gray-300',
                    ]"
                    @click="securityForm.require2FA = !securityForm.require2FA"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        securityForm.require2FA ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Allowed IP Addresses</label>
                <p class="text-xs text-gray-500">Comma-separated list of allowed IPs. Leave empty to allow all.</p>
                <textarea
                  v-model="securityForm.allowedIPs"
                  rows="3"
                  placeholder="e.g., 192.168.1.0/24, 10.0.0.1"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <div class="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                :disabled="isSaving"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                @click="handleSave"
              >
                {{ isSaving ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="rounded-xl border border-gray-200 bg-white">
            <div class="border-b border-gray-200 px-6 py-4">
              <h2 class="text-base font-semibold text-gray-900">Notification Settings</h2>
              <p class="mt-1 text-sm text-gray-500">Choose what notifications you receive.</p>
            </div>
            <div class="space-y-1 p-6">
              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p class="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationForm.emailNotifications ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="notificationForm.emailNotifications = !notificationForm.emailNotifications"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationForm.emailNotifications ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">New Tenant Alerts</p>
                  <p class="text-xs text-gray-500">Get notified when a new tenant signs up</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationForm.newTenantAlert ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="notificationForm.newTenantAlert = !notificationForm.newTenantAlert"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationForm.newTenantAlert ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">Tenant Suspension Alerts</p>
                  <p class="text-xs text-gray-500">Get notified when a tenant is suspended</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationForm.tenantSuspensionAlert ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="notificationForm.tenantSuspensionAlert = !notificationForm.tenantSuspensionAlert"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationForm.tenantSuspensionAlert ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">Storage Threshold Alerts</p>
                  <p class="text-xs text-gray-500">
                    Alert when tenant storage exceeds {{ notificationForm.storageThreshold }}%
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="notificationForm.storageThreshold"
                    type="number"
                    min="50"
                    max="99"
                    class="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
                  />
                  <span class="text-sm text-gray-500">%</span>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      notificationForm.storageThresholdAlert ? 'bg-primary-600' : 'bg-gray-300',
                    ]"
                    @click="notificationForm.storageThresholdAlert = !notificationForm.storageThresholdAlert"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        notificationForm.storageThresholdAlert ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    />
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">Weekly Summary Report</p>
                  <p class="text-xs text-gray-500">Receive a weekly digest of platform activity</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationForm.weeklyReport ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="notificationForm.weeklyReport = !notificationForm.weeklyReport"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationForm.weeklyReport ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <div class="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                <div>
                  <p class="text-sm font-medium text-gray-900">Security Alerts</p>
                  <p class="text-xs text-gray-500">Critical security events and login anomalies</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    notificationForm.securityAlerts ? 'bg-primary-600' : 'bg-gray-300',
                  ]"
                  @click="notificationForm.securityAlerts = !notificationForm.securityAlerts"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      notificationForm.securityAlerts ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>
            </div>
            <div class="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                :disabled="isSaving"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                @click="handleSave"
              >
                {{ isSaving ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
