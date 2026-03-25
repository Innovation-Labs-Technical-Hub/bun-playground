<script setup lang="ts">
import { useUiStore } from "../../stores/ui.store";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";

const uiStore = useUiStore();
</script>

<template>
  <div class="flex h-full">
    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <AppSidebar />
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition name="fade">
      <div
        v-if="uiStore.isMobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        @click="uiStore.closeMobileMenu()"
      />
    </Transition>

    <!-- Mobile Sidebar -->
    <Transition name="slide">
      <div v-if="uiStore.isMobileMenuOpen" class="fixed inset-y-0 left-0 z-50 lg:hidden">
        <AppSidebar />
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
