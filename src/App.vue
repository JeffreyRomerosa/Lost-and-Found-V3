<template>

  <div class="min-h-screen flex flex-col bg-white dark:bg-brand-black text-gray-900 dark:text-white transition-colors duration-200">
    <router-view class="flex-1" />
    <Navbar v-if="showNavbar" />
  </div>

  <!-- Floating Theme Toggle -->
  <button
    v-if="route && route.meta && route.meta.showThemeToggle !== false"
    @click="themeStore.toggleTheme"
    class="fixed bottom-4 right-4 p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white shadow-lg"
    aria-label="Toggle theme"
  >
    <span v-if="themeStore.darkMode">☀️</span>
    <span v-else>🌙</span>
  </button>

</template>

<script setup>
 import { themeStore } from '@/stores/theme.js'
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/AppNavbar.vue";

const route = useRoute();
const hiddenNavbarRoutes = ["/admin-login"];

const showNavbar = computed(() => !hiddenNavbarRoutes.includes(route.path));

// Note: theme toggle visibility is read directly from route.meta in the template
</script>