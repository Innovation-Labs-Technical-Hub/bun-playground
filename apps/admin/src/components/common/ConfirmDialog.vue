<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
  }>(),
  {
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
  }
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const variantStyles = {
  danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  info: "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
};

const iconStyles = {
  danger: "text-red-600 bg-red-100",
  warning: "text-amber-600 bg-amber-100",
  info: "text-primary-600 bg-primary-100",
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" @click="emit('cancel')" />
        <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div class="flex items-start gap-4">
            <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconStyles[props.variant]]">
              <svg v-if="props.variant === 'danger'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ props.title }}</h3>
              <p class="mt-1 text-sm text-gray-600">{{ props.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              @click="emit('cancel')"
            >
              {{ props.cancelLabel }}
            </button>
            <button
              type="button"
              :class="['rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2', variantStyles[props.variant]]"
              @click="emit('confirm')"
            >
              {{ props.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
