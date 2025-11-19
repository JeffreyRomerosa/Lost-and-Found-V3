<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 pb-32">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-6 sm:mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-yellow-400 mb-2">Alerts</h1>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your lost and found notifications</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-6xl mx-auto text-center py-12">
      <p class="text-gray-600 dark:text-gray-400 text-lg">Loading notifications...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="max-w-6xl mx-auto mb-6 px-4 py-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm sm:text-base">
      {{ errorMessage }}
    </div>

    <!-- Notifications List -->
    <div v-else-if="!selectedNotification && notifications.length" class="max-w-6xl mx-auto">
      <div class="space-y-3 sm:space-y-4">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-md dark:shadow-lg group cursor-pointer transform transition duration-200 ease-out hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl filter dark:hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 relative"
          role="button"
          tabindex="0"
          @keydown.enter="openNotification(notif)"
          @click="openNotification(notif)"
        >
          <!-- Delete button (top-right corner) -->
          <button
            @click.stop="deleteNotification(notif.id)"
            class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 dark:bg-red-600 text-white font-bold hover:bg-red-700 dark:hover:bg-red-700 transition shadow-md"
            title="Delete notification"
          >
            ✕
          </button>

          <div class="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            <!-- Added responsive grid layout for thumbnail -->
            <!-- Left: thumbnail -->
            <div class="col-span-1 lg:col-span-2 flex items-start">
              <div class="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                <img
                  v-if="notif.image"
                  :src="notif.image"
                  alt="Matched item"
                  class="w-full h-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <div v-else class="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700">
                  <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Middle: main info -->
            <div class="col-span-1 lg:col-span-7">
              <div class="flex flex-col h-full justify-between">
                <div>
                  <h3 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-yellow-400 mb-2 break-words">{{ notif.title }}</h3>
                  <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed break-words">{{ notif.message }}</p>
                  
                  <!-- Added responsive spacing and icon sizing for details -->
                  <!-- Details -->
                  <div class="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p v-if="notif.location" class="text-gray-600 dark:text-gray-400 flex items-start sm:items-center gap-2">
                      <svg class="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0 text-emerald-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span class="break-words">{{ notif.location }}</span>
                    </p>
                    <p v-if="notif.created_at" class="text-gray-600 dark:text-gray-400 flex items-start sm:items-center gap-2">
                      <svg class="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatDate(notif.created_at) }}
                    </p>
                  </div>
                </div>

                <!-- Added responsive status badge styling -->
                <!-- Status badge -->
                <div class="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
                  <span
                    v-if="notif.status"
                    class="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500 dark:bg-emerald-500 text-black dark:text-black"
                  >
                    {{ (notif.status || '').toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Made action buttons responsive with responsive spacing -->
            <!-- Right: View Details button -->
            <div class="col-span-1 lg:col-span-3 flex flex-col gap-2 items-stretch">
              <button
                @click.stop="openNotification(notif)"
                class="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-emerald-500 dark:bg-emerald-500 text-black font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!selectedNotification && !notifications.length" class="max-w-6xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-800">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">You'll see alerts here when items are found or matched</p>
      </div>
    </div>

    <!-- Notification Details Modal -->
    <div
      v-else
      class="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <!-- Added responsive modal sizing and padding -->
      <div class="bg-white dark:bg-gray-900 rounded-xl max-w-sm sm:max-w-lg lg:max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <!-- Close button -->
        <button
          @click="closeNotificationModal"
          class="absolute top-4 right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition"
          title="Close"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="p-4 sm:p-6 lg:p-8 pt-12 sm:pt-8">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-yellow-400 break-words">{{ selectedNotification.title }}</h2>

          <!-- Added responsive image sizing -->
          <!-- Image -->
          <div class="relative mb-6 w-full">
            <img
              v-if="selectedNotification.image"
              :src="selectedNotification.image"
              alt="Matched item"
              class="w-full h-40 sm:h-48 lg:h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
            />

            <!-- Student badge overlay -->
            <div v-if="selectedNotification.studentId" class="absolute bottom-3 left-3 bg-yellow-500 text-black text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1 sm:py-2 rounded shadow-lg">
              Student: {{ selectedNotification.studentId }}
            </div>
          </div>

          <!-- Added responsive text sizes and spacing in details section -->
          <!-- Details -->
          <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-2 sm:space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <p v-if="selectedNotification.location">
              <span class="font-semibold text-gray-900 dark:text-white">Location:</span> {{ selectedNotification.location }}
            </p>
            <p v-if="selectedNotification.color">
              <span class="font-semibold text-gray-900 dark:text-white">Color:</span> {{ selectedNotification.color }}
            </p>
            <p v-if="selectedNotification.status">
              <span class="font-semibold text-gray-900 dark:text-white">Status:</span> {{ selectedNotification.status }}
            </p>
            <p v-if="selectedNotification.studentId">
              <span class="font-semibold text-gray-900 dark:text-white">Tagged Student ID:</span> {{ selectedNotification.studentId }}
            </p>
            <p v-if="selectedNotification.created_at">
              <span class="font-semibold text-gray-900 dark:text-white">Posted:</span> {{ formatDate(selectedNotification.created_at) }}
            </p>
          </div>

          <!-- Made action buttons responsive and stackable on mobile -->
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 items-stretch">
            <button
              @click="closeNotificationModal"
              class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 transition-all shadow-md text-sm sm:text-base"
            >
              ← Back
            </button>

            <!-- Claim CTA -->
            <button
              v-if="selectedNotification.base_item_type && selectedNotification.base_item_type.toLowerCase() === 'lost'"
              @click="openClaimModal"
              class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-green-600 dark:bg-green-600 text-white font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition-all shadow-md text-sm sm:text-base"
            >
              I want to claim this item
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim Confirmation Modal -->
    <div v-if="showClaimModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <!-- Added responsive modal sizing -->
      <div class="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        <div class="p-4 sm:p-6 lg:p-8">
          <h3 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-emerald-400 mb-3 sm:mb-4">Confirm Claim Request</h3>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">You're about to submit a claim request for this found item. Add a short message for security (optional):</p>

          <textarea
            v-model="claimMessage"
            rows="4"
            class="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 sm:mb-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 text-sm"
            placeholder="Optional: describe why this is yours"
          ></textarea>

          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              @click="closeClaimModal"
              class="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              @click="submitClaim"
              :disabled="claiming"
              class="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base"
              :class="claiming ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50' : 'bg-green-600 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-700'"
            >
              <span v-if="!claiming">Confirm & Send Claim</span>
              <span v-else>Submitting...</span>
            </button>
          </div>

          <p v-if="claimResultMessage" class="mt-4 text-xs sm:text-sm text-green-600 dark:text-green-400 text-center">{{ claimResultMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Claim Submitted Confirmation -->
    <div v-if="showClaimConfirmation" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <!-- Added responsive modal sizing -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm my-6 border border-gray-200 dark:border-gray-800">
        <!-- Success Message -->
        <div class="text-center p-6 mb-4 border-b border-gray-200 dark:border-gray-800">
          <div class="mb-4">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-emerald-400 mb-3 sm:mb-4">Claim Request Submitted!</h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Your claim request has been submitted. Please visit the security office for verification and claiming of the item.
          </p>
        </div>

        <!-- Office Hours Section -->
        <div v-if="getOfficeHours()" class="px-6 pb-6 space-y-4">
          <!-- Today's Hours -->
          <div :class="[
            'p-4 rounded border-l-4',
            getOfficeHours().isOpen
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400'
          ]">
            <h3 class="font-semibold mb-3 flex items-center gap-2" :class="[
              getOfficeHours().isOpen
                ? 'text-green-900 dark:text-green-100'
                : 'text-amber-900 dark:text-amber-100'
            ]">
              <svg v-if="getOfficeHours().isOpen" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v6a3 3 0 01-.709 1.938l-5.854 7.381a3 3 0 01-4.474 0L3.172 10.938A3 3 0 012.5 9V3.457a3.066 3.066 0 012.767-3.002z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ getOfficeHours().isOpen ? '✓ Office is Open Today!' : '⚠ Office is Closed Today' }}
            </h3>
            
            <!-- Today's Hours Display -->
            <div class="p-3 bg-white dark:bg-gray-800 rounded border" :class="[
              getOfficeHours().isOpen
                ? 'border-green-200 dark:border-green-700'
                : 'border-amber-200 dark:border-amber-700'
            ]">
              <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today ({{ getOfficeHours().todayName }}):</p>
              <div v-if="getOfficeHours().isOpen" class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <p class="text-sm font-bold text-green-700 dark:text-green-300">
                  {{ getOfficeHours().today.open }} - {{ getOfficeHours().today.close }}
                </p>
                <span class="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-semibold">OPEN</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <p class="text-sm font-semibold text-red-700 dark:text-red-300">Closed Today</p>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <button
            @click="closeClaimConfirmation"
            class="w-full py-2.5 sm:py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
          >
            OK
          </button>
        </div>

        <!-- Fallback if office hours not loaded -->
        <div v-else class="px-6 pb-6">
          <button
            @click="closeClaimConfirmation"
            class="w-full py-2.5 sm:py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const notifications = ref([]);
