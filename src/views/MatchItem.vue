<template>
  <div class="p-6 animate-fade-in">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Possible Match Item</h2>
    <p class="text-gray-800 dark:text-gray-200">We found a possible match for your lost item: <b>Black Wallet</b></p>
    <div class="bg-white dark:bg-gray-900 rounded-xl p-4 mt-4 border border-gray-200 dark:border-gray-800 shadow-lg">
      <div class="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Reported by: Jeffrey Romerosa</p>
    </div>
    <div class="mt-6 flex gap-4">
      <button class="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black transition duration-300">Yes</button>
      <button class="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300">No</button>
    </div>
  </div>
</template>