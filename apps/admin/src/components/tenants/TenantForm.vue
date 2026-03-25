<script setup lang="ts">
import { reactive, watch } from "vue";
import type { CreateTenantRequest } from "../../types/tenant.types";
import { slugify } from "../../utils/format";

const props = withDefaults(
  defineProps<{
    open: boolean;
    loading?: boolean;
  }>(),
  { loading: false }
);

const emit = defineEmits<{
  submit: [data: CreateTenantRequest];
  cancel: [];
}>();

const form = reactive<CreateTenantRequest>({
  name: "",
  slug: "",
  plan: "starter",
  metadata: {
    owner: "",
    ownerEmail: "",
    industry: "",
    country: "",
  },
});

const autoSlug = reactive({ enabled: true });

watch(
  () => form.name,
  (name) => {
    if (autoSlug.enabled) {
      form.slug = slugify(name);
    }
  }
);

const handleSubmit = () => {
  if (!form.name || !form.slug) return;
  emit("submit", { ...form });
  resetForm();
};

const handleCancel = () => {
  emit("cancel");
  resetForm();
};

const resetForm = () => {
  form.name = "";
  form.slug = "";
  form.plan = "starter";
  form.metadata = { owner: "", ownerEmail: "", industry: "", country: "" };
  autoSlug.enabled = true;
};

const plans = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "enterprise", label: "Enterprise" },
] as const;
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" @click="handleCancel" />
        <div class="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-gray-900">Create New Tenant</h2>
          <p class="mt-1 text-sm text-gray-500">Fill in the details to create a new tenant.</p>

          <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Acme Corporation"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Slug *</label>
              <input
                v-model="form.slug"
                type="text"
                required
                placeholder="acme-corp"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                @input="autoSlug.enabled = false"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Plan *</label>
              <select
                v-model="form.plan"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option v-for="plan in plans" :key="plan.value" :value="plan.value">
                  {{ plan.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Owner Name</label>
                <input
                  v-model="form.metadata!.owner"
                  type="text"
                  placeholder="John Smith"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Owner Email</label>
                <input
                  v-model="form.metadata!.ownerEmail"
                  type="email"
                  placeholder="john@example.com"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Industry</label>
                <input
                  v-model="form.metadata!.industry"
                  type="text"
                  placeholder="Technology"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Country</label>
                <input
                  v-model="form.metadata!.country"
                  type="text"
                  placeholder="US"
                  class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="props.loading || !form.name || !form.slug"
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ props.loading ? "Creating..." : "Create Tenant" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
