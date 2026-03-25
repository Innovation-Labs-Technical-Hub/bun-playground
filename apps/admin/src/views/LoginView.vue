<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();
const { login, isLoading } = useAuth();

const email = ref("admin@example.com");
const password = ref("password");
const error = ref("");

const handleLogin = async () => {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Please enter both email and password.";
    return;
  }

  const success = await login({ email: email.value, password: password.value });

  if (success) {
    const redirect = (route.query.redirect as string) || "/dashboard";
    router.push(redirect);
  } else {
    error.value = "Invalid email or password. Please try again.";
  }
};
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="mb-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white">
          A
        </div>
        <h1 class="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p class="mt-1 text-sm text-gray-500">Sign in to your admin account</p>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleLogin">
        <div v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {{ error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <a href="#" class="text-xs font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Enter your password"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label for="remember" class="text-sm text-gray-600">Remember me</label>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-gray-400">
        Demo credentials are pre-filled. Click Sign in to continue.
      </p>
    </div>
  </div>
</template>
