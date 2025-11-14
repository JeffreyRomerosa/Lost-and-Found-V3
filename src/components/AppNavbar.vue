<template>
  <!-- Navbar will NOT show on login or register pages -->
  <nav v-if="showNavbar"
       class="fixed bottom-4 left-1/2 -translate-x-1/2 
         bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
         flex justify-around w-[90%] max-w-md 
         rounded-2xl py-3 shadow-lg z-50 transition-colors duration-200 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
    <RouterLink v-for="item in nav" :key="item.to" 
      :to="item.to"
      class="flex flex-col items-center text-sm transition-all text-gray-700 dark:text-gray-400
             hover:text-yellow-600 dark:hover:text-yellow-400"
      :class="{ 'text-yellow-600 dark:text-yellow-400': $route.path === item.to }">
      <component :is="item.icon" class="w-6 h-6 mb-1" />
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Home, Search, Bell, User, PlusSquare } from "lucide-vue-next";

const route = useRoute();
const userRole = ref('');

onMounted(() => {
  // Get user role from localStorage on component mount
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole.value = user?.role || '';
  } catch (err) {
    console.error('Error getting user role:', err);
  }
});

const nav = [
  { to: "/userdashboard", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/report", label: "Report", icon: PlusSquare },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

// Hide navbar on login & register pages and hide on profile for admin/security
const showNavbar = computed(() => {
  // Check if current route is profile and user is admin/security
  if (route.path.startsWith('/profile') && (userRole.value === 'admin' || userRole.value === 'security')) {
    return false;
  }
  
  // Check if the current route is neither login nor register
  return route.path !== "/login" && 
         route.path !== "/register" && 
         route.path !== "/" && 
         route.path !== "/admin-dashboard" && 
         route.path !== "/security-dashboard";
});
</script>
