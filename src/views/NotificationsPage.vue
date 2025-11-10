<template>
  <div class="p-6 min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
    <h2 class="text-2xl font-bold mb-6 text-yellow-400">Alerts</h2>

    <div v-if="successBanner" class="mb-4 w-full max-w-xl">
      <div class="px-4 py-3 rounded-lg bg-green-600 text-white text-sm flex items-start justify-between">
        <div class="pr-4">{{ successBanner }}</div>
        <button @click="successBanner = ''" class="ml-4 text-white text-sm font-bold px-2 py-1 rounded hover:bg-green-700">✕</button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400">Loading notifications...</div>
    <div v-else-if="errorMessage" class="text-red-400">{{ errorMessage }}</div>

    <!-- Notifications List -->
    <div
      v-else-if="!selectedNotification && notifications.length"
      class="w-full max-w-md sm:max-w-lg lg:max-w-xl space-y-4"
    >
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="bg-gray-900 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-800 transition"
        @click="openNotification(notif)"
      >
        <h3 class="text-lg font-semibold text-yellow-400">{{ notif.title }}</h3>
        <p class="text-gray-300 text-sm mt-1">{{ notif.message }}</p>
        <p v-if="notif.created_at" class="text-gray-500 text-xs mt-2">
          {{ notif.created_at }}
        </p>
      </div>
    </div>

    <div
      v-else-if="!selectedNotification && !notifications.length"
      class="text-gray-500"
    >
      No notifications yet.
    </div>

    <!-- Notification Details -->
    <div
      v-else
      class="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800"
    >
      <h2 class="text-xl font-bold mb-3 text-white">
        {{ selectedNotification.title }}
      </h2>
      <p class="text-gray-300 mb-4">{{ selectedNotification.details }}</p>

      <img
        v-if="selectedNotification.image"
        :src="selectedNotification.image"
        alt="Matched item"
        class="w-full h-48 object-cover rounded-lg border border-gray-700 mb-4"
      />

      <div class="text-sm text-gray-400 space-y-1 mb-4">
        <p v-if="selectedNotification.location">Location: {{ selectedNotification.location }}</p>
        <p v-if="selectedNotification.status">Status: {{ selectedNotification.status }}</p>
        <p v-if="selectedNotification.studentId">Tagged Student ID: {{ selectedNotification.studentId }}</p>
      </div>

      <div class="flex items-center space-x-3">
        <button
          @click="selectedNotification = null"
          class="mt-2 px-6 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition"
        >
          ← Back
        </button>

        <!-- Claim CTA: show when this notification represents a match for user's lost item -->
        <button
          v-if="selectedNotification.base_item_type && selectedNotification.base_item_type.toLowerCase() === 'lost'"
          @click="openClaimModal"
          class="mt-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          I want to claim this item
        </button>
      </div>
    </div>

    <!-- Claim Confirmation Modal -->
    <div v-if="showClaimModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div class="p-5">
          <h3 class="text-xl font-bold text-gray-800 mb-3">Confirm Claim Request</h3>
          <p class="text-gray-600 mb-3">You're about to submit a claim request for this found item. Add a short message for security (optional):</p>

          <textarea
            v-model="claimMessage"
            rows="4"
            class="w-full p-2 border rounded-lg mb-4 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Optional: describe why this is yours (unique marks, time/place, etc.)"
          ></textarea>

          <div class="flex justify-end gap-3">
            <button @click="closeClaimModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button @click="submitClaim" :disabled="claiming" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              <span v-if="!claiming">Confirm & Send Claim</span>
              <span v-else>Submitting...</span>
            </button>
          </div>

          <p v-if="claimResultMessage" class="mt-3 text-sm text-green-600">{{ claimResultMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const notifications = ref([]);
const selectedNotification = ref(null);
const loading = ref(false);
const errorMessage = ref("");
const successBanner = ref("");

const API_BASE = "http://localhost:5000";

const mapNotification = (row) => {
  const title = row.category?.toLowerCase() === "id" ? "Student ID match found" : "Item match found";
  const message =
    row.category?.toLowerCase() === "id"
      ? `Your Student ID (${row.display_student_id || "Unknown"}) might be at Security.`
      : `A possible match for "${row.display_name}" was found.`;

  const detailSegments = [];
  if (row.display_description) detailSegments.push(row.display_description);
  if (row.matched_location) detailSegments.push(`Stored at: ${row.matched_location}`);
  if (row.matched_status) detailSegments.push(`Current status: ${row.matched_status.replace(/_/g, " ")}`);

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
    status: row.matched_status ? row.matched_status.replace(/_/g, " ") : null,
    studentId: row.display_student_id || null,
    created_at: row.created_at ? new Date(row.created_at).toLocaleString() : null,
  };
};

const route = useRoute();

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

const openNotification = (notif) => {
  selectedNotification.value = notif;
};

// Claim modal state & actions
const showClaimModal = ref(false);
const claimMessage = ref("");
const claiming = ref(false);
const claimResultMessage = ref("");

const openClaimModal = () => {
  showClaimModal.value = true;
  claimMessage.value = "";
  claimResultMessage.value = "";
};

const closeClaimModal = () => {
  showClaimModal.value = false;
  claimMessage.value = "";
};

const submitClaim = async () => {
  if (!selectedNotification.value) return;
  try {
    claiming.value = true;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) throw new Error("Please sign in to submit a claim.");

    // Determine found item id: when base_item_type is 'lost', matched_item_id is the found item
    // Otherwise, if base is 'found', the item_id may be the found item.
    const baseType = (selectedNotification.value.base_item_type || "").toLowerCase();
    const foundItemId = baseType === "lost"
      ? selectedNotification.value.matched_item_id || selectedNotification.value.found_item_id || null
      : selectedNotification.value.item_id || null;

    if (!foundItemId) throw new Error("Found item reference missing; cannot submit claim.");

    // Use notification_id if present, otherwise pass null and backend will handle
    const targetNotificationId = selectedNotification.value.notification_id || null;

    const res = await axios.post(`${API_BASE}/api/claims`, {
      user_id: user.id,
      item_id: foundItemId,
      notification_id: targetNotificationId,
      message: claimMessage.value,
    });

    if (res.status === 201 || res.status === 200) {
      claimResultMessage.value = res.data?.message || "Claim submitted. Security will review it.";
      // Refresh notifications so status updates are visible
      await loadNotifications();
      // Close modal after brief pause
      setTimeout(() => {
        closeClaimModal();
      }, 1200);

      // Show a persistent success banner on the page until the user dismisses it
      successBanner.value =
        res.data?.message ||
        "Your claim request has been sent. Please visit the Security Office for verification and claiming of that item.";
    } else {
      throw new Error(res.data?.message || "Failed to submit claim");
    }
  } catch (err) {
    console.error("Claim submission failed:", err);
    claimResultMessage.value = err?.response?.data?.message || err.message || "Claim failed.";
  } finally {
    claiming.value = false;
  }
};

onMounted(async () => {
  await loadNotifications();

  // If a notification_id query param is present, auto-open the matching notification
  try {
    const qid = route.query.notification_id || route.query.notificationId || null;
    if (qid) {
      const match = notifications.value.find((n) => String(n.id) === String(qid));
      if (match) {
        selectedNotification.value = match;
      }
    }
  } catch (e) {
    console.warn('Failed to auto-open notification from query:', e);
  }
});
</script>
