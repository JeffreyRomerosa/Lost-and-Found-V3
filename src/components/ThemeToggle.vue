<template>
  <button
    @click="themeStore.toggleTheme"
    class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    :title="themeStore.darkMode ? 'Switch to Light' : 'Switch to Dark'"
    aria-label="Toggle color theme"
  >
    <span v-if="themeStore.darkMode" class="text-black dark:text-white">☀️</span>
    <span v-else class="text-black dark:text-white">🌙</span>
  </button>
</template>

<script setup>
import { themeStore } from '@/stores/theme.js'
</script>
