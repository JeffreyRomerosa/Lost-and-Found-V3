<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-gradient-to-b from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden"
  >
<!-- relative flex justify-between items-center p-4 sm:p-6 sticky top-0 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-emerald-200 dark:border-emerald-900 z-50 animate-slide-down -->
 <nav class="bg-white dark:bg-gray-900 border-b p-3  backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-emerald-200 dark:border-emerald-900 z-50 animate-slide-down shadow-sm ">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
        <div
          class="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0"
        >
          <span class="text-emerald-900 text-lg sm:text-2xl">🔍</span>
        </div>
        <h1 class="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-yellow-400 transition-colors">CSU Lost & Found</h1>
      </div>

<!-- Desktop Navigation -->
<div class="hidden md:flex items-center space-x-1">
  <router-link
    to="/login"
    class="relative px-4 py-2 font-medium text-gray-700 dark:text-gray-300
           transition-all duration-300 rounded-full overflow-hidden group"
  >
    <span class="relative z-10 group-hover:text-white transition duration-300">Login</span>
    <span
      class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600
             opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
    ></span>
  </router-link>

  <router-link
    to="/register"
    class="relative px-4 py-2 font-medium text-gray-700 dark:text-gray-300
           transition-all duration-300 rounded-full overflow-hidden group"
  >
    <span class="relative z-10 group-hover:text-white transition duration-300">Register</span>
    <span
      class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600
             opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
    ></span>
  </router-link>

  <router-link
    to="/how-it-works"
    class="relative px-4 py-2 font-medium text-gray-700 dark:text-gray-300
           transition-all duration-300 rounded-full overflow-hidden group"
  >
    <span class="relative z-10 group-hover:text-white transition duration-300">How It Works</span>
    <span
      class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600
             opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
    ></span>
  </router-link>

  <router-link
    to="/AboutUs"
    class="relative px-4 py-2 font-medium text-gray-700 dark:text-gray-300
           transition-all duration-300 rounded-full overflow-hidden group"
  >
    <span class="relative z-10 group-hover:text-white transition duration-300">About Us</span>
    <span
      class="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600
             opacity-0 group-hover:opacity-100 group-hover:animate-emerald-slide transition-all duration-500"
    ></span>
  </router-link>
</div>


        <!-- Mobile Hamburger Menu Button -->
        <div class="md:hidden">
          <button
            @click="isOpen = !isOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition duration-200"
          >
            <svg
              v-if="!isOpen"
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div
        v-show="isOpen"
        class="md:hidden bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 py-2 space-y-1"
      >
        <router-link
          to="/login"
          class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
          @click="isOpen = false"
        >
          Login
        </router-link>
        <router-link
          to="/register"
          class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
          @click="isOpen = false"
        >
          Register
        </router-link>
        <router-link
          to="/how-it-works"
          class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
          @click="isOpen = false"
        >
          How It Works
        </router-link>
        <router-link
          to="/aboutus"
          class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200 font-medium"
          @click="isOpen = false"
        >
          About Us
        </router-link>
      </div>
    </div>
  </nav>

  

    <!-- Hero Section -->
    <main class="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-16 lg:py-20">
      <!-- Icon with Animation -->
      <div
        class="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6 shadow-lg animate-bounce-slow flex-shrink-0"
      >
        <span class="text-2xl sm:text-3xl lg:text-6xl">🔍</span>
      </div>

      <!-- Animated Headline -->
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-3 lg:mb-4 animate-slide-up leading-tight">
        <span class="bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-yellow-400 bg-clip-text text-transparent">
          Find Your Lost Items
        </span>
      </h2>

      <!-- Subtitle -->
      <p
        class="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed mb-6 sm:mb-8 animate-slide-up animation-delay-1"
      >
        AI-powered search helps reunite CSU students with their belongings—fast, secure, and easy.
      </p>

      <!-- CTA Button with Hover Animation -->
      <router-link
        to="/login"
        class="inline-block px-6 sm:px-8 py-2.5 sm:py-3 lg:py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg animate-slide-up animation-delay-2 active:scale-95 text-sm sm:text-base whitespace-nowrap"
      >
        🚀 Get Started
      </router-link>
    </main>

    <!-- Features Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900/50 dark:to-slate-900/20">
      <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-emerald-900 dark:text-emerald-300 animate-slide-up">How It Works</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
        <!-- Card 1 -->
        <div class="text-center p-3 sm:p-5 lg:p-6 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors animate-slide-up animation-delay-1 group border border-emerald-200 dark:border-emerald-900">
          <div class="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">📸</div>
          <h4 class="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm lg:text-base text-emerald-900 dark:text-emerald-300">Report</h4>
          <p class="text-xs sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400">Upload photos of your lost item</p>
        </div>

        <!-- Card 2 -->
        <div class="text-center p-3 sm:p-5 lg:p-6 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors animate-slide-up animation-delay-2 group border border-emerald-200 dark:border-emerald-900">
          <div class="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">🤖</div>
          <h4 class="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm lg:text-base text-emerald-900 dark:text-emerald-300">Match</h4>
          <p class="text-xs sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400">AI finds matching items in database</p>
        </div>

        <!-- Card 3 -->
        <div class="text-center p-3 sm:p-5 lg:p-6 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors animate-slide-up animation-delay-3 group border border-emerald-200 dark:border-emerald-900">
          <div class="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">✅</div>
          <h4 class="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm lg:text-base text-emerald-900 dark:text-emerald-300">Claim</h4>
          <p class="text-xs sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400">Verify and reclaim your belongings</p>
        </div>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="relative px-4 sm:px-6 py-10 sm:py-14 lg:py-16 bg-white dark:bg-slate-900 border-t border-emerald-200 dark:border-emerald-900">
      <div class="max-w-3xl mx-auto">
        <h3 class="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-5 sm:mb-6 lg:mb-8 text-emerald-900 dark:text-emerald-300 animate-slide-up">About Us</h3>
        
        <div class="space-y-3 sm:space-y-4 lg:space-y-6">
          <p class="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed animate-slide-up animation-delay-1">
            The CSU Lost & Found System was developed by a dedicated team of Caraga State University students 
            to enhance campus safety and accountability. We understand the frustration of losing important belongings— 
            that's why our goal is to provide a digital platform that connects finders and owners seamlessly.
          </p>

          <p class="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed animate-slide-up animation-delay-2">
            Our system integrates modern technologies like AI-driven image recognition and intelligent data matching 
            to ensure accurate and fair identification of lost items. By digitizing the lost-and-found process, 
            CSU students and staff can report, verify, and claim items with ease — fostering a more organized and 
            trustworthy campus environment.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative text-center py-3 sm:py-4 lg:py-6 text-gray-500 dark:text-gray-400 text-xs sm:text-xs lg:text-sm border-t border-emerald-200 dark:border-emerald-900 animate-fade-in z-10">
      © {{ currentYear }} Caraga State University • Lost & Found System
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const currentYear = new Date().getFullYear()
</script>

<style scoped>
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-slide-down {
  animation: slide-down 0.6s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animation-delay-1 { animation-delay: 0.15s; }
.animation-delay-2 { animation-delay: 0.3s; }
.animation-delay-3 { animation-delay: 0.45s; }
.animation-delay-4 { animation-delay: 0.6s; }
.animation-delay-5 { animation-delay: 0.75s; }
</style>