const selectedNotification = ref(null);
const loading = ref(false);
const errorMessage = ref("");

const showClaimModal = ref(false);
const claimMessage = ref("");
const claiming = ref(false);
const claimResultMessage = ref("");
const showClaimConfirmation = ref(false);
const confirmationMessage = ref("");
const weekSchedule = ref([]);

const API_BASE = "http://localhost:5000";

// Format date for UI
const formatDate = (dateStr) => {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format time from 24-hour to 12-hour AM/PM format
const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  try {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

// Load office hours from API
const loadOfficeHours = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/office-hours/week`);
    if (!response.ok) throw new Error("Failed to fetch office hours");
    weekSchedule.value = await response.json();
  } catch (err) {
    console.error("Failed to load office hours:", err);
    weekSchedule.value = [];
  }
};

// Get today's office hours
const getOfficeHours = () => {
  if (weekSchedule.value.length === 0) return null;
  const today = new Date();
  const todayIndex = today.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todaySchedule = weekSchedule.value[todayIndex] || {};
  const isOpen = todaySchedule.is_open;
  return {
    today: {
      open: isOpen ? formatTime(todaySchedule.opening_time) : "Closed",
      close: isOpen ? formatTime(todaySchedule.closing_time) : "-",
    },
    todayName: dayNames[todayIndex],
    isOpen: isOpen || false
  };
};

// Map backend data to notification format
const mapNotification = (row) => {
  // Handle claim rejection notifications
  if (row.type === 'claim_rejected') {
    const detailSegments = [];
    if (row.display_description) detailSegments.push(row.display_description);
    if (row.color) detailSegments.push(`Color: ${row.color}`);
    if (row.matched_location) detailSegments.push(`Stored at: ${row.matched_location}`);
    
    return {
      id: row.id || `rejection-${Date.now()}`,
      notification_id: row.id || null,
      title: "❌ Claim Request Rejected",
      message: `Your claim request for the item "${row.display_name || row.item_name || 'this item'}" has been rejected since we couldn't verify that you're the owner of the item. You can try again another time.`,
      details: detailSegments.join(" • ") || `Item: ${row.display_name || row.item_name || 'Unknown'}`,
      image: row.display_image ? `${API_BASE}${row.display_image}` : (row.item_image_url ? `${API_BASE}${row.item_image_url}` : null),
      location: row.matched_location || null,
      color: row.color || null,
      status: "Rejected",
      created_at: row.created_at || null,
      is_rejection: true,
    };
  }

  // Handle claim approved notifications
  if (row.type === 'claim_approved') {
    return {
      id: row.id || `approval-${Date.now()}`,
      notification_id: row.id || null,
      title: "✅ Claim Request Approved",
      message: `Your claim request for "${row.display_name || row.item_name || 'this item'}" has been approved! Please visit the Security Office with your student ID to complete the item handover.`,
      details: `Item: ${row.display_name || row.item_name || 'Unknown'} • Status: Approved`,
      image: row.display_image ? `${API_BASE}${row.display_image}` : null,
      location: row.matched_location || null,
      status: "Approved",
      created_at: row.created_at || null,
      is_approval: true,
    };
  }

  // Handle match found notifications (original logic)
  const title =
    row.category?.toLowerCase() === "id"
      ? "⭐ Student ID match found"
      : "⭐ Item match found";

  const message =
    row.category?.toLowerCase() === "id"
      ? `Your Student ID (${row.display_student_id || "Unknown"}) is currently in the custody of the Security Office.`
      : `A match for "${row.display_name}" has been found and is currently in the custody of the Security Office.`;

  const detailSegments = [];
  if (row.display_description) detailSegments.push(row.display_description);
  if (row.matched_location)
    detailSegments.push(`Stored at: ${row.matched_location}`);
  if (row.matched_status)
    detailSegments.push(`Current status: ${row.matched_status.replace(/_/g, " ")}`);

  return {
    id: row.id || `match-${row.match_id}`,
    notification_id: row.id || null,
    match_id: row.match_id || null,
    item_id: row.item_id || null,
    matched_item_id: row.matched_item_id || null,
    base_item_type: row.base_item_type || null,
    title,
    message,
    details: detailSegments.join(" • ") || message,
    image: row.display_image ? `${API_BASE}${row.display_image}` : null,
    location: row.matched_location || null,
    status: row.matched_status
      ? row.matched_status.replace(/_/g, " ")
      : null,
    studentId: row.display_student_id || null,
    created_at: row.created_at || null,
  };
};

// Load notifications from API
const loadNotifications = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) {
      errorMessage.value = "Please sign in to view notifications.";
      notifications.value = [];
      return;
    }

    const res = await axios.get(`${API_BASE}/api/notifications/${user.id}`);
    notifications.value = Array.isArray(res.data)
      ? res.data.map(mapNotification)
      : [];
  } catch (err) {
    console.error("Failed to load notifications:", err);
    errorMessage.value = "Unable to load notifications right now.";
  } finally {
    loading.value = false;
  }
};

// Notification actions
const openNotification = (notif) => {
  selectedNotification.value = notif;
};

const closeNotificationModal = async () => {
  if (selectedNotification.value?.notification_id) {
    try {
      await axios.put(
        `${API_BASE}/api/notifications/${selectedNotification.value.notification_id}/clear`
      );
    } catch (err) {
      console.error("Failed to clear notification:", err);
    }
  }
  selectedNotification.value = null;
};

const deleteNotification = async (notificationId) => {
  try {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    await axios.delete(`${API_BASE}/api/notifications/${notificationId}`);
    notifications.value = notifications.value.filter(
      (n) => n.id !== notificationId
    );

    if (selectedNotification.value?.id === notificationId) {
      selectedNotification.value = null;
    }
  } catch (err) {
    console.error("Failed to delete notification:", err);
    errorMessage.value = "Failed to delete notification. Please try again.";
  }
};

// Claim modal actions
const openClaimModal = () => {
  showClaimModal.value = true;
  claimMessage.value = "";
  claimResultMessage.value = "";
};

const closeClaimModal = () => {
  showClaimModal.value = false;
  claimMessage.value = "";
};

const closeClaimConfirmation = () => {
  showClaimConfirmation.value = false;
  closeNotificationModal();
};

const submitClaim = async () => {
  if (!selectedNotification.value) return;

  try {
    claiming.value = true;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) throw new Error("Please sign in to submit a claim.");

    const baseType =
      (selectedNotification.value.base_item_type || "").toLowerCase();
    const foundItemId =
      baseType === "lost"
        ? selectedNotification.value.matched_item_id ||
          selectedNotification.value.found_item_id ||
          null
        : selectedNotification.value.item_id || null;

    if (!foundItemId)
      throw new Error("Found item reference missing; cannot submit claim.");

    const targetNotificationId =
      selectedNotification.value.notification_id || null;

    const res = await axios.post(`${API_BASE}/api/claims`, {
      user_id: user.id,
      item_id: foundItemId,
      notification_id: targetNotificationId,
      message: claimMessage.value,
    });

    if (res.status === 201 || res.status === 200) {
      const msg =
        res.data?.message ||
        "Your claim request has been submitted to the security office.";
      confirmationMessage.value = msg;

      // Load office hours before showing confirmation
      await loadOfficeHours();
      await loadNotifications();
      closeClaimModal();
      showClaimConfirmation.value = true;
    } else {
      throw new Error(res.data?.message || "Failed to submit claim");
    }
  } catch (err) {
    console.error("Claim submission failed:", err);
    claimResultMessage.value =
      err?.response?.data?.message || err.message || "Claim failed.";
  } finally {
    claiming.value = false;
  }
};

// Lifecycle hook
onMounted(async () => {
  await loadNotifications();

  try {
    const qid = route.query.notification_id || route.query.notificationId;
    if (qid) {
      const match = notifications.value.find(
        (n) => String(n.notification_id) === String(qid)
      );
      if (match) openNotification(match);
    }
  } catch (err) {
    console.error("Query handling failed:", err);
  }
});
</script>

