<template>
  <aside class="w-64 bg-background dark:bg-slate-950 border-r border-border dark:border-slate-800 flex flex-col h-screen transition-colors duration-200 sticky top-0">
    <!-- Header Section -->
    <div class="p-6 border-b border-border dark:border-slate-800">
      <div class="flex items-center gap-3 group cursor-pointer">
        <!-- Logo Badge -->
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
          <span class="text-white text-lg">🔍</span>
        </div>
        <!-- Brand Text -->
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-bold text-foreground truncate">CSU Lost & Found</h1>
          <p class="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>
    </div>

    <!-- Navigation Section -->
    <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      <!-- Dashboard -->
      <button
        @click="selectPage('dashboard')"
        :class="getNavButtonClass('dashboard')"
      >
        <span class="text-lg">📊</span>
        <span class="font-medium">Dashboard</span>
        <span v-if="activePage === 'dashboard'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
      </button>

      <!-- Reported Items -->
      <button
        @click="selectPage('reported-items')"
        :class="getNavButtonClass('reported-items')"
      >
        <span class="text-lg">📋</span>
        <span class="font-medium">Reported Items</span>
        <span v-if="activePage === 'reported-items'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
      </button>

      <!-- Users -->
      <button
        @click="selectPage('users')"
        :class="getNavButtonClass('users')"
      >
        <span class="text-lg">👥</span>
        <span class="font-medium">Users</span>
        <span v-if="activePage === 'users'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
      </button>

      <!-- Profile -->
      <button
        @click="() => emit('select-page', 'profile')"
        :class="[getNavButtonClass('profile'), isProfileIncomplete ? 'ring-1 ring-amber-500/50' : '']"
      >
        <span class="text-lg">👤</span>
        <span class="font-medium">My Profile</span>
        <span v-if="activePage === 'profile'" class="ml-auto w-1 h-6 bg-emerald-600 rounded-r"></span>
      </button>
    </nav>

    <!-- Profile Alert Section -->
    <div v-if="isProfileIncomplete" class="px-4 py-4 border-t border-border dark:border-slate-800">
      <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div class="flex gap-2">
          <span class="text-amber-600 dark:text-amber-500 text-lg flex-shrink-0">⚠️</span>
          <div>
            <p class="text-xs font-semibold text-amber-900 dark:text-amber-100">Complete Your Profile</p>
            <p class="text-xs text-amber-800 dark:text-amber-200 mt-0.5">Update your details for a better experience.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-border dark:border-slate-800 text-xs text-muted-foreground text-center">
      <p>Admin Dashboard v1.0</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Track active page
const activePage = ref("dashboard");
const adminUser = ref(null);

// Load admin user from localStorage
onMounted(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.role === "admin") {
      adminUser.value = storedUser;
    }
  } catch (err) {
    console.error("Failed to parse admin user from storage:", err);
    adminUser.value = null;
  }
});

// Check if profile is incomplete
const isProfileIncomplete = computed(() => {
  if (!adminUser.value) return true;
  return !adminUser.value.full_name || !adminUser.value.department || !adminUser.value.contact_number || !adminUser.value.birthday;
});

// Emit event to parent when page is selected
const emit = defineEmits(["select-page"]);

const selectPage = (page) => {
  activePage.value = page;
  emit("select-page", page);
};

// Dynamic button styling
const getNavButtonClass = (page) => {
  const isActive = activePage.value === page;
  return [
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm relative group",
    isActive
      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
      : "text-foreground hover:bg-muted dark:hover:bg-slate-800"
  ];
};
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}

button:hover {
  text-decoration: none;
}
</style>