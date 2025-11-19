<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 pb-32">
    <!-- Item Received Modal -->
    <ItemReceivedModal
      :isOpen="showItemReceivedModal"
      :itemName="itemReceivedModalData.itemName"
      :itemId="itemReceivedModalData.itemId"
      @close="closeItemReceivedModal"
    />

    <!-- Claim Status Notifications -->
    <div class="max-w-6xl mx-auto">
      <ClaimStatusNotification
        :notifications="notifications"
        @dismiss="dismissClaimNotification"
        @view-item="viewClaimItemDetails"
        @resubmit-claim="resubmitClaimForItem"
      />
    </div>

    <!-- Top-Right Profile & Notification -->
    <div class="absolute top-6 right-6 flex items-center gap-4">
      <!-- Notification Icon -->
      <div class="relative">
        <button
          @click="toggleNotifications"
          class="relative w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg transition-all duration-200 text-white"
          title="Notifications"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span
            v-if="unreadNotificationCount > 0"
            class="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md"
          >
            {{ unreadNotificationCount }}
          </span>
        </button>

        <!-- Notifications Dropdown -->
        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>

          <ul v-if="notifications.length > 0" class="max-h-96 overflow-y-auto">
            <li
              v-for="notif in notifications"
              :key="notif.id"
              :class="[
                'text-gray-900 dark:text-white py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition',
                notif.type === 'item_received' ? 'bg-green-50 dark:bg-green-900/20' : '',
                notif.type === 'claim_approved' ? 'bg-blue-50 dark:bg-blue-900/20' : '',
                notif.type === 'claim_rejected' ? 'bg-red-50 dark:bg-red-900/20' : '',
                notif.type === 'item_claimed' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
              ]"
            >
              <!-- Item Received Notification (Special Style) -->
              <div v-if="notif.type === 'item_received'" class="flex items-start gap-3">
                <div class="text-2xl">📦</div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-green-700 dark:text-green-300">Item Received!</p>
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Item:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.display_student_id" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>ID:</strong> {{ notif.display_student_id }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2">
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-3 py-1 text-xs rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>

              <!-- Claim Approved Notification -->
              <div v-else-if="notif.type === 'claim_approved'" class="flex items-start gap-3">
                <div class="text-2xl">✅</div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-blue-700 dark:text-blue-300">Claim Approved!</p>
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Item:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2">
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <!-- Claim Rejected Notification -->
              <div v-else-if="notif.type === 'claim_rejected'" class="flex items-start gap-3">
                <div class="text-2xl">❌</div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-red-700 dark:text-red-300">Claim Rejected</p>
                  <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                  <p v-if="notif.display_name" class="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Item:</strong> {{ notif.display_name }}
                  </p>
                  <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-2">
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-3 py-1 text-xs rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <!-- Item Claimed Notification -->
              <div v-else-if="notif.type === 'item_claimed'" class="flex items-start gap-3">
                <div class="text-2xl">🎉</div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-emerald-700 dark:text-emerald-300">Item Claimed!</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300">{{ notif.message }}</p>
                  <p v-if="notif.created_at" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {{ notif.created_at }}
                  </p>
                  <div class="mt-3">
                    <button
                      @click.stop="clearNotification(notif)"
                      class="px-3 py-1 text-xs rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>

              <!-- Match Notifications (Original Style) -->
              <div v-else>
                <p class="font-medium mb-1 text-sm">{{ notif.message }}</p>
                <p
                  v-if="notif.display_description"
                  class="text-xs text-gray-600 dark:text-gray-400"
                >
                  {{ notif.display_description }}
                </p>
                <p v-if="notif.created_at" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ notif.created_at }}
                </p>
                <div class="flex items-start gap-2 mt-2">
                  <img
                    v-if="notif.display_image"
                    :src="notif.display_image"
                    alt="Matched item"
                    class="w-10 h-10 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                  <div class="text-xs">
                    <p class="font-semibold text-gray-900 dark:text-white">{{ notif.display_name }}</p>
                    <p v-if="notif.display_student_id" class="text-gray-600 dark:text-gray-400">
                      ID: {{ notif.display_student_id }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-400">Location: {{ notif.matched_location || "N/A" }}</p>
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2">
                  <button
                    @click="goToNotificationForMatch(notif)"
                    class="px-3 py-1 text-xs rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                  >
                    View Found Item
                  </button>
                  <button
                    @click.stop="clearNotification(notif)"
                    class="px-2 py-1 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Remove notification"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <div v-else class="p-4 text-gray-600 dark:text-gray-400 text-center text-sm">
            No new notifications.
          </div>
        </div>
      </div>

      <!-- Profile Button -->
      <div class="relative">
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-600 transition overflow-hidden border-2 border-emerald-400"
          title="Profile"
        >
          <template v-if="user && user.profile_picture">
            <img
              :src="user.profile_picture"
              alt="Profile"
              class="w-full h-full object-cover rounded-full"
            />
          </template>
          <template v-else>
            <span class="text-white text-xl font-bold">
              {{ profileInitial }}
            </span>
          </template>
        </button>

        <div
          v-if="showProfileMenu"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <ul>
            <li>
              <button
                @click="goToProfile"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 transition text-gray-900 dark:text-white"
              >
                <svg
                  class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>My Profile</span>
              </button>
            </li>

<li>
     <!-- Theme toggle -->

<div class="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center justify-between transition text-gray-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Theme</span>
                </div>

                <div>
                  <ThemeToggle @change="showProfileMenu = false" />
                </div>
              </div>

              <!-- End of Theme toggle -->
</li>


            <li>
              <button
                @click="logout"
                class="w-full px-4 py-3 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Dashboard Header -->
    <div class="max-w-6xl mx-auto mb-12 mt-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">User Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your lost and found items</p>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="claimResultMessage"
      class="mb-6 max-w-6xl mx-auto px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm"
    >
      {{ claimResultMessage }}
    </div>

    <!-- Item Received Message -->
    <div
      v-if="itemReceivedMessage"
      class="mb-6 max-w-6xl mx-auto px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3"
    >
      <span class="text-xl">📦</span>
      <span>{{ itemReceivedMessage }}</span>
    </div>

    <!-- Dashboard Sections -->
    <div class="w-full max-w-6xl mx-auto mb-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Pending Reports Card -->
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-800">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pending Reports</h2>
            <div class="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <ul class="space-y-4">
            <li
              v-for="(report, index) in reports"
              :key="report.id || index"
              class="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  <img
                    v-if="report.image_url"
                    :src="report.image_url"
                    alt="report image"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium">No image</div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <p class="font-semibold text-gray-900 dark:text-white truncate">{{ report.name || 'Unnamed item' }}</p>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">{{ report.status || 'pending' }}</span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{{ report.type || report.item_type || 'N/A' }}</p>

                  <p v-if="report.description" class="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{{ report.description }}</p>
                  <p v-if="report.student_id" class="text-xs text-gray-600 dark:text-gray-400">Student ID: {{ report.student_id }}</p>
                  <p v-if="report.location" class="text-xs text-gray-600 dark:text-gray-400">Location: {{ report.location }}</p>

                  <div class="mt-3 flex items-center gap-2">
                    <button @click="viewReport(report)" class="px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition">View</button>
                    <button @click="editReport(report)" class="px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">Edit</button>
                  </div>
                </div>
              </div>
            </li>
            <li v-if="reports.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 opacity-30 mb-2 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="font-medium">You have no pending reports yet.</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Claimed Items Card -->
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-800">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Claimed Items</h2>
            <div class="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(item, index) in claimedItems"
              :key="index"
              class="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition border border-gray-200 dark:border-gray-700 flex items-center justify-between"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.type }}: {{ item.name }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ item.user_claim_status }}</p>
              </div>
              <div class="px-3 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold whitespace-nowrap">Claimed</div>
            </li>
            <li v-if="claimedItems.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 opacity-30 mb-2 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p class="font-medium">No claimed items yet.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto mb-10 px-6">
      <button
        @click="$router.push('/report')"
        class="w-full py-3 px-6 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        File a Report
      </button>

      <button
        @click="$router.push('/search')"  
        class="w-full py-3 px-6 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Search by Image
      </button>
    </div>

    <!-- Match Details Modal -->
    <div
      v-if="selectedMatch"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <!-- Close button -->
        <button
          @click="clearAndCloseSelectedMatch"
          aria-label="Clear notification"
          class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-white dark:border-gray-800 z-50 transition"
          title="Clear notification"
        >
          ×
        </button>
        <div class="p-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">✨ Match Found!</h3>
          <p class="text-gray-900 dark:text-white mb-2">{{ selectedMatch.message }}</p>
          <p
            v-if="selectedMatch.display_description"
            class="text-sm text-gray-600 dark:text-gray-400 mb-4"
          >
            {{ selectedMatch.display_description }}
          </p>

          <div class="flex flex-col items-center mb-6">
            <img
              v-if="selectedMatch.display_image"
              :src="selectedMatch.display_image"
              alt="Matched item"
              class="w-40 h-40 object-cover rounded-xl border-4 border-emerald-100 dark:border-emerald-900/30 mb-4 shadow-md"
            />
            <p class="font-semibold text-gray-900 dark:text-white text-lg text-center">
              {{ selectedMatch.display_name }}
            </p>
            <p
              v-if="selectedMatch.display_student_id"
              class="text-gray-600 dark:text-gray-400 text-sm"
            >
              Student ID: {{ selectedMatch.display_student_id }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Location: {{ selectedMatch.matched_location || "N/A" }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Status: {{ selectedMatchStatusLabel }}
            </p>
            <p
              v-if="claimStatusNotice"
              class="mt-2 text-sm text-red-600 dark:text-red-400 font-medium"
            >
              {{ claimStatusNotice }}
            </p>
          </div>

          <div class="flex justify-center mb-4">
            <button
              @click="goToNotificationForMatch(selectedMatch)"
              class="px-6 py-2 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md"
            >
              View Found Item
            </button>
          </div>

          <p class="text-center text-xs text-gray-600 dark:text-gray-400 mb-1">
            Ready to submit a claim request to the security office?
          </p>

          <p class="text-xs text-gray-600 dark:text-gray-400 text-center">
            This item is currently in the Security Office.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 text-right border-t border-gray-200 dark:border-gray-700">
          <button
            @click="closeMatchModal"
            class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Claim Submission Modal -->
    <div
      v-if="showClaimModal"
      class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Submit Claim Request</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            You are about to submit a claim for <strong>{{ selectedMatch.display_name }}</strong>.
            Share a quick note below so security can verify your request, then confirm to send the claim to the Security Office.
          </p>

          <textarea
            v-model="claimMessage"
            rows="3"
            placeholder="Optional: e.g., 'I can describe the unique scratch on the back.'"
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>

          <div class="flex justify-end gap-3">
            <button
              @click="closeClaimModal"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
            >
              Cancel
            </button>
            <button
              @click="submitClaim"
              :disabled="claimSubmitDisabled"
              class="px-5 py-2 rounded-lg font-semibold transition"
              :class="
                claimSubmitDisabled
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              "
            >
              {{ claimSubmitLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import initSocket, { disconnectSocket } from "../socket";
import ClaimStatusNotification from '../components/ClaimStatusNotification.vue';
import ItemReceivedModal from '../components/ItemReceivedModal.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
export default {
  name: "UserDashboard",
  components: {
    ClaimStatusNotification,
    ItemReceivedModal,
    ThemeToggle
  },
  data() {
    return {
      showNotifications: false,
      showProfileMenu: false,
      notifications: [],
      user: null,
      reports: [],
      claimedItems: [],
      showImageSearch: false,
      selectedMatch: null,
      claiming: false,
      showClaimModal: false,
      claimMessage: "",
      claimResultMessage: "",
      itemReceivedMessage: "",
      showItemReceivedModal: false,
      itemReceivedModalData: {
        itemName: null,
        itemId: null
      },
      socket: null,
      apiBaseUrl: "http://localhost:5000",
      notificationPollTimer: null,
      notificationsInitialized: false,
      latestNotificationSignature: null,
      // Keep short-lived keys for notifications the user just cleared so auto-preview
      // and realtime handlers won't immediately re-open them.
      recentlyClearedNotificationKeys: [],
    };
  },
  computed: {
    unreadNotificationCount() {
      return this.notifications.filter((n) => !n.is_read).length;
    },
    profileInitial() {
      if (this.user && this.user.full_name)
        return this.user.full_name[0].toUpperCase();
      return "U";
    },
    claimButtonDisabled() {
      return this.isClaimDisabled(this.selectedMatch);
    },
    claimButtonCta() {
      if (!this.selectedMatch || !this.claimButtonDisabled)
        return "I want to claim this item";

      const status = this.normalizeClaimStatus(
        this.selectedMatch.claim_status || this.selectedMatch.matched_status
      );

      switch (status) {
        case "pending_claim":
          return "Claim already submitted";
        case "confirmed_claim":
          return "Claim already approved";
        case "returned":
        case "returned_to_owner":
          return "Item already returned";
        case "rejected_claim":
          return "Claim already reviewed";
        default:
          return "Claim unavailable";
      }
    },
    selectedMatchStatusLabel() {
      if (!this.selectedMatch)
        return "In Security Custody";

      const candidates = [
        this.normalizeClaimStatus(this.selectedMatch.claim_status),
        this.normalizeClaimStatus(this.selectedMatch.matched_status),
      ];

      const prioritized = candidates.find((status) =>
        [
          "pending_claim",
          "confirmed_claim",
          "rejected_claim",
          "returned",
          "returned_to_owner",
        ].includes(status)
      );

      const fallback = candidates.find(Boolean) || "in_security_custody";

      return (prioritized || fallback)
        .split("_")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
        .join(" ");
    },
    claimStatusNotice() {
      if (!this.claimButtonDisabled) return "";

      const status = this.normalizeClaimStatus(
        this.selectedMatch?.claim_status || this.selectedMatch?.matched_status
      );

      switch (status) {
        case "pending_claim":
          return "A claim is already in review for this item.";
        case "confirmed_claim":
          return "This item already has an approved claim.";
        case "returned":
        case "returned_to_owner":
          return "This item has already been returned to its owner.";
        default:
          return "";
      }
    },
    claimSubmitDisabled() {
      return this.claiming || this.claimButtonDisabled;
    },
    claimSubmitLabel() {
      if (this.claimButtonDisabled) return "Claim unavailable";
      return this.claiming ? "Submitting..." : "Submit Claim";
    },
  },
  methods: {
    normalizeClaimStatus(value) {
      if (value === undefined || value === null) return null;
      if (typeof value === "string") return value.trim().toLowerCase();
      try {
        return String(value).trim().toLowerCase();
      } catch (err) {
        return null;
      }
    },

    isClaimDisabled(match) {
      if (!match) return false;

      const statuses = [
        this.normalizeClaimStatus(match.claim_status),
        this.normalizeClaimStatus(match.matched_status),
      ].filter(Boolean);

      const blocking = [
        "pending_claim",
        "confirmed_claim",
        "returned",
        "returned_to_owner",
      ];

      return statuses.some((status) => blocking.includes(status));
    },

    applyClaimState(match, status) {
      if (!match) return;

      const normalized = this.normalizeClaimStatus(status) || "pending_claim";
      const key =
        match.match_id ||
        match.notification_id ||
        match.id ||
        match.item_id ||
        null;

      const clonedMatch = { ...match, claim_status: normalized };
      this.selectedMatch = { ...clonedMatch };

      if (key) {
        const idx = this.notifications.findIndex((n) => {
          const candidate =
            n.match_id || n.notification_id || n.id || n.item_id || null;
          return candidate && String(candidate) === String(key);
        });

        if (idx !== -1) {
          this.notifications.splice(idx, 1, {
            ...this.notifications[idx],
            claim_status: normalized,
          });
        }
      }
    },

    async toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        // Load latest notifications first (populate list from server)
        await this.loadNotifications();

        // Immediately mark notifications as read locally so the badge/indicator clears
        try {
          this.notifications = this.notifications.map((n) => ({ ...n, is_read: true }));
        } catch (e) {
          console.warn("Failed to mark notifications read locally:", e);
        }
      }
    },

    async loadNotifications(options = {}) {
      const { autoPreview = false, markInitial = false } = options;
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return console.warn("⚠️ No logged-in user found.");

        const res = await fetch(
          `http://localhost:5000/api/notifications/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();

        // ✅ Make sure to include the correct item_id from backend
        const mapped = data.map((n) => {
          // ✅ Special handling for item_received notifications
          if (n.type === 'item_received') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'item_received',
              category: 'delivery',
              message: "The item you delivered or turned over to the security office has been received successfully. Thank you for your cooperation.",
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "in_security_custody",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: null,
            };
          }

          // ✅ Special handling for claim approved notifications
          if (n.type === 'claim_approved') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'claim_approved',
              category: n.category || 'general',
              message: `Your claim request for "${n.item_name || 'this item'}" has been approved! Please visit the Security Office with your student ID to complete the item handover.`,
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "approved",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "approved",
            };
          }

          // ✅ Special handling for claim rejected notifications
          if (n.type === 'claim_rejected') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            const detailSegments = [];
            if (n.color) detailSegments.push(`Color: ${n.color}`);
            if (n.matched_location && n.matched_location !== "N/A") detailSegments.push(`Stored at: ${n.matched_location}`);
            
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'claim_rejected',
              category: n.category || 'general',
              message: `Your claim request for the item "${n.item_name || 'this item'}" has been rejected since we couldn't verify that you're the owner of the item. You can try again another time.`,
              display_name: n.item_name || "Your Item",
              display_student_id: n.item_student_id || null,
              display_description: detailSegments.length > 0 ? detailSegments.join(" • ") : null,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "rejected",
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "rejected",
              color: n.color || null,
            };
          }

          // ✅ Special handling for item claimed notifications (sent to item reporter)
          if (n.type === 'item_claimed') {
            const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();
            const category = n.category?.toLowerCase();
            const itemDisplay = category === 'id' && n.item_student_id 
              ? `Student ID (${n.item_student_id})` 
              : n.item_name || 'this item';
            
            return {
              id: n.id,
              notification_id: n.id,
              item_id: n.item_id,
              type: 'item_claimed',
              category: n.category || 'general',
              message: `The ID you reported has been successfully claimed by ${n.claimant_full_name || 'the rightful owner'}. Thank you for your cooperation!`,
              display_name: itemDisplay,
              display_student_id: category === 'id' ? n.item_student_id : null,
              display_description: `Claimed by ${n.claimant_full_name || 'Unknown'}`,
              display_image: n.item_image_url || null,
              matched_location: "N/A",
              matched_status: "claimed",
              claimant_name: n.claimant_full_name || 'Unknown',
              claimant_profile_picture: n.claimant_profile_picture || null,
              is_read: Boolean(n.is_read),
              created_at: createdAtRaw.toLocaleString(),
              created_at_ts: createdAtRaw.getTime(),
              match_id: null,
              lost_item_id: null,
              found_item_id: n.item_id,
              matched_item_id: null,
              base_item_type: "found",
              claim_status: "claimed",
            };
          }

          const baseClaimStatus = this.normalizeClaimStatus(
            n.base_user_claim_status
          );
          const matchedClaimStatus = this.normalizeClaimStatus(
            n.matched_user_claim_status
          );
          const category = n.category?.toLowerCase();
          const baseType = (n.base_item_type || n.item_type || "").toLowerCase();
          const displayName = n.display_name || n.item_name || "Matched item";
          const studentId = n.display_student_id || null;
          const description =
            n.display_description ||
            n.matched_description ||
            (category === "id" && studentId
              ? `Possible match for student ID ${studentId}`
              : null);
          const message =
            category === "id"
              ? `A match for your lost Student ID (${studentId || "Unknown"}) has been found!`
              : `A match for your lost "${displayName}" has been found!`;

          const rawImagePath =
            n.display_image || n.matched_image_url || n.item_image_url || null;
          const baseUrl = this.apiBaseUrl.replace(/\/+$/, "");
          const normalizedPath = rawImagePath
            ? rawImagePath.startsWith("/")
              ? rawImagePath
              : `/${rawImagePath}`
            : null;
          const imageUrl = normalizedPath ? `${baseUrl}${normalizedPath}` : null;

          const createdAtRaw = n.created_at ? new Date(n.created_at) : new Date();

          const lostItemId =
            baseType === "lost"
              ? n.item_id
              : baseType === "found"
              ? n.matched_item_id || null
              : n.item_id;

          const foundItemId =
            baseType === "lost"
              ? n.matched_item_id || null
              : baseType === "found"
              ? n.item_id
              : n.matched_item_id || null;

          const resolvedClaimStatus =
            baseType === "lost"
              ? matchedClaimStatus || null
              : baseClaimStatus || matchedClaimStatus || null;

          return {
            id: n.id || `match-${n.match_id}`,
            notification_id: n.id || null,
            item_id: n.item_id,
            lost_item_id: lostItemId,
            found_item_id: foundItemId,
            matched_item_id: n.matched_item_id || null,
            match_id: n.match_id,
            category: n.category,
            message,
            display_name: displayName,
            display_student_id: studentId,
            display_description: description,
            display_image: imageUrl,
            matched_location: n.matched_location || "N/A",
            matched_status: n.matched_status || "in_security_custody",
            is_read: Boolean(n.is_read),
            created_at: createdAtRaw.toLocaleString(),
            created_at_ts: createdAtRaw.getTime(),
            base_item_type: baseType,
            claim_status: resolvedClaimStatus,
          };
        });

        mapped.sort((a, b) => b.created_at_ts - a.created_at_ts);

        this.notifications = mapped;

        if (this.selectedMatch) {
          const key =
            this.selectedMatch.match_id ||
            this.selectedMatch.notification_id ||
            this.selectedMatch.id ||
            this.selectedMatch.item_id ||
            null;
          if (key) {
            const refreshed = this.notifications.find((n) => {
              const candidate =
                n.match_id || n.notification_id || n.id || n.item_id || null;
              return candidate && String(candidate) === String(key);
            });
            if (refreshed) {
              this.selectedMatch = { ...refreshed };
            }
          }
        }

        const newest = this.notifications[0] || null;

        if (!this.notificationsInitialized && markInitial) {
          this.notificationsInitialized = true;
          this.latestNotificationSignature = newest
            ? this.buildNotificationSignature(newest)
            : null;
        } else if (autoPreview) {
          this.tryAutoPreviewLatest(newest);
        }

        return mapped;
      } catch (err) {
        console.error("❌ Error loading notifications:", err);
      }
    },

    buildNotificationSignature(notification) {
      if (!notification) return null;
      const keyParts = [
        notification.match_id ?? "no-match",
        notification.item_id ?? "no-item",
        notification.created_at_ts ?? Date.now(),
      ];
      return keyParts.join("::");
    },

    tryAutoPreviewLatest(candidate) {
      const target = candidate || this.notifications[0] || null;
      if (!target) return;

      const key = target.notification_id || target.id || target.match_id || target.item_id || null;
      // If the user just cleared this notification, skip auto-preview
      if (key && this.recentlyClearedNotificationKeys.includes(String(key))) return;

      const signature = this.buildNotificationSignature(target);
      if (!signature || signature === this.latestNotificationSignature) return;

      this.latestNotificationSignature = signature;
      this.triggerNotificationPreview(target, { showBrowserNotification: false });
    },

    triggerNotificationPreview(notification, options = {}) {
      if (!notification) return;
      const { showBrowserNotification = true } = options;

      if (this.showClaimModal) {
        this.closeClaimModal();
      }

      if (showBrowserNotification) {
        this.maybeSendDesktopNotification(notification);
      }

      this.$nextTick(() => {
        this.viewMatchDetails(notification);
      });
    },

    goToNotificationForMatch(match) {
      // Navigate to the Notifications page and include a query param that
      // the NotificationsPage component will use to auto-open the matching notification.
      if (!match) return;
      const key =
        match.notification_id || match.id || match.match_id || match.item_id || null;
      // mark this notification as read so the badge/count is cleared
      try {
        if (match && typeof match.is_read !== 'undefined') {
          match.is_read = true;
        } else if (match) {
          // attempt to find by id in the notifications array
          const idx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id) === (match.notification_id || match.id || match.match_id));
          if (idx !== -1) this.notifications[idx].is_read = true;
        }
      
        // Also remove the notification from the dropdown locally so it's cleared from the list
        try {
          const key = match.notification_id || match.id || match.match_id || match.item_id || null;
          const removeIdx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id || n.item_id) === key);
          if (removeIdx !== -1) this.notifications.splice(removeIdx, 1);

          // Remember the cleared key briefly so auto-preview/poll/sockets won't reopen it
          if (key) {
            try {
              this.recentlyClearedNotificationKeys.push(String(key));
              this.latestNotificationSignature = this.buildNotificationSignature(match) || this.latestNotificationSignature;
              // remove after 60s
              setTimeout(() => {
                const i = this.recentlyClearedNotificationKeys.indexOf(String(key));
                if (i !== -1) this.recentlyClearedNotificationKeys.splice(i, 1);
              }, 60000);
            } catch (e) {
              // non-fatal
            }
          }
        } catch (e) {
          // non-fatal
        }
      } catch (e) {
        console.warn('Failed to mark notification read locally:', e);
      }
      this.showNotifications = false;
      try {
        const query = key ? { notification_id: String(key) } : {};
        this.$router.push({ path: "/notifications", query });
      } catch (e) {
        console.error("Navigation to notifications failed:", e);
      }
    },

    clearNotification(notif) {
      if (!notif) return;
      try {
        const key = notif.notification_id || notif.id || notif.match_id || notif.item_id || null;
        const idx = this.notifications.findIndex(n => (n.notification_id || n.id || n.match_id || n.item_id) === key);
        if (idx !== -1) this.notifications.splice(idx, 1);

        if (key) {
          // mark recently cleared so we don't auto-preview immediately
          this.recentlyClearedNotificationKeys.push(String(key));
          this.latestNotificationSignature = this.buildNotificationSignature(notif) || this.latestNotificationSignature;
          setTimeout(() => {
            const i = this.recentlyClearedNotificationKeys.indexOf(String(key));
            if (i !== -1) this.recentlyClearedNotificationKeys.splice(i, 1);
          }, 60000);
        }
      } catch (e) {
        console.warn('Failed to clear notification locally:', e);
      }
    },

    clearAndCloseSelectedMatch() {
      try {
        // Remove the corresponding notification from the dropdown (if present)
        if (this.selectedMatch) {
          this.clearNotification(this.selectedMatch);
        }
      } catch (e) {
        console.warn('Failed to clear selected notification:', e);
      } finally {
        // Close the modal
        this.selectedMatch = null;
        this.showClaimModal = false;
      }
    },

    maybeSendDesktopNotification(notification) {
      if (typeof Notification === "undefined") return;

      if (Notification.permission === "granted") {
        new Notification("Item match found!", {
          body:
            notification.category?.toLowerCase() === "id"
              ? "Your Student ID may have been found."
              : `Possible match: ${notification.display_name}`,
          icon: notification.display_image || undefined,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    },

    findNotificationForEvent(evt) {
      if (!evt) return null;

      return (
        this.notifications.find((n) => {
          const matchMatches =
            evt.match_id != null && String(n.match_id) === String(evt.match_id);
          const itemMatches =
            evt.item_id != null && String(n.item_id) === String(evt.item_id);
          const foundMatches =
            evt.found_item_id != null &&
            (String(n.found_item_id) === String(evt.found_item_id) ||
              String(n.matched_item_id) === String(evt.found_item_id));
          return matchMatches || itemMatches || foundMatches;
        }) || null
      );
    },

    // Handle realtime incoming match notification
    async handleNewNotificationEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;

        // Refresh list to get complete display fields
        // If this event corresponds to a notification the user just cleared, ignore it
        const candidateKey = evt.notification_id || evt.match_id || evt.item_id || evt.found_item_id || null;
        if (candidateKey && this.recentlyClearedNotificationKeys.includes(String(candidateKey))) {
          return;
        }

        await this.loadNotifications();

        const newly = this.findNotificationForEvent(evt);
        const target = newly || this.notifications[0] || null;
        if (!target) return;

        const signature = this.buildNotificationSignature(target);
        if (signature === this.latestNotificationSignature) return;

        this.latestNotificationSignature = signature;
        this.triggerNotificationPreview(target, { showBrowserNotification: true });
      } catch (e) {
        console.error("Error handling realtime match event:", e);
      }
    },

    async handleClaimApprovedEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;
        
        // Show a success message
        this.claimResultMessage = evt.message || "Your claim has been approved!";
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 6000);

        // Refresh notifications to reflect the claim status change
        await this.loadNotifications();

        // Update the selected match if open
        if (this.selectedMatch) {
          this.applyClaimState(this.selectedMatch, "approved");
        }

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("✅ Claim Approved!", {
            body: evt.message || "Your claim has been approved. Please visit the Security Office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling claim approved event:", e);
      }
    },

    async handleClaimRejectedEvent(evt) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        // Only react if this event is for the logged-in user
        if (String(evt.user_id) !== String(user.id)) return;
        
        // Show an error message
        this.claimResultMessage = evt.message || "Your claim has been rejected.";
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 6000);

        // Refresh notifications to reflect the claim status change
        await this.loadNotifications();

        // Update the selected match if open
        if (this.selectedMatch) {
          this.applyClaimState(this.selectedMatch, "rejected");
        }

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("❌ Claim Rejected", {
            body: evt.message || "Your claim has been rejected.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling claim rejected event:", e);
      }
    },

    async handleItemReceivedEvent(evt) {
      try {
        // Show modal with item details
        this.itemReceivedModalData = {
          itemName: evt.item_name || "Your Item",
          itemId: evt.item_student_id || null
        };
        this.showItemReceivedModal = true;

        // Refresh notifications to show the new item received notification
        await this.loadNotifications();

        // Send desktop notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("📦 Item Received!", {
            body: evt.message || "Your item has been received by the security office.",
            icon: "/logo.png",
          });
        }
      } catch (e) {
        console.error("Error handling item received event:", e);
      }
    },

    viewMatchDetails(match) {
      if (!match) {
        this.selectedMatch = null;
        return;
      }

      this.selectedMatch = { ...match };
    },

    closeMatchModal() {
      this.selectedMatch = null;
    },

    openClaimModal(match) {
      if (this.isClaimDisabled(match)) return;
      this.showClaimModal = true;
    },

    closeClaimModal() {
      this.showClaimModal = false;
      this.claimMessage = "";
    },

    closeItemReceivedModal() {
      this.showItemReceivedModal = false;
      this.itemReceivedModalData = { itemName: null, itemId: null };
    },

    async submitClaim() {
      if (!this.selectedMatch) return;

      try {
        this.claiming = true;
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) throw new Error("User not logged in!");

        const foundItemId =
          this.selectedMatch.found_item_id || this.selectedMatch.matched_item_id;
        if (!foundItemId) {
          throw new Error(
            "Cannot submit claim because the matched found item is missing. Please run the search again or contact support."
          );
        }

        const targetNotificationId =
          this.selectedMatch.notification_id || this.selectedMatch.id;

        if (!targetNotificationId) {
          throw new Error(
            "Unable to submit claim: missing notification reference for this match."
          );
        }

        const res = await fetch(`http://localhost:5000/api/claims`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            item_id: foundItemId,
            notification_id: targetNotificationId,
            message: this.claimMessage,
          }),
        });

        let data = null;
        try {
          data = await res.json();
        } catch (parseErr) {
          data = null;
        }

        if (res.status === 409) {
          const existingStatus =
            data?.claim?.status ||
            data?.claim?.user_claim_status ||
            data?.claim_status ||
            "pending_claim";
          this.applyClaimState(this.selectedMatch, existingStatus);
          this.claimResultMessage =
            data?.message ||
            "You already submitted a claim for this item. Security is reviewing it.";
          setTimeout(() => {
            this.claimResultMessage = "";
          }, 9000);
          this.closeClaimModal();
          await this.loadNotifications();
          return;
        }

        if (!res.ok)
          throw new Error(
            (data && data.message) || "Failed to submit claim request"
          );

        const suggestion =
          data?.suggestion ||
          "Your claim request was submitted. Please visit the Security Office for verification and claiming.";
        this.claimResultMessage = suggestion;
        setTimeout(() => {
          this.claimResultMessage = "";
        }, 9000);

        this.closeClaimModal();
        this.closeMatchModal();
        this.loadNotifications();
      } catch (err) {
        console.error("❌ Claim failed:", err.message);
        alert(`❌ Claim failed: ${err.message}`);
      } finally {
        this.claiming = false;
      }
    },



    goToProfile() {
      this.showProfileMenu = false;
      this.$router.push("/profile");
    },

    logout() {
      if (this.notificationPollTimer) {
        clearInterval(this.notificationPollTimer);
        this.notificationPollTimer = null;
      }

      if (this.socket) {
        try {
          this.socket.off("newNotification", this.handleNewNotificationEvent);
        } catch (err) {
          console.warn("Failed to remove socket listener on logout:", err);
        }
      }

      disconnectSocket();
      this.socket = null;
      localStorage.clear();
      this.$router.push("/login");
    },

  async fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing authentication token");

        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        if (data.profile_picture)
          data.profile_picture = `http://localhost:5000${data.profile_picture.replace(
            /^\/?uploads\//,
            "/uploads/"
          )}`;
        this.user = data;
      } catch (err) {
        console.error("Fetch user data error:", err);
        disconnectSocket();
        localStorage.clear();
        this.$router.push("/login");
      }
    },

    async loadUserReports() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) return;

        const res = await fetch(
          `http://localhost:5000/api/items?user_id=${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch user reports");

        const data = await res.json();

        // Map items into a display-friendly shape
        const mapped = data.map((it) => {
          const imageUrl = it.image_url
            ? it.image_url.startsWith("/")
              ? `http://localhost:5000${it.image_url}`
              : it.image_url
            : null;

          return {
            id: it.id,
            name: it.name,
            type: it.type,
            status: it.status,
            description: it.description,
            student_id: it.student_id,
            location: it.location,
            image_url: imageUrl,
            created_at: it.created_at
              ? new Date(it.created_at).toLocaleString()
              : null,
          };
        });

        // Show only pending / newly reported items by default
        this.reports = mapped.filter((r) =>
          ["reported_lost", "reported", "pending_review", null].includes(
            (r.status || "").toLowerCase()
          )
        );
      } catch (err) {
        console.error("❌ Error loading user reports:", err);
      }
    },

    viewReport(report) {
      if (!report?.id) return;
      // Navigate to the report page and provide the item id so the page can show details
      this.$router.push({ path: "/report", query: { item_id: report.id } });
    },

    editReport(report) {
      if (!report?.id) return;
      this.$router.push({ path: "/report", query: { edit_id: report.id } });
    },

    // Handler for claim status notifications
    dismissClaimNotification(notifId) {
      // Mark notification as read (dismiss from view)
      this.notifications = this.notifications.filter(n => n.id !== notifId);
    },

    viewClaimItemDetails(itemId) {
      if (!itemId) return;
      // Navigate to lost/found details page for the claimed item
      this.$router.push({ path: "/lost-details", query: { item_id: itemId } });
    },

    resubmitClaimForItem(itemId) {
      if (!itemId) return;
      // Navigate to lost details where user can view and potentially resubmit claim
      this.$router.push({ path: "/lost-details", query: { item_id: itemId } });
    },
  },
  mounted() {
    // Hydrate immediately from localStorage for faster UI update (will be refreshed by fetch)
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (stored) {
        if (stored.profile_picture && !stored.profile_picture.startsWith('http')) {
          const normalizedPath = stored.profile_picture.replace(/^\/?uploads\//, '/uploads/');
          stored.profile_picture = `http://localhost:5000${normalizedPath}`;
        }
        this.user = stored;
      }
    } catch (e) {
      // ignore parse errors
    }

    // Fetch user profile first, then load user-specific data (reports & notifications)
    this.fetchUserData()
      .then(() => {
        this.loadUserReports();
        this.loadNotifications({ markInitial: true });
      })
      .catch((e) => {
        console.warn("Failed to fetch user data at mount:", e);
      });

    // Periodically refresh so matches still appear if realtime events are missed.
    this.notificationPollTimer = setInterval(() => {
      this.loadNotifications({ autoPreview: true });
    }, 10000);

    // Setup Socket.io for realtime notifications (shared singleton)
    try {
      this.socket = initSocket();
      // Attach only the listeners this component needs. Do not disconnect the shared socket on unmount;
      // just remove listeners so other components using the socket are unaffected.
      this.socket.on("newNotification", this.handleNewNotificationEvent);
      this.socket.on("claimApproved", this.handleClaimApprovedEvent);
      this.socket.on("claimRejected", this.handleClaimRejectedEvent);
      this.socket.on("itemReceived", this.handleItemReceivedEvent);
      
      // ✅ When socket reconnects, refresh notifications to catch any missed events
      this.socket.on("connect", () => {
        console.log("✅ Socket reconnected, refreshing notifications...");
        this.loadNotifications({ autoPreview: true });
      });
    } catch (e) {
      console.error("Failed to initialize realtime socket:", e);
    }
  },
  beforeUnmount() {
    if (this.notificationPollTimer) {
      clearInterval(this.notificationPollTimer);
      this.notificationPollTimer = null;
    }

    if (this.socket) {
      try {
        this.socket.off("newNotification", this.handleNewNotificationEvent);
        this.socket.off("claimApproved", this.handleClaimApprovedEvent);
        this.socket.off("claimRejected", this.handleClaimRejectedEvent);
        this.socket.off("itemReceived", this.handleItemReceivedEvent);
        this.socket.off("connect");
        // Do not call disconnect() on the shared socket here. Other components may still need it.
      } catch (e) {
        // Non-fatal: ignore socket cleanup errors during unmount
        // console.debug("socket cleanup error", e);
      }
    }
  },
};
</script>

<style scoped>
/* ... (keep all existing styles unchanged) ... */
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.new-report-highlight {
  animation: highlightFlash 1.5s ease-in-out;
  box-shadow: 0 0 20px 4px rgba(0, 255, 100, 0.4);
  border: 2px solid rgba(0, 255, 100, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}

@keyframes highlightFlash {
  0% { background-color: rgba(0, 255, 100, 0.1); transform: scale(1.02); }
  50% { background-color: rgba(0, 255, 100, 0.25); transform: scale(1.05); }
  100% { background-color: transparent; transform: scale(1); }
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.4s ease-in-out;
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

.report-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 12px rgba(0, 255, 150, 0.3);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(75, 85, 99, 0.2);
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
  border-radius: 0.5rem;
}

.modal-fade {
  animation: modalFadeIn 0.4s ease;
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>