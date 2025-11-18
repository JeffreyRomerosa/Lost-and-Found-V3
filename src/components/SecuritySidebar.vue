<template>
  <aside class="w-64 bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 flex flex-col space-y-6 text-gray-900 dark:text-white h-screen overflow-y-auto fixed left-0 top-16 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
    <!-- Security Officer Info -->
    <div class="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div v-if="avatarUrl" class="w-12 h-12">
        <img
          :src="avatarUrl"
          alt="Security Avatar"
          class="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 dark:border-yellow-400"
        />
      </div>
      <div
        v-else
        class="w-12 h-12 rounded-full bg-emerald-500 dark:bg-yellow-500 text-white dark:text-gray-900 flex items-center justify-center text-xl font-bold border-2 border-emerald-500 dark:border-yellow-400"
      >
        {{ avatarInitial }}
      </div>
      <div>
        <p class="font-semibold text-gray-900 dark:text-white">{{ displayName }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Security</p>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <nav class="flex flex-col space-y-3">
      <button
        @click="selectPage('dashboard')"
        :class="navButtonClass('dashboard')"
        class="px-4 py-2 rounded-lg transition-colors text-left font-medium"
      >
        Dashboard
      </button>

      <div class="pt-2">
        <h3 class="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 px-2 mb-2">Items Management</h3>
        <button
          @click="selectPage('lost-reports')"
          :class="navButtonClass('lost-reports')"
          class="w-full px-4 py-2 rounded-lg transition-colors text-left"
        >
          Lost Reports
          <span v-if="unreadLost > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{{ unreadLost }}</span>
        </button>
        <button
          @click="selectPage('found-reports')"
          :class="navButtonClass('found-reports')"
          class="w-full px-4 py-2 rounded-lg transition-colors text-left"
        >
          Found Reports
          <span v-if="unreadFound > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{{ unreadFound }}</span>
        </button>
        <button
          @click="selectPage('returned-history')"
          :class="navButtonClass('returned-history')"
          class="w-full px-4 py-2 rounded-lg transition-colors text-left"
        >
          Returned History
          <span v-if="unreadReturned > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2">{{ unreadReturned }}</span>
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <h3 class="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 px-2 mb-2">Claim Management</h3>
        <button
          @click="selectPage('claim-requests')"
          :class="navButtonClass('claim-requests')"
          class="w-full px-4 py-2 rounded-lg transition-colors text-left font-medium"
        >
          Claim Requests
          <span v-if="pendingClaims > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">{{ pendingClaims }}</span>
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <h3 class="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 px-2 mb-2">Office Management</h3>
        <button
          @click="selectPage('office-hours')"
          :class="navButtonClass('office-hours')"
          class="w-full px-4 py-2 rounded-lg transition-colors text-left"
        >
          Office Hours
        </button>
      </div>

      <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="goToProfile"
          class="w-full px-4 py-2 text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
        >
          My Profile
        </button>
      </div>
    </nav>
  </aside>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const API_BASE_URL = "http://localhost:5000";
const router = useRouter();

// Props to receive unread counts from parent
defineProps({
  unreadLost: {
    type: Number,
    default: 0
  },
  unreadFound: {
    type: Number,
    default: 0
  },
  unreadReturned: {
    type: Number,
    default: 0
  },
  pendingClaims: {
    type: Number,
    default: 0
  }
});

// Track active page - load from localStorage to persist across page refreshes
const activePage = ref(localStorage.getItem('security-current-page') || 'dashboard');
const securityUser = ref(null);

onMounted(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.role === "security") {
      securityUser.value = storedUser;
    }
  } catch (err) {
    console.error("Failed to parse security user from storage:", err);
    securityUser.value = null;
  }
  
  // Sync with localStorage when component mounts
  const savedPage = localStorage.getItem('security-current-page');
  if (savedPage) {
    activePage.value = savedPage;
  }
});

const displayName = computed(() => {
  if (!securityUser.value) return "Security Officer";
  return (
    securityUser.value.full_name ||
    securityUser.value.email?.split("@")[0] ||
    "Security Officer"
  );
});

const avatarUrl = computed(() => {
  const path = securityUser.value?.profile_picture;
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
});

const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase());

// Emit event to parent when page is selected
const emit = defineEmits(["select-page"]);

const selectPage = (page) => {
  activePage.value = page;
  localStorage.setItem('security-current-page', page);
  emit("select-page", page);
};

// Watch for changes to activePage and save to localStorage
watch(activePage, (newPage) => {
  localStorage.setItem('security-current-page', newPage);
});

// Dynamic button styling
const navButtonClass = (page) => {
  return [
    activePage.value === page
      ? "bg-yellow-500 text-black font-semibold"
      : "text-gray-700 dark:text-white hover:text-yellow-400 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800"
  ];
};

// Logout removed from sidebar; other components/pages still provide logout if needed.

const goToProfile = () => {
  router.push("/profile");
};
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}

aside {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}
</style>
