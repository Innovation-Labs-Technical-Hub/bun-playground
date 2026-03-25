<script setup lang="ts">
import { onMounted } from "vue";
import { useUiStore } from "./stores/ui.store";

const uiStore = useUiStore();

onMounted(() => {
  uiStore.initializeFromStorage();
});
</script>

<template>
  <router-view />
</template>
