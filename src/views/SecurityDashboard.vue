<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
    <!-- Sidebar -->
    <SecuritySidebar 
      :unread-lost="unreadLostCount"
      :unread-found="unreadFoundCount"
      :unread-returned="unreadReturnedCount"
      :pending-claims="sidebarPendingCount"
      @select-page="handleSidebarSelect"
    />

    <!-- Navbar -->
    <nav
      class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-40 flex justify-between items-center px-6 h-16 transition-colors duration-200"
    >
      <h1 class="text-xl font-semibold text-yellow-500 dark:text-yellow-400">Security Dashboard</h1>
      <div class="flex items-center gap-4" ref="profileMenuRef">
        <!-- Notification (bell) button placed before name/email as requested -->
        <div class="relative" ref="notificationsRef">
          <button
            @click.stop="toggleNotifications"
            title="Notifications"
            class="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span v-if="!notificationsSeen && claimNotifications.length > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">{{ claimNotifications.length }}</span>
          </button>

          <!-- Notifications dropdown (claim requests for items in security custody) -->
          <div
            v-if="showNotificationsDropdown"
            class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-3 max-h-96 overflow-auto transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-gray-900 dark:text-white">Claim Requests</h4>
              <button @click.stop="clearAllNotifications" class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Clear</button>
            </div>
            <div v-if="claimNotifications.length === 0" class="text-gray-600 dark:text-gray-400 text-sm">No claim requests at the moment.</div>
            <div v-for="note in claimNotifications" :key="note.claim_id" class="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                      <div class="flex gap-3">
                        <img
                          v-if="((note.item && note.item.image_url) || note.item_image || note.display_image) && !note.itemImageError"
                          :src="getFullUrl((note.item && note.item.image_url) || note.item_image || note.display_image)"
                          @error="note.itemImageError=true"
                          class="w-12 h-12 object-cover rounded"
                        />
                        <div v-else class="w-12 h-12 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">N/A</div>

                <div class="flex-1 text-sm">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">{{ (note.item && note.item.name) || note.item_name || 'Unknown item' }}</div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">Status: {{ formatStatus((note.item && note.item.status) || note.item_status) }}</div>
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(note.created_at) }}</div>
                  </div>

                    <div class="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    <div class="mb-1"><strong>Message:</strong> <span class="text-sm">{{ note.message || note.claimant_message || '—' }}</span></div>
                    <div class="flex items-center gap-2 mt-1">
                      <img
                        v-if="note.claimant_profile_picture"
                        :src="getFullUrl(note.claimant_profile_picture)"
                        class="w-7 h-7 rounded-full object-cover"
                        @error="note._claimantImageError = true; $event.target.style.display='none'"
                      />
                      <div v-else class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">{{ (note.claimant_name || 'U')[0].toUpperCase() }}</div>
                      <div class="text-xs">
                        <div class="font-medium text-gray-900 dark:text-white">{{ note.claimant_name || note.user_name || 'Unknown' }}</div>
                        <div class="text-gray-600 dark:text-gray-400">{{ note.claimant_email || note.user_email || '' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 flex justify-end">
                    <button @click.stop="openRequestFromNotification(note)" class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-black rounded text-sm transition-colors font-medium">View Request</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden sm:block text-right">
          <p class="font-semibold text-gray-900 dark:text-white">{{ securityDisplayName }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">{{ securityDisplayEmail }}</p>
        </div>
        <button
          @click.stop="toggleProfileMenu"
          class="w-10 h-10 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-semibold border-2 border-yellow-400 overflow-hidden"
        >
          <img
            v-if="securityAvatar"
            :src="securityAvatar"
            alt="Security Avatar"
            class="w-full h-full object-cover"
          />
          <span v-else>{{ securityInitial }}</span>
        </button>
        <div
          v-if="showProfileMenu"
          class="absolute right-6 top-14 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-colors"
        >
          <button
            @click="goToProfile"
            class="w-full px-4 py-2 flex items-center gap-2 text-left text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
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
          <button
            @click="logout"
            class="w-full px-4 py-2 flex items-center gap-2 text-left text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 12h4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
    
    <!-- Main Content (with left margin for sidebar) -->
    <div class="pt-24 pl-64 px-6">
      <!-- DASHBOARD -->
      <div v-if="currentPage === 'dashboard'">
        <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
            <p class="text-gray-600 dark:text-gray-400 text-sm">Lost Reports</p>
            <p class="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{{ lostItems.length }}</p>
          </div>
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
            <p class="text-gray-600 dark:text-gray-400 text-sm">Found Reports</p>
            <p class="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{{ foundItems.length }}</p>
          </div>
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
            <p class="text-gray-600 dark:text-gray-400 text-sm">Pending Claims</p>
            <p class="text-3xl font-bold text-red-500 dark:text-red-500">{{ pendingClaimsCount }}</p>
          </div>
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
            <p class="text-gray-600 dark:text-gray-400 text-sm">Returned Items</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-500">{{ returnedHistory.length }}</p>
          </div>
        </div>
      </div>

      <!-- LOST REPORTS -->
      <div v-if="currentPage === 'lost-reports'">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Lost Reports</h2>
        <div class="mb-4 flex justify-between items-center">
          <input
            v-model="lostSearch"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          />
          <select
            v-model="lostCategoryFilter"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="id">ID Items</option>
            <option value="general">General Items</option>
          </select>
        </div>

        <div
          v-if="filteredLostItems.length === 0"
          class="border border-gray-300 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 mb-6 transition-colors"
        >
          No lost reports for now.
        </div>

        <table
          v-else
          class="min-w-full bg-white dark:bg-gray-900 text-left text-sm text-gray-900 dark:text-gray-300 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Details</th>
              <th class="px-4 py-2">Date Lost</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Reported By</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredLostItems"
              :key="item.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td class="px-4 py-2">
                <img
                  v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError"
                  :src="`${API_BASE_URL}${item.image_url}`"
                  @error="item.imageError = true"
                  class="w-12 h-12 object-cover rounded"
                />
                <span v-else class="text-gray-400">N/A</span>
              </td>
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">{{ item.category || "General" }}</td>
              <td class="px-4 py-2">
                <span
                  v-if="item.category === 'id' && item.student_id"
                  ><strong>Student ID:</strong> {{ item.student_id }}</span
                >
                <span v-else-if="item.brand || item.color">
                  <span v-if="item.brand"><strong>Brand:</strong> {{ item.brand }}</span>
                  <span v-if="item.color" class="ml-2"
                    ><strong>Color:</strong> {{ item.color }}</span
                  >
                </span>
                <span v-else>N/A</span>
              </td>
              <td class="px-4 py-2">{{ formatDate(item.datetime) }}</td>
              <td class="px-4 py-2">{{ formatStatus(item.status) }}</td>
              <td class="px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="item.reporter_profile_picture && !item.reporterImageError"
                    :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                    @error="item.reporterImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ item.reporter_name ? item.reporter_name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.reporter_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="px-4 py-2 flex space-x-2">
                <button
                  @click="viewItem(item)"
                  class="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                >
                  View
                </button>
                <!-- 'Mark Received' removed from Lost Reports as requested -->
                <template v-if="item.status === 'in_security_custody'">
                  <button
                    @click="openReturnModal(item)"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Mark as Returned
                  </button>
                  <button
                    @click="openClaimsModal(item)"
                    class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    View Claims
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FOUND REPORTS -->
      <div v-if="currentPage === 'found-reports'">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Found Reports</h2>
        <!-- ... (unchanged) ... -->
        <div class="mb-4 flex justify-between items-center">
          <input
            v-model="foundSearch"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          />
          <div class="flex space-x-4">
            <select
              v-model="foundStatusFilter"
              class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_security_custody">In Security Custody</option>
            </select>
            <select
              v-model="foundCategoryFilter"
              class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            >
              <option value="">All Categories</option>
              <option value="id">ID Items</option>
              <option value="general">General Items</option>
            </select>
          </div>
        </div>

        <div
          v-if="filteredFoundItems.length === 0"
          class="border border-gray-300 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 mb-6 transition-colors"
        >
          No found reports for now.
        </div>

        <table
          v-else
          class="min-w-full bg-white dark:bg-gray-900 text-left text-sm text-gray-900 dark:text-gray-300 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Details</th>
              <th class="px-4 py-2">Date Found</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Reported By</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredFoundItems"
              :key="item.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td class="px-4 py-2">
                <img
                  v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError"
                  :src="`${API_BASE_URL}${item.image_url}`"
                  @error="item.imageError = true"
                  class="w-12 h-12 object-cover rounded"
                />
                <span v-else class="text-gray-400 dark:text-gray-500">N/A</span>
              </td>
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">{{ item.category || "General" }}</td>
              <td class="px-4 py-2">
                <span
                  v-if="item.category === 'id' && item.student_id"
                  ><strong>Student ID:</strong> {{ item.student_id }}</span
                >
                <span v-else-if="item.brand || item.color">
                  <span v-if="item.brand"><strong>Brand:</strong> {{ item.brand }}</span>
                  <span v-if="item.color" class="ml-2"
                    ><strong>Color:</strong> {{ item.color }}</span
                  >
                </span>
                <span v-else>N/A</span>
              </td>
              <td class="px-4 py-2">{{ formatDate(item.datetime) }}</td>
              <td class="px-4 py-2">{{ formatStatus(item.status) }}</td>
              <td class="px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="item.reporter_profile_picture && !item.reporterImageError"
                    :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                    @error="item.reporterImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ item.reporter_name ? item.reporter_name.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.reporter_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="px-4 py-2 flex space-x-2">
                <button
                  @click="viewItem(item)"
                  class="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                >
                  View
                </button>
                <button
                  v-if="item.status === 'pending'"
                  @click="openReviewModal(item)"
                  class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Mark Received
                </button>
                <!-- For items already in security custody we intentionally hide the additional action buttons here. Use the item's View button to open details or the Claims modal from within the item detail view. -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CLAIM REQUESTS -->
      <div v-if="currentPage === 'claim-requests'">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Claim Requests</h2>
        <div class="mb-4 flex justify-between items-center">
          <input
            v-model="claimsSearch"
            type="text"
            placeholder="Search by Item Name, Student ID, or Claimant Name"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          />
          <select
            v-model="claimsStatusFilter"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white ml-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            v-model="claimsCategoryFilter"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white ml-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          >
            <option value="">All Categories</option>
            <option value="student">Student ID</option>
            <option value="general">General Items</option>
          </select>
        </div>

        <div
          v-if="filteredClaimRequests.length === 0"
          class="border border-gray-300 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 mb-6 transition-colors"
        >
          {{ claimNotifications.length === 0 ? 'No claim requests at the moment.' : 'No matching claim requests found.' }}
        </div>

        <div v-else class="grid gap-3 mb-6">
          <div
            v-for="claim in filteredClaimRequests"
            :key="claim.claim_id"
            class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-yellow-500 dark:hover:border-yellow-500 transition-colors"
          >
            <div class="flex gap-3">
              <!-- Item Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="((claim.item && claim.item.image_url) || claim.item_image || claim.display_image) && !claim.itemImageError"
                  :src="getFullUrl((claim.item && claim.item.image_url) || claim.item_image || claim.display_image)"
                  @error="claim.itemImageError=true"
                  class="w-20 h-20 object-cover rounded"
                />
                <div v-else class="w-20 h-20 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">No Image</div>
              </div>

              <!-- Item and Claim Details -->
              <div class="flex-1">
                <!-- Item Header -->
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ (claim.item && claim.item.name) || claim.item_name || 'Unknown item' }}</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Item ID: {{ (claim.item && claim.item.id) || claim.item_id || 'N/A' }}</p>
                  </div>
                </div>

                <!-- Item Details Row (moved to top) -->
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-800 mb-2">
                  <div>
                    <span class="text-gray-400">Category:</span>
                    <span class="ml-2">{{ claim.item && claim.item.category ? claim.item.category.toUpperCase() : 'GENERAL' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Item Status:</span>
                    <span class="ml-2">{{ formatStatus((claim.item && claim.item.status) || claim.item_status) }}</span>
                  </div>
                  <div v-if="claim.item && claim.item.student_id">
                    <span class="text-gray-400">Student ID:</span>
                    <span class="ml-2">{{ claim.item.student_id }}</span>
                  </div>
                  <div v-if="claim.item && claim.item.brand">
                    <span class="text-gray-400">Brand:</span>
                    <span class="ml-2">{{ claim.item.brand }}</span>
                  </div>
                  <div v-if="claim.item && claim.item.color">
                    <span class="text-gray-400">Color:</span>
                    <span class="ml-2">{{ claim.item.color }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Date Found:</span>
                    <span class="ml-2">{{ formatDate((claim.item && claim.item.datetime) || claim.created_at) }}</span>
                  </div>
                </div>
                  
                <!-- Claimant info and status badge (moved to bottom) -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-800 mb-2">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="claim.claimant_profile_picture"
                      :src="getFullUrl(claim.claimant_profile_picture)"
                      class="w-7 h-7 rounded-full object-cover border border-yellow-500"
                      @error="claim._claimantImageError = true; $event.target.style.display='none'"
                    />
                    <div v-else class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {{ (claim.claimant_name || 'U')[0].toUpperCase() }}
                    </div>
                    <div class="text-xs">
                      <p class="font-medium text-white">{{ claim.claimant_name || claim.user_name || 'Unknown' }}</p>
                      <p class="text-gray-400">{{ claim.claimant_email || claim.user_email || 'N/A' }}</p>
                    </div>
                  </div>
                  
                  <span
                    :class="{
                      'bg-yellow-500 text-black': claim.status === 'pending',
                      'bg-green-500 text-white': claim.status === 'approved',
                      'bg-red-500 text-white': claim.status === 'rejected'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0"
                  >
                    {{ claim.status ? claim.status.toUpperCase() : 'PENDING' }}
                  </span>
                </div>

                <!-- View Details Button at Bottom Right -->
                <div class="flex justify-between items-center pt-2">
                  <div>
                    <!-- Delete button for rejected claims -->
                    <button
                      v-if="claim.status === 'rejected'"
                      @click="deleteRejectedClaim(claim)"
                      class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium transition"
                      title="Delete rejected claim"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    @click="viewClaimDetails(claim)"
                    class="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-xs font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RETURNED HISTORY -->
      <div v-if="currentPage === 'returned-history'">
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Returned History</h2>
        <!-- ... (unchanged) ... -->
        <div class="mb-4 flex justify-between items-center">
          <input
            v-model="returnedSearch"
            type="text"
            placeholder="Search by Item Name or Student ID"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64 focus:outline-none transition-colors"
          />
          <select
            v-model="returnedCategoryFilter"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors"
          >
            <option value="">All Categories</option>
            <option value="id">ID Items</option>
            <option value="general">General Items</option>
          </select>
        </div>

        <div
          v-if="filteredReturnedHistory.length === 0"
          class="border border-gray-200 dark:border-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-900 mb-6 transition-colors"
        >
          No returned items yet.
        </div>

        <table
          v-else
          class="min-w-full bg-white dark:bg-gray-900 text-left text-sm text-gray-900 dark:text-gray-300 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 transition-colors">
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Category</th>
              <th class="px-4 py-2">Return Date</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Claimed By</th>
              <th class="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredReturnedHistory"
              :key="item.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td class="px-4 py-2">
                <img
                  v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError"
                  :src="`${API_BASE_URL}${item.image_url}`"
                  @error="item.imageError = true"
                  class="w-12 h-12 object-cover rounded"
                />
                <span v-else class="text-gray-500">N/A</span>
              </td>
              <td class="px-4 py-2">{{ item.name }}</td>
              <td class="px-4 py-2">{{ item.category || "General" }}</td>
              <td class="px-4 py-2">{{ formatDate(item.return_date) }}</td>
              <td class="px-4 py-2">{{ formatStatus(item.status) }}</td>
              <td class="px-4 py-2">
                <div class="flex items-center space-x-2">
                  <img
                    v-if="(item.claimant_profile_picture || item.transaction_claimant_profile_picture) && !item.claimantImageError"
                    :src="`${API_BASE_URL}${item.claimant_profile_picture || item.transaction_claimant_profile_picture}`"
                    @error="item.claimantImageError = true"
                    class="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ (item.claimant_name || item.transaction_claimant_name || item.reporter_name) ? (item.claimant_name || item.transaction_claimant_name || item.reporter_name)[0].toUpperCase() : '?' }}
                  </div>
                  <span>{{ item.claimant_name || item.transaction_claimant_name || item.reporter_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="downloadReturnReport(item)"
                    class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    title="Download PDF"
                  >
                    Download PDF
                  </button>
                  <button
                    @click="printReturnReport(item)"
                    class="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-sm"
                    title="Open printable view"
                  >
                    Print Report
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals (unchanged) -->
      <!-- VIEW MODAL, CLAIMS MODAL, REVIEW MODAL, RETURN MODAL -->
      <!-- ... (keep all modals exactly as they were) ... -->

      <!-- VIEW MODAL -->
      <div
        v-if="selectedItem"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <div
          class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-lg transition-colors"
        >
          <h3 class="text-xl font-semibold mb-4">Item Details</h3>
          <img
            v-if="selectedItem.image_url && !imageError"
            :src="`${API_BASE_URL}${selectedItem.image_url}`"
            @error="imageError = true"
            class="w-full h-48 object-cover rounded mb-4"
          />
          <div
            v-else
            class="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded mb-4 text-gray-500 dark:text-gray-400"
          >
            N/A
          </div>
          <div class="space-y-1">
            <div
              v-for="(value, key) in filteredDetails"
              :key="key"
              class="flex justify-between border-b border-gray-200 dark:border-gray-800 py-1"
            >
              <span class="capitalize text-gray-600 dark:text-gray-400">{{ key }}</span>
              <span>{{ value }}</span>
            </div>
          </div>

          <div v-if="selectedItem.reporter_name" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
            <h4 class="text-lg font-medium text-yellow-500 mb-2">Reported By</h4>
            <div class="flex items-center space-x-3 mb-3">
              <img
                v-if="selectedItem.reporter_profile_picture && !reporterImageError"
                :src="`${API_BASE_URL}${selectedItem.reporter_profile_picture}`"
                @error="reporterImageError = true"
                class="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <div
                v-else
                class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold"
              >
                {{ selectedItem.reporter_name[0].toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedItem.reporter_name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedItem.reporter_email }}</p>
              </div>
            </div>
            <button
              @click="viewReporterProfile(selectedItem.reporter_id)"
              class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              View Reporter Profile
            </button>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- CLAIMS MODAL -->
      <div
        v-if="claimModalItem"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
      >
        <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 my-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 transition-colors">
          <h3 class="text-2xl font-semibold mb-6">Claim Requests - {{ claimModalItem.name }}</h3>

          <!-- Main Container: Item Details (Left) + Claims (Right) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            <!-- ITEM DETAILS SECTION (Left Column) -->
            <div class="lg:col-span-1">
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 sticky top-0 transition-colors">
                <h4 class="text-lg font-semibold text-yellow-500 mb-4">Item Details</h4>
                
                <!-- Item Image -->
                <img
                  v-if="claimModalItem.image_url && !claimModalItemImageError"
                  :src="`${API_BASE_URL}${claimModalItem.image_url}`"
                  @error="claimModalItemImageError = true"
                  class="w-full h-48 object-cover rounded mb-4"
                />
                <div v-else class="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded mb-4 text-gray-500 dark:text-gray-400 text-sm">
                  No Image Available
                </div>

                <!-- Item Information -->
                <div class="space-y-3 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Name</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ claimModalItem.name || 'N/A' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Type</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatStatus(claimModalItem.type) || 'N/A' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Category</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ claimModalItem.category || 'General' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Status</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ formatStatus(claimModalItem.status) || 'N/A' }}</p>
                  </div>
                </div>

                <!-- Additional Details -->
                <div v-if="claimModalItem.student_id || claimModalItem.brand || claimModalItem.color" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                  <div v-if="claimModalItem.student_id">
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Student ID</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ claimModalItem.student_id }}</p>
                  </div>
                  <div v-if="claimModalItem.brand">
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Brand</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ claimModalItem.brand }}</p>
                  </div>
                  <div v-if="claimModalItem.color">
                    <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Color</span>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ claimModalItem.color }}</p>
                  </div>
                </div>

                <!-- Item ID -->
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400 text-xs uppercase">Item ID</span>
                  <p class="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">{{ claimModalItem.id || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- CLAIMS SECTION (Right Column - 2 columns wide) -->
            <div class="lg:col-span-2">
              <!-- Claims Count Banner -->
              <div v-if="claimRequests.length > 0" class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/30 rounded text-sm text-yellow-700 dark:text-yellow-300">
                <strong>⚠️ {{ claimRequests.length }} Claim Request{{ claimRequests.length > 1 ? 's' : '' }} for This Item</strong>
              </div>

              <!-- No Claims Message -->
              <div v-if="claimRequests.length === 0" class="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 italic">
                No claims submitted for this item.
              </div>

              <!-- Claims List -->
              <div v-else class="space-y-4 max-h-[500px] overflow-y-auto">
                <div v-for="claim in claimRequests" :key="claim.claim_id" class="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition">
                  
                  <!-- Claimant Header -->
                  <div class="flex items-start gap-3 mb-3">
                    <!-- Claimant Profile Photo -->
                    <div class="flex-shrink-0">
                      <img
                        v-if="claim.claimant_profile_picture && !claim._claimantPhotoError"
                        :src="getFullUrl(claim.claimant_profile_picture)"
                        @error="claim._claimantPhotoError = true"
                        class="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
                      />
                      <div v-else class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-yellow-400 text-sm">
                        {{ (claim.claimant_name || 'U')[0].toUpperCase() }}
                      </div>
                    </div>

                    <!-- Claimant Info -->
                      <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="font-semibold text-gray-900 dark:text-white truncate">{{ claim.claimant_name || 'Unknown claimant' }}</p>
                        <span
                          :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0', claimStatusClass(claim.status)]"
                        >
                          {{ formatClaimStatus(claim.status) }}
                        </span>
                      </div>
                      <p v-if="claim.claimant_email" class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ claim.claimant_email }}</p>
                      <p v-if="claim.claimant_contact" class="text-xs text-gray-600 dark:text-gray-400">{{ claim.claimant_contact }}</p>
                      <p v-if="claim.claimant_department" class="text-xs text-gray-700 dark:text-gray-300">{{ claim.claimant_department }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Requested: {{ formatDate(claim.created_at) }}</p>
                    </div>
                  </div>

                  <!-- Claimant Message -->
                  <div v-if="claim.message" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-700 dark:text-gray-300 border-l-2 border-yellow-400">
                    <strong class="block mb-1">Message:</strong>
                    <p class="whitespace-pre-line">{{ claim.message }}</p>
                  </div>

                  <!-- Action Buttons (Below Message) -->
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="openClaimApprovalReview(claim)"
                      :disabled="claim.status === 'approved' || claim.status === 'rejected'"
                      :class="[
                        'px-3 py-1.5 rounded text-sm transition font-medium',
                        claim.status === 'approved' || claim.status === 'rejected'
                          ? 'bg-green-600 text-white opacity-60 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      ]"
                    >
                      {{ claim.status === 'approved' ? '✓ Approved' : 'Approve' }}
                    </button>
                    <button
                      @click="openClaimRejectionReview(claim)"
                      :disabled="claim.status === 'approved' || claim.status === 'rejected'"
                      :class="[
                        'px-3 py-1.5 rounded text-sm transition font-medium',
                        claim.status === 'approved' || claim.status === 'rejected'
                          ? 'bg-red-600 text-white opacity-60 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      ]"
                    >
                      {{ claim.status === 'rejected' ? '✗ Rejected' : 'Reject' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification details (hidden but still fetched for internal use) -->
          <div v-if="modalNotificationDetails" class="hidden">
            <div class="text-xs text-gray-400 mb-1">Notification</div>
            <div class="flex justify-between items-center">
              <div>
                <div><strong>ID:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.id || '—' }}</span></div>
                <div v-if="modalNotificationDetails.item_id"><strong>Item Ref:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.item_id }}</span></div>
                <div v-if="modalNotificationDetails.matched_item_id"><strong>Matched Item:</strong> <span class="text-sm text-gray-200">{{ modalNotificationDetails.matched_item_id }}</span></div>
              </div>
              <div class="text-xs text-gray-400">(auto-sourced from notification)</div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="mt-6 flex justify-end gap-2">
            <button
              @click="claimModalItem = null; modalNotificationDetails = null"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>

          <!-- DEBUG: raw response (for debugging only) -->
          <div v-if="claimRequests && claimRequests.length >= 0" class="mt-4 text-xs text-gray-500">
            <details>
              <summary class="cursor-pointer text-gray-400">Debug: raw claims JSON</summary>
              <pre class="text-xs text-gray-300 p-2 bg-gray-800 rounded mt-2 overflow-auto" style="max-height:200px">{{ JSON.stringify(claimRequests, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>

      <!-- CLAIM REVIEW MODAL (for confirming approve/reject) -->
      <div
        v-if="showClaimReviewModal && claimReviewData"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        @click.self="closeClaimReviewModal"
      >
        <div class="bg-gray-900 text-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
          <!-- Header -->
          <h2 class="text-2xl font-bold mb-6">
            {{ claimReviewData.action === 'approve' ? 'Review Claim - Approve' : 'Review Claim - Reject' }}
          </h2>

          <!-- Item Information Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-yellow-400 mb-3">Item Information</h3>
            <div class="bg-gray-800 rounded-lg p-4 flex gap-4">
              <!-- Item Image -->
              <div class="flex-shrink-0">
                <img
                  v-if="claimReviewData.claim.item && claimReviewData.claim.item.image_url && !claimReviewItemImageError"
                  :src="getFullUrl(claimReviewData.claim.item.image_url)"
                  @error="claimReviewItemImageError = true"
                  class="w-24 h-24 object-cover rounded"
                />
                <div v-else class="w-24 h-24 rounded bg-gray-700 flex items-center justify-center text-gray-400 text-xs">No Image</div>
              </div>

              <!-- Item Details -->
              <div class="flex-1">
                <p class="text-lg font-semibold text-white">{{ (claimReviewItemSafe && claimReviewItemSafe.name) || claimReviewData.claim.item_name || 'Unknown Item' }}</p>
                  <p class="text-sm text-gray-400 mb-2">ID: {{ (claimReviewItemSafe && claimReviewItemSafe.id) || claimReviewData.claim.item_id || 'N/A' }}</p>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-400">Category:</span>
                    <p class="text-white font-medium">{{ (claimReviewItemSafe && claimReviewItemSafe.category) || 'General' }}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Status:</span>
                    <p class="text-white font-medium">{{ formatStatus((claimReviewItemSafe && claimReviewItemSafe.status) || '') }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.student_id">
                    <span class="text-gray-400">Student ID:</span>
                    <p class="text-white font-medium">{{ claimReviewData.claim.item.student_id }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.brand">
                    <span class="text-gray-400">Brand:</span>
                    <p class="text-white font-medium">{{ claimReviewData.claim.item.brand }}</p>
                  </div>
                  <div v-if="claimReviewItemSafe && claimReviewItemSafe.color">
                    <span class="text-gray-400">Color:</span>
                    <p class="text-white font-medium">{{ claimReviewData.claim.item.color }}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Date Found:</span>
                    <p class="text-white font-medium">{{ formatDate((claimReviewItemSafe && claimReviewItemSafe.datetime) || claimReviewData.claim.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-700 my-6"></div>

          <!-- Claimant Information Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-green-400 mb-3">Claimant Information</h3>
            <div class="bg-gray-800 rounded-lg p-4 flex gap-4">
              <!-- Claimant Profile Picture -->
              <div class="flex-shrink-0">
                <img
                  v-if="claimReviewData.claim.claimant_profile_picture"
                  :src="getFullUrl(claimReviewData.claim.claimant_profile_picture)"
                  class="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                />
                <div v-else class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {{ (claimReviewData.claim.claimant_name || 'U')[0].toUpperCase() }}
                </div>
              </div>

              <!-- Claimant Details -->
              <div class="flex-1">
                <p class="text-lg font-semibold text-white">{{ claimReviewData.claim.claimant_name || claimReviewData.claim.user_name || 'Unknown' }}</p>
                <p class="text-sm text-gray-400">{{ claimReviewData.claim.claimant_email || claimReviewData.claim.user_email || 'N/A' }}</p>
                
                <div class="mt-3 space-y-1 text-sm">
                  <div v-if="claimReviewData.claim.claimant_contact">
                    <span class="text-gray-400">Contact:</span>
                    <p class="text-white font-medium">{{ claimReviewData.claim.claimant_contact }}</p>
                  </div>
                  <div v-if="claimReviewData.claim.claimant_department">
                    <span class="text-gray-400">Department:</span>
                    <p class="text-white font-medium">{{ claimReviewData.claim.claimant_department }}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Requested:</span>
                    <p class="text-white font-medium">{{ formatDate(claimReviewData.claim.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Claim Message Section -->
          <div v-if="claimReviewData.claim.message" class="mb-6">
            <h3 class="text-lg font-semibold text-blue-400 mb-2">Claimant's Message</h3>
            <div class="bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500 text-sm text-gray-300">
              {{ claimReviewData.claim.message }}
            </div>
          </div>

          <!-- Confirmation/Warning Messages -->
          <div class="mb-6 p-4 rounded-lg" :class="claimReviewData.action === 'approve' ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'">
            <p v-if="claimReviewData.action === 'approve'" class="text-green-300 text-sm">
              <strong>✓ Approval Confirmation:</strong> By confirming this, you approve that the item is returned to the rightful owner. The claimant will be notified of the approval.
            </p>
            <p v-else class="text-red-300 text-sm">
              <strong>✗ Rejection Notice:</strong> By confirming this, the claim request will be rejected. The claim status will remain pending and the claimant will be notified of the rejection.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-end pt-4 border-t border-gray-700">
            <button
              @click="closeClaimReviewModal"
              class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              v-if="claimReviewData.action === 'approve'"
              @click="confirmClaimApproval(claimReviewData.claim)"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              ✓ Confirm Approve
            </button>
            <button
              v-else
              @click="confirmClaimRejection(claimReviewData.claim)"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              ✗ Confirm Reject
            </button>
          </div>
        </div>
      </div>

      <!-- REVIEW MODAL (shows same details as VIEW MODAL plus confirm controls) -->
      <div
        v-if="reviewItem"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-900 text-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto border border-gray-700 shadow-lg">
          <h3 class="text-xl font-semibold mb-4">Confirm Item Received</h3>

          <img
            v-if="reviewItem.image_url && !imageError"
            :src="`${API_BASE_URL}${reviewItem.image_url}`"
            @error="imageError = true"
            class="w-full h-48 object-cover rounded mb-4"
          />
          <div v-else class="w-full h-48 bg-gray-800 flex items-center justify-center rounded mb-4 text-gray-500">N/A</div>

          <div class="space-y-1">
            <div v-for="(value, key) in (reviewItem ? Object.fromEntries(Object.entries(reviewItem).filter(([k,v]) => v && !['id','image_url','created_at','imageError','reporter_id','reporter_name','reporter_email','reporter_profile_picture','reporterImageError'].includes(k))) : {})" :key="key" class="flex justify-between border-b border-gray-800 py-1">
              <span class="capitalize text-gray-400">{{ key }}</span>
              <span>{{ value }}</span>
            </div>
          </div>

          <div v-if="reviewItem.reporter_name" class="mt-4 pt-3 border-t border-gray-800">
            <h4 class="text-lg font-medium text-yellow-400 mb-2">Reported By</h4>
            <div class="flex items-center space-x-3 mb-3">
              <img
                v-if="reviewItem.reporter_profile_picture && !reporterImageError"
                :src="`${API_BASE_URL}${reviewItem.reporter_profile_picture}`"
                @error="reporterImageError = true"
                class="w-10 h-10 rounded-full object-cover border border-gray-600"
              />
              <div v-else class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {{ reviewItem.reporter_name[0].toUpperCase() }}
              </div>
              <div>
                <p class="font-medium">{{ reviewItem.reporter_name }}</p>
                <p class="text-sm text-gray-400">{{ reviewItem.reporter_email }}</p>
              </div>
            </div>
            <button @click="viewReporterProfile(reviewItem.reporter_id)" class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">View Reporter Profile</button>
          </div>

          <div class="mt-6 flex justify-end space-x-2">
            <button @click="closeReviewModal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
            <button @click="confirmReceived" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Confirm Received</button>
          </div>
        </div>
      </div>

      <!-- RETURN MODAL -->
      <div
        v-if="returnItem"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-gray-900 text-white rounded-lg p-6 w-96 border border-gray-700">
          <h3 class="text-xl font-semibold mb-4">Return Item to Owner</h3>
          <p><strong>Name:</strong> {{ returnItem.name }}</p>
          <p><strong>Category:</strong> {{ returnItem.category || "General" }}</p>
          <p><strong>Status:</strong> {{ formatStatus(returnItem.status) }}</p>
          <p class="mt-4 text-yellow-400 text-sm">
            ⚠️ This item will be officially marked as
            <strong>returned to the owner</strong>.
          </p>

          <div class="mt-6 flex justify-end space-x-2">
            <button
              @click="returnItem = null"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              @click="confirmReturn"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
      <!-- Quick Actions / Help Modal (frontend-only) -->
      <div v-if="showHelpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-gray-900 text-white rounded-lg p-6 w-96 border border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold">Quick Actions</h3>
            <button @click.stop="toggleHelpModal" class="text-gray-400 hover:text-white">✕</button>
          </div>
          <p class="text-sm text-gray-300 mb-3">This is a frontend-only modal placeholder for quick actions or help. Wire real actions here later.</p>
          <div class="space-y-2">
            <button class="w-full px-3 py-2 bg-yellow-500 text-black rounded">Open Claims Panel</button>
            <button class="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700">View Notifications</button>
            <button class="w-full px-3 py-2 bg-gray-700 text-white rounded">Other Action</button>
          </div>
          <div class="flex justify-end mt-4">
            <button @click.stop="toggleHelpModal" class="px-3 py-1 bg-gray-600 rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import initSocket, { disconnectSocket } from "../socket";
import SecuritySidebar from "../components/SecuritySidebar.vue";

const API_BASE_URL = "http://localhost:5000";
const router = useRouter();

const socket = initSocket();

// Page-based navigation instead of tabs
const currentPage = ref(localStorage.getItem('security-current-page') || 'dashboard');
watch(currentPage, (newPage) => {
  localStorage.setItem('security-current-page', newPage);
});

const handleSidebarSelect = (page) => {
  currentPage.value = page;
  
  // 🔄 Fetch claims from database when navigating to claim-requests page
  if (page === 'claim-requests') {
    console.log("📋 Navigating to claim-requests, fetching from database...");
    fetchClaimsFromDatabase();
  }
};

const lostItems = ref([]);
const foundItems = ref([]);
const returnedHistory = ref([]);

// Search / Filter state
const lostSearch = ref("");
const lostCategoryFilter = ref("");
const foundSearch = ref("");
const foundStatusFilter = ref("");
const foundCategoryFilter = ref("");
const returnedSearch = ref("");
const returnedCategoryFilter = ref("");
const claimsSearch = ref("");
const claimsStatusFilter = ref("");
const claimsCategoryFilter = ref("");

// Modal and UI state
const claimModalItem = ref(null);
const claimModalItemImageError = ref(false);
const selectedItem = ref(null);
const reviewItem = ref(null);
const returnItem = ref(null);
const imageError = ref(false);
const reporterImageError = ref(false);
const newItemIds = ref([]);
// Quick actions modal (frontend only)
const showHelpModal = ref(false);
const toggleHelpModal = () => { showHelpModal.value = !showHelpModal.value; };

// Review modal for claim approval/rejection
const showClaimReviewModal = ref(false);
const claimReviewData = ref(null); // Will hold { claim, action: 'approve' | 'reject' }

// Safe accessor for the item inside claimReviewData to avoid optional-chaining in template
const claimReviewItemSafe = computed(() => {
  const data = claimReviewData.value;
  if (!data) return null;
  const c = data.claim || null;
  if (!c) return null;
  return c.item || null;
});
const claimReviewItemImageError = ref(false);


// Unread counters
const unreadLostCount = ref(0);
const unreadFoundCount = ref(0);
const unreadReturnedCount = ref(0);

const securityUser = ref(null);
const showProfileMenu = ref(false);
const profileMenuRef = ref(null);

const securityDisplayName = computed(() => {
  if (!securityUser.value) return "Security Staff";
  return (
    securityUser.value.full_name ||
    securityUser.value.email?.split("@")[0] ||
    "Security Staff"
  );
});

const securityDisplayEmail = computed(
  () => securityUser.value?.email || "security@example.com"
);

const securityAvatar = computed(() => {
  const path = securityUser.value?.profile_picture;
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
});

const securityInitial = computed(() => securityDisplayName.value.charAt(0).toUpperCase());

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

// Sidebar badge should reflect unseen notifications only
const sidebarPendingCount = computed(() => {
  return !notificationsSeen.value && claimNotifications.value.length > 0
    ? claimNotifications.value.length
    : 0;
});

const handleProfileMenuOutside = (event) => {
  if (!profileMenuRef.value) return;
  if (!profileMenuRef.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const handleNotificationsOutside = (event) => {
  if (!notificationsRef.value) return;
  if (!notificationsRef.value.contains(event.target)) {
    showNotificationsDropdown.value = false;
  }
};

const goToProfile = () => {
  showProfileMenu.value = false;
  router.push("/profile");
};

// Fetch items from backend and populate lists
const fetchItems = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items`);
    const data = Array.isArray(res.data) ? res.data.map(i => ({ ...i, imageError: false, reporterImageError: false })) : [];
    // Normalize return_date for returned items so UI shows a timestamp instead of N/A
    for (const item of data) {
      if ((item.status || '').toString().toLowerCase() === 'returned') {
        if (!item.return_date) {
          // Accept different server naming or fallback to available timestamps
          item.return_date = item.return_date || item.returnDate || item.updated_at || item.datetime || item.created_at || null;
          if (!item.return_date) {
            // As a last resort, set to now so UI doesn't show N/A
            item.return_date = new Date().toISOString();
          }
        }
      }
    }
    lostItems.value = data.filter(i => i.type === "lost");
    foundItems.value = data.filter(i => i.type === "found" && i.status !== "returned");
    returnedHistory.value = data.filter(i => i.status === "returned");

    // Populate claimant display fields for returned items when possible
    for (const it of returnedHistory.value) {
      // Normalize missing return_date
      if (!it.return_date) it.return_date = it.returnDate || it.updated_at || it.datetime || it.created_at || new Date().toISOString();
      // fetch claimant profile if claimant_id present
      await ensureClaimantForItem(it);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
  }
};

const formatDate = (datetime) => {
  if (!datetime) return "N/A";
  const parsed = new Date(datetime);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatStatus = (status) =>
  (status || "").split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const formatClaimStatus = (status) => {
  const safe = (status ? String(status) : "pending")
    .replace(/\s+/g, "_")
    .toLowerCase();

  return safe
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Pending";
};

const claimStatusClass = (status) => {
  const normalized = (status || "pending").toString().toLowerCase();
  switch (normalized) {
    case "approved":
      return "bg-green-500/20 border-green-500/40 text-green-300";
    case "rejected":
      return "bg-red-500/20 border-red-500/40 text-red-300";
    default:
      return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";
  }
};

// 🔸 NEW: Pending claims counter
const pendingClaimsCount = ref(0);

const claimRequests = ref([]);
const modalNotificationDetails = ref(null);

// Database claims are now fetched directly from the server (not from localStorage)
// This ensures we always have the authoritative state from the claims table
const dbClaimRequests = ref([]);
let dbClaimsRefreshInterval = null;

// Fetch all claim requests directly from the database
const fetchClaimsFromDatabase = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const allClaims = Array.isArray(res.data) ? res.data : [];
    console.log("📊 Fetched claims from database:", allClaims.length, "claims");
    
    // Normalize and enrich each claim with item data
    const normalizedClaims = await Promise.all(
      allClaims.map(async (rawClaim) => {
        const normalized = normalizeClaim(rawClaim);
        
        // Try to fetch full item data for enrichment
        try {
          const itemId = normalized.claimed_item_id || normalized.item_id;
          if (itemId) {
            const itemRes = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(itemId)}`);
            if (itemRes.data) {
              normalized.item = itemRes.data;
              normalized.item_name = itemRes.data.name;
              normalized.item_image = itemRes.data.image_url;
              normalized.item_category = itemRes.data.category;
              normalized.item_status = itemRes.data.status;
            }
          }
        } catch (err) {
          console.debug(`Could not fetch item data for claim ${normalized.claim_id}:`, err.message);
        }
        
        return normalized;
      })
    );
    
    dbClaimRequests.value = normalizedClaims;
    return normalizedClaims;
  } catch (err) {
    console.error("Failed to fetch claims from database:", err);
    return [];
  }
};

// Persistent claim requests store (DEPRECATED - keeping for backward compatibility only)
const loadClaimRequestsFromStorage = () => {
  try {
    const stored = localStorage.getItem('claimRequestsStore');
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load claim requests store from storage:', err);
  }
  return [];
};

const claimRequestsStore = ref(loadClaimRequestsFromStorage());

// Persist claimRequestsStore to localStorage (DEPRECATED)
watch(claimRequestsStore, (newVal) => {
  try {
    localStorage.setItem('claimRequestsStore', JSON.stringify(newVal));
  } catch (err) {
    console.error('Failed to save claim requests store to localStorage:', err);
  }
}, { deep: true });

// Notifications dropdown state (shows claim requests for items in security custody)
const showNotificationsDropdown = ref(false);
const notificationsRef = ref(null);

// Load claimNotifications from localStorage to persist across page refreshes
const loadClaimNotificationsFromStorage = () => {
  try {
    const stored = localStorage.getItem('claimNotifications');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load claim notifications from storage:', err);
  }
  return [];
};

const claimNotifications = ref(loadClaimNotificationsFromStorage());

// Watch claimNotifications to persist any changes to localStorage
watch(claimNotifications, (newNotifications) => {
  try {
    localStorage.setItem('claimNotifications', JSON.stringify(newNotifications));
  } catch (err) {
    console.error('Failed to save claim notifications to localStorage:', err);
  }
}, { deep: true });

// 🔄 Periodic sync interval (failsafe for missed socket events)
let claimSyncInterval = null;
// separate interval for item (reports) sync when needed
let itemSyncInterval = null;

// Load processedClaimIds from localStorage to prevent reprocessing claims after refresh
const loadProcessedClaimIds = () => {
  try {
    const stored = localStorage.getItem('processedClaimIds');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (err) {
    console.error('Failed to load processed claim IDs from storage:', err);
  }
  return new Set();
};

let processedClaimIds = loadProcessedClaimIds();

// Whether the user has opened the notification bell and seen current items
const notificationsSeen = ref(false);

// Helper to save processedClaimIds to localStorage
const saveProcessedClaimIds = () => {
  try {
    localStorage.setItem('processedClaimIds', JSON.stringify(Array.from(processedClaimIds)));
  } catch (err) {
    console.error('Failed to save processed claim IDs to storage:', err);
  }
};

const toggleNotifications = () => {
  showNotificationsDropdown.value = !showNotificationsDropdown.value;
  if (showNotificationsDropdown.value) {
    // when opening, mark notifications as seen so the badge hides
    notificationsSeen.value = true;
    // also clear pending badge count locally (backend authoritative count remains)
    pendingClaimsCount.value = 0;
  }
};

const clearAllNotifications = () => {
  claimNotifications.value = [];
  pendingClaimsCount.value = 0;
  notificationsSeen.value = true;
  showNotificationsDropdown.value = false;
};

// 🔄 Periodic sync: Check for new claims (OPTIMIZED: longer interval, only when needed)
// Track claim IDs we've seen to prevent re-processing
let isSyncing = false;

const syncPendingClaims = async () => {
  // Prevent concurrent syncs
  if (isSyncing) {
    console.debug("🔄 [Sync] Already syncing, skipping...");
    return;
  }
  
  try {
    isSyncing = true;
    const res = await axios.get(`${API_BASE_URL}/api/claims/pending/count`);
    const newCount = res.data?.pending_count || 0;
    
    // Only fetch claims if the count actually increased (indicates new claims)
    if (newCount > pendingClaimsCount.value) {
      console.log(`🔄 [Sync] New claims detected: ${newCount} (was ${pendingClaimsCount.value})`);
      
      try {
        const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
        const allClaims = Array.isArray(allRes.data) ? allRes.data : [];
        
        let newClaimsAdded = 0;
        
        // Check for claims we haven't added to notifications yet
        for (const claim of allClaims) {
          const normalized = normalizeClaim(claim);
          const claimId = normalized.claim_id;
          const claimantId = normalized.user_id || normalized.claimant_id;
          const itemId = normalized.claimed_item_id || normalized.item_id;
          
          // 🔒 Skip if we've already processed this claim_id
          if (processedClaimIds.has(claimId)) {
            continue;
          }
          
          // 🔒 Check for duplicates: don't add if we already have this exact claim
          const alreadyExists = claimNotifications.value.some((n) => {
            const existingClaimantId = n.user_id || n.claimant_id;
            const existingItemId = n.claimed_item_id || n.item_id;
            return String(existingClaimantId) === String(claimantId) && 
                   String(existingItemId) === String(itemId);
          });
          
          if (!alreadyExists && normalized.status === 'pending') {
            console.log(`🔄 [Sync] Adding missing claim: claimant=${claimantId}, item=${itemId}`);
            await addClaimNotification(normalized);
            processedClaimIds.add(claimId);
            saveProcessedClaimIds();
            newClaimsAdded++;
          } else if (alreadyExists) {
            // Mark as processed even if duplicate (to avoid re-checking)
            processedClaimIds.add(claimId);
            saveProcessedClaimIds();
          }
        }
        
        if (newClaimsAdded === 0 && newCount > 0) {
          console.log(`🔄 [Sync] No new claims to add (all claims already in notifications)`);
        }
      } catch (err) {
        console.error("Failed to fetch all claims during sync:", err);
      }
    } else if (newCount < pendingClaimsCount.value) {
      // Count decreased (claims approved/rejected), clear processed set to allow re-sync if needed
      console.log(`🔄 [Sync] Claims were processed, resetting cache (${newCount} pending now)`);
      processedClaimIds.clear();
      saveProcessedClaimIds();
      // Reconcile persistent claim store with authoritative server state to remove stale entries
      try {
        await reconcileClaimRequestsStoreWithServer();
      } catch (reconErr) {
        console.warn('⚠️ Reconciliation with server failed:', reconErr);
      }
    }
    
    pendingClaimsCount.value = newCount;
  } catch (err) {
    console.error("❌ [Sync] Error fetching pending claims count:", err);
  } finally {
    isSyncing = false;
  }
};

const fetchItemById = async (id) => {
  if (!id) return null;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`);
    return res.data || null;
  } catch (err) {
    // If endpoint doesn't exist or fails, ignore silently
    return null;
  }
};

// Fetch user/profile by id (used to populate claimant info)
const fetchProfileById = async (id) => {
  if (!id) return null;
  try {
    const res = await axios.get(`${API_BASE_URL}/api/profile/${encodeURIComponent(id)}`);
    return res.data || null;
  } catch (err) {
    // ignore - profile may not exist or endpoint unavailable
    return null;
  }
};

// Ensure an item object has claimant display fields by fetching profile when claimant_id exists
const ensureClaimantForItem = async (item) => {
  if (!item) return;
  try {
    // Prefer explicit claimant fields already present
    if (item.claimant_name || item.transaction_claimant_name) return;

    const claimantId = item.claimant_id || item.transaction_claimant_id || null;
    if (!claimantId) return;

    const profile = await fetchProfileById(claimantId);
    if (profile) {
      // Attach claimant fields expected by templates
      item.claimant_name = profile.full_name || profile.name || profile.display_name || item.claimant_name;
      item.claimant_profile_picture = profile.profile_picture || profile.avatar || item.claimant_profile_picture;
      item.claimant_email = profile.email || item.claimant_email;
      item.claimant_contact = profile.contact || profile.phone || item.claimant_contact;
    }
  } catch (e) {
    // swallow errors - non-critical UI enhancement
    console.warn('ensureClaimantForItem error', e);
  }
};

// Reconcile the persistent claimRequestsStore with server state.
// Removes any entries whose claim_id (or id) no longer exists on the server.
const reconcileClaimRequestsStoreWithServer = async () => {
  try {
    const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const allClaims = Array.isArray(allRes.data) ? allRes.data : [];
    const serverIds = new Set(allClaims.map((c) => String(c.id || c.claim_id)));

    const before = claimRequestsStore.value.length;

    claimRequestsStore.value = claimRequestsStore.value.filter((c) => {
      const id = c.claim_id || c.id || null;
      // If claim has no server id, keep it (can't reconcile); otherwise keep only if present on server
      if (!id) return true;
      return serverIds.has(String(id));
    });

    const after = claimRequestsStore.value.length;
    if (after !== before) {
      console.log(`🔁 Reconciled claimRequestsStore with server: removed ${before - after} stale entries`);
    }
  } catch (err) {
    console.warn('⚠️ Failed to reconcile claimRequestsStore with server:', err);
    throw err;
  }
};

// Build a full URL for images: if path is absolute keep it, otherwise prefix API base
const getFullUrl = (path) => {
  if (!path) return "";
  try {
    const s = String(path);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `${API_BASE_URL}${s}`;
  } catch (e) {
    return "";
  }
};

// Generate a PDF return report for a returned item. Tries to use jsPDF if available,
// otherwise falls back to opening a printable HTML view that the user can save as PDF.
const generateReturnReport = async (item, { download = true } = {}) => {
  if (!item) return;

  const universityName = 'Caraga State University';
  const officeName = 'Security Office';
  const reportDate = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

  const itemDescParts = [];
  if (item.category) itemDescParts.push(item.category);
  if (item.brand) itemDescParts.push(item.brand);
  if (item.color) itemDescParts.push(item.color);
  if (item.condition) itemDescParts.push(item.condition);
  const itemDescription = itemDescParts.length ? itemDescParts.join(', ') : (item.name || 'N/A');

  const foundLocation = item.location || item.found_location || 'N/A';
  const serial = item.serial_number || item.student_id || item.item_serial || 'N/A';
  const returnDate = item.return_date || new Date().toISOString();

  const claimantName = item.claimant_name || item.transaction_claimant_name || item.reporter_name || 'N/A';
  const claimantEmail = item.claimant_email || item.transaction_claimant_email || 'N/A';
  const claimantPhone = item.claimant_contact || item.transaction_claimant_contact || 'N/A';

  const verificationDate = returnDate;
  const verificationOfficer = securityDisplayName.value || 'Security Officer';
  const returnMethod = item.return_method || 'In-person pickup';
  const itemConditionOnReturn = item.condition || 'N/A';

  // Try to use jsPDF + autotable if available in node_modules
  try {
    const jsPDFModule = await import('jspdf');
    const { jsPDF } = jsPDFModule;
    // Import autotable plugin which augments jsPDF with `autoTable`
    try { await import('jspdf-autotable'); } catch (e) { /* ignore if not present */ }

    const doc = new jsPDF();
    let y = 14;
    doc.setFontSize(16);
    doc.text(`${universityName} - ${officeName}`, 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.text('CSU Lost and Found Item Return Report', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Date of Report: ${reportDate}`, 14, y);

    y += 8;

    // Build table rows for the report
    const rows = [
      ['Item Description', itemDescription],
      ['Found Location', foundLocation],
      ['Serial / Student ID', serial],
      ['Return Date', formatDate(returnDate)],
      ['Claimant Name', claimantName],
      ['Claimant Email', claimantEmail],
      ['Claimant Phone', claimantPhone],
      ['Claim Verification Date', formatDate(verificationDate)],
      ['Verification Officer', verificationOfficer],
      ['Return Method', returnMethod],
      ['Condition on Return', itemConditionOnReturn]
    ];

    // Use autoTable if available for nicer layout
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: y,
        head: [['Field', 'Value']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + (rows.length * 6) + 8;
    } else {
      // Fallback plain text rendering
      doc.setFontSize(12);
      doc.text('Item Return Details', 14, y);
      y += 8;
      doc.setFontSize(10);
      rows.forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, 14, y);
        y += 6;
        if (y > 270) { doc.addPage(); y = 14; }
      });
    }
    y += 10;

    doc.setFontSize(12);
    doc.text('Claimant Information', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Claimant Name: ${claimantName}`, 14, y);
    y += 6;
    doc.text(`Claimant Email: ${claimantEmail}`, 14, y);
    y += 6;
    doc.text(`Claimant Phone Number: ${claimantPhone}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Verification and Return Process', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Claim Verification Date: ${formatDate(verificationDate)}`, 14, y);
    y += 6;
    doc.text(`Verification Officer: ${verificationOfficer}`, 14, y);
    y += 6;
    doc.text(`Return Method: ${returnMethod}`, 14, y);
    y += 6;
    doc.text(`Item Condition on Return: ${itemConditionOnReturn}`, 14, y);
    y += 10;

    doc.text('Report Prepared By:', 14, y);
    y += 6;
    doc.text(`${verificationOfficer}`, 14, y);
    y += 6;
    doc.text(`${securityDisplayEmail.value}`, 14, y);

    const filename = `CSU_Return_Report_${(item.name || item.id || 'item').toString().replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    if (download) {
      doc.save(filename);
      return;
    } else {
      // Open PDF in new tab for preview (no immediate download)
      try {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        return;
      } catch (e) {
        // fallback to save if preview fails
        doc.save(filename);
        return;
      }
    }
  } catch (err) {
    console.warn('jsPDF not available or error generating PDF, falling back to printable HTML', err);
  }

  // Fallback: open printable HTML view in new window
  try {
    const printScript = download ? '' : 'window.print()';
    const html = `
      <html><head><title>Return Report</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} h1,h2{color:#222}</style>
      </head><body>
      <h1>${universityName} - ${officeName}</h1>
      <h2>CSU Lost and Found Item Return Report</h2>
      <p><strong>Date of Report:</strong> ${reportDate}</p>
      <h3>Item Return Details</h3>
      <p><strong>Item Description:</strong> ${itemDescription}</p>
      <p><strong>Item Found Location:</strong> ${foundLocation}</p>
      <p><strong>Item Serial Number (if applicable):</strong> ${serial}</p>
      <p><strong>Return Date:</strong> ${formatDate(returnDate)}</p>
      <h3>Claimant Information</h3>
      <p><strong>Claimant Name:</strong> ${claimantName}</p>
      <p><strong>Claimant Email:</strong> ${claimantEmail}</p>
      <p><strong>Claimant Phone Number:</strong> ${claimantPhone}</p>
      <h3>Verification and Return Process</h3>
      <p><strong>Claim Verification Date:</strong> ${formatDate(verificationDate)}</p>
      <p><strong>Verification Officer:</strong> ${verificationOfficer}</p>
      <p><strong>Return Method:</strong> ${returnMethod}</p>
      <p><strong>Item Condition on Return:</strong> ${itemConditionOnReturn}</p>
      <h3>Report Prepared By:</h3>
      <p>${verificationOfficer}<br/>${securityDisplayEmail.value}</p>
      <script>${printScript}</" + "script>
      </body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    } else {
      alert('Unable to open report window. Please allow popups or try again.');
    }
  } catch (e) {
    console.error('Fallback print failed', e);
    alert('Failed to generate report.');
  }
};

// (Removed unused viewGeneratedReport wrapper — use `printReturnReport` or `downloadReturnReport`)

// Download PDF version of the return report (if jsPDF available this will auto-download)
const downloadReturnReport = async (item) => {
  if (!item) return;
  await ensureClaimantForItem(item).catch(() => {});
  await generateReturnReport(item, { download: true });
};

// Open printable view (preview) of the return report
const printReturnReport = async (item) => {
  if (!item) return;
  await ensureClaimantForItem(item).catch(() => {});
  await generateReturnReport(item, { download: false });
};

const addClaimNotification = async (rawClaim) => {
  try {
    const note = normalizeClaim(rawClaim);

    // Provide display helpers if backend included image/name fields directly
    note.display_image = note.display_image || rawClaim.item_image || rawClaim.display_image || (rawClaim.item && rawClaim.item.image_url) || null;
    note.display_name = note.display_name || rawClaim.item_name || rawClaim.display_name || (rawClaim.item && rawClaim.item.name) || null;

    // 🔒 Check for duplicate: same claimant (user_id) for same item
    const itemId = note.claimed_item_id || note.item_id || note.notification_item_id;
    const claimantId = note.user_id || note.claimant_id;
    
    const isDuplicate = claimNotifications.value.some(existing => {
      const existingItemId = existing.claimed_item_id || existing.item_id || existing.notification_item_id;
      const existingClaimantId = existing.user_id || existing.claimant_id;
      return String(existingItemId) === String(itemId) && String(existingClaimantId) === String(claimantId);
    });
    
    if (isDuplicate) {
      console.warn(`🔒 [Frontend] Duplicate claim blocked: claimant ${claimantId} already claimed item ${itemId}`);
      return;
    }

    // Attempt to find the item in local lists
    let item = null;
    const id = note.claimed_item_id || note.item_id || note.notification_item_id || (note.related_item_ids && note.related_item_ids[0]);
    if (id) {
      item = foundItems.value.find((i) => String(i.id) === String(id)) ||
             lostItems.value.find((i) => String(i.id) === String(id)) ||
             returnedHistory.value.find((i) => String(i.id) === String(id));
    }

    // If item not found locally, try to fetch it
    if (!item && id) {
      const fetched = await fetchItemById(id);
      if (fetched) item = fetched;
    }

    // Show claim notifications for all items (regardless of status)
    // This ensures claims are visible as soon as they're submitted
    note.item = item;
    note.itemImageError = false;

  // keep notification-related fields if present on payload
  note.notification = note.notification || {};
  if (rawClaim.notification_id) note.notification.id = rawClaim.notification_id;
  if (rawClaim.notification_item_id) note.notification.item_id = rawClaim.notification_item_id;
  if (rawClaim.notification_matched_item_id) note.notification.matched_item_id = rawClaim.notification_matched_item_id;
  if (rawClaim.match_id) note.notification.match_id = rawClaim.match_id;

    // Optionally fetch claimant profile picture if user id present (best-effort)
    if (note.user_id && !note.claimant_profile_picture) {
      try {
        const u = await axios.get(`${API_BASE_URL}/api/users/${encodeURIComponent(note.user_id)}`);
        if (u?.data?.profile_picture) note.claimant_profile_picture = u.data.profile_picture;
      } catch (e) {
        void e;
      }
    }

  // prepend so newest appear at top
  claimNotifications.value.unshift(note);
  // mark as unseen so the bell shows the badge for this new notification
  notificationsSeen.value = false;
    // Also save to persistent claim requests store so clearing the bell
    // notifications doesn't remove the authoritative list shown in the
    // Claim Requests page.
    try {
      const itemId = note.claimed_item_id || note.item_id || note.notification_item_id;
      const claimantId = note.user_id || note.claimant_id;
      const duplicateInStore = claimRequestsStore.value.some(existing => {
        const existingItemId = existing.claimed_item_id || existing.item_id || existing.notification_item_id;
        const existingClaimantId = existing.user_id || existing.claimant_id;
        return String(existingItemId) === String(itemId) && String(existingClaimantId) === String(claimantId);
      });
      if (!duplicateInStore) {
        claimRequestsStore.value.unshift(note);
      }
    } catch (e) {
      console.error('Failed to update claimRequestsStore:', e);
    }

    // ⚠️ Don't increment pendingClaimsCount here - it's managed by syncPendingClaims and backend count
    // Incrementing here causes the badge to show wrong numbers during periodic syncs
    console.log(`✅ [Frontend] Claim notification added: claimant=${claimantId}, item=${itemId}`);
  } catch (e) {
    console.error('Failed to add claim notification', e);
  }
};

const openRequestFromNotification = async (note) => {
  try {
    const id = note.claimed_item_id || note.item?.id || note.item_id || (note.related_item_ids && note.related_item_ids[0]);
    let item = note.item;
    if (!item && id) item = await fetchItemById(id);
    if (!item) {
      alert('Item details not available.');
      return;
    }

    // set modal notification details so the modal can render notification info
    modalNotificationDetails.value = note.notification || {
      id: note.notification_id || note.notification?.id || null,
      item_id: note.notification_item_id || note.item?.id || null,
      matched_item_id: note.notification_matched_item_id || null,
    };

    // open the claims modal for this item (this will fetch claims)
    await openClaimsModal(item);
    claimModalItem.value = item;
    // close dropdown
    // remove this notification from the bell (but keep it in the persistent store)
    try {
      const idx = claimNotifications.value.findIndex(n => (n.claim_id || n.id) === (note.claim_id || note.id));
      if (idx !== -1) {
        claimNotifications.value.splice(idx, 1);
      }
      // if no more notifications, mark as seen so the badge hides
      if (claimNotifications.value.length === 0) notificationsSeen.value = true;
    } catch (e) {
      console.warn('Failed to remove notification from bell after opening:', e);
    }
    showNotificationsDropdown.value = false;
  } catch (e) {
    console.error('Failed to open request from notification', e);
    alert('Failed to open request.');
  }
};

const normalizeClaim = (raw = {}) => {
  const normalized = { ...raw };

  normalized.claim_id =
    raw.claim_id || raw.id || raw.claimId || normalized.claim_id || null;
  normalized.user_id =
    raw.user_id || raw.claimant_id || raw.userId || normalized.user_id || null;
  normalized.notification_id =
    raw.notification_id || raw.notificationId || normalized.notification_id || null;

  const timestamp =
    raw.created_at ||
    raw.requested_at ||
    raw.createdAt ||
    raw.requestedAt ||
    normalized.created_at ||
    normalized.requested_at ||
    null;
  normalized.created_at = timestamp || new Date().toISOString();

  normalized.status = raw.status || raw.user_claim_status || normalized.status || "pending";

  normalized.message =
    raw.claimant_message ??
    raw.message ??
    raw.claimantMessage ??
    raw.notes ??
    normalized.message ??
    null;

  normalized.claimant_name =
    raw.claimant_name ||
    raw.user_name ||
    raw.claimant_full_name ||
    raw.full_name ||
    raw.name ||
    normalized.claimant_name ||
    "Unknown claimant";

  normalized.claimant_email =
    raw.claimant_email || raw.user_email || raw.email || normalized.claimant_email || null;

  normalized.claimant_contact =
    raw.claimant_contact ||
    raw.user_contact ||
    raw.contact_number ||
    raw.contact ||
    normalized.claimant_contact ||
    null;

  normalized.claimant_department =
    raw.claimant_department ||
    raw.department ||
    raw.user_department ||
    normalized.claimant_department ||
    null;

  normalized.claimant_profile_picture =
    raw.claimant_profile_picture ||
    raw.profile_picture ||
    raw.user_profile_picture ||
    raw.profilePicture ||
    normalized.claimant_profile_picture ||
    null;

  normalized.claimed_item_id =
    raw.claimed_item_id || raw.item_id || raw.itemId || normalized.claimed_item_id || null;

  const relatedCandidates = [
    normalized.claimed_item_id,
    raw.lost_item_id || raw.lostItemId,
    raw.found_item_id || raw.foundItemId,
    raw.notification_item_id || raw.notificationItemId,
    raw.notification_matched_item_id || raw.notificationMatchedItemId,
  ].filter(Boolean);

  if (Array.isArray(raw.related_item_ids)) {
    relatedCandidates.push(...raw.related_item_ids.filter(Boolean));
  }

  normalized.related_item_ids = Array.from(new Set(relatedCandidates));

  return normalized;
};
const openClaimsModal = async (item) => {
  claimModalItem.value = item;
  claimModalItemImageError.value = false;
  claimRequests.value = [];
  try {
    // Primary fetch: item-specific claims
    const res = await axios.get(
      `${API_BASE_URL}/api/claims/item/${encodeURIComponent(item.id)}`
    );

    const rows = Array.isArray(res.data) ? res.data : [];
    claimRequests.value = rows.map((row) => normalizeClaim(row));

    if (claimRequests.value.length > 0) return;
  } catch (err) {
    console.error(
      "Error fetching claims via item endpoint:",
      err?.response?.data || err.message || err
    );
  }

  try {
    // Fallback: fetch all claims and filter (ensures older data still appears)
    const allRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
    const normalizedAll = (Array.isArray(allRes.data) ? allRes.data : []).map((row) =>
      normalizeClaim(row)
    );

    const filtered = normalizedAll.filter((claim) => {
      if (claim.related_item_ids?.length) {
        return claim.related_item_ids.some(
          (candidate) => String(candidate) === String(item.id)
        );
      }
      return String(claim.claimed_item_id) === String(item.id);
    });

    if (filtered.length === 0) {
      console.warn(
        "No claims found for item after fallback filter",
        item.id,
        allRes.data
      );
    }

    claimRequests.value = filtered;
  } catch (err) {
    console.error(
      "Error fetching claims via fallback endpoint:",
      err?.response?.data || err.message || err
    );
    claimRequests.value = [];
  }
};
    

// Open review modal for claim approval
const openClaimApprovalReview = async (claim) => {
  // Ensure we have full item details for display in the modal
  try {
    if (claim && !claim.item) {
      const id = claim.item_id || claim.claimed_item_id || claim.claimed_item_id || null;
      if (id) {
        const item = await fetchItemById(id);
        if (item) {
          // attach fetched item to claim for template access
          claim.item = item;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch item details for claim review:', e);
  }

  claimReviewData.value = { claim, action: 'approve' };
  claimReviewItemImageError.value = false;
  showClaimReviewModal.value = true;
};

// Open review modal for claim rejection
const openClaimRejectionReview = async (claim) => {
  // Ensure we have full item details for display in the modal
  try {
    if (claim && !claim.item) {
      const id = claim.item_id || claim.claimed_item_id || claim.claimed_item_id || null;
      if (id) {
        const item = await fetchItemById(id);
        if (item) {
          claim.item = item;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch item details for claim review:', e);
  }

  claimReviewData.value = { claim, action: 'reject' };
  claimReviewItemImageError.value = false;
  showClaimReviewModal.value = true;
};

// Close review modal
const closeClaimReviewModal = () => {
  showClaimReviewModal.value = false;
  claimReviewData.value = null;
  claimReviewItemImageError.value = false;
};

// Confirm approval from review modal
const confirmClaimApproval = async (claim) => {
  if (!claim || claim.status === "approved") return;

  const wasPending = !claim.status || claim.status === "pending";

  try {
    await axios.put(`${API_BASE_URL}/api/claims/${claim.claim_id}/approve`);

    const idx = claimRequests.value.findIndex(
      (c) => c.claim_id === claim.claim_id
    );
    if (idx !== -1) {
      const updated = {
        ...claimRequests.value[idx],
        status: "approved",
      };
      claimRequests.value[idx] = updated;
      claim.status = updated.status;
    }
    // Update persistent store as well
    const storeIdx = claimRequestsStore.value.findIndex((n) => (n.claim_id || n.id) === (claim.claim_id || claim.id));
    if (storeIdx !== -1) {
      claimRequestsStore.value[storeIdx].status = "approved";
    }
    if (wasPending && pendingClaimsCount.value > 0) {
      pendingClaimsCount.value--;
    }

    // --- New: When a claim is approved, mark the involved item(s) as returned
    // and create a returned-history entry. This ensures the lost/found lists
    // no longer show items that were matched and returned via approval.
    try {
      // Determine primary claimed item id and any matched item id
      const claimedItemId = claim.claimed_item_id || claim.item?.id || claim.item_id || null;
      // claim may include notification_matched_item_id or related_item_ids
      const matchedItemId = claim.notification_matched_item_id || (claim.related_item_ids && claim.related_item_ids.find(id => String(id) !== String(claimedItemId))) || null;

      const toUpdateIds = [];
      if (claimedItemId) toUpdateIds.push(claimedItemId);
      if (matchedItemId && String(matchedItemId) !== String(claimedItemId)) toUpdateIds.push(matchedItemId);

      if (toUpdateIds.length > 0) {
        const now = new Date().toISOString();
        // Update items on server in parallel
        const updatePromises = toUpdateIds.map((id) =>
          axios.put(`${API_BASE_URL}/api/items/${encodeURIComponent(id)}`, {
            status: 'returned',
            return_date: now,
          }).then(res => ({ id, data: res.data })).catch(e => ({ id, error: e }))
        );

        const results = await Promise.all(updatePromises);

        // Build a merged returned report for the history view
        const returnedReport = {
          id: `txn-${Date.now()}-${claimedItemId}`,
          name: null,
          category: null,
          image_url: null,
          status: 'returned',
          return_date: now,
          transaction_claimant_name: claim.claimant_name || claim.user_name || 'Unknown',
          transaction_claimant_id: claim.user_id || claim.claimant_id || null,
          transaction_message: claim.message || claim.claimant_message || null,
          transaction_place: null,
        };

        for (const r of results) {
          if (r.error) {
            console.warn('Failed to update item during claim approval:', r.id, r.error?.message || r.error);
            continue;
          }
          const itemData = r.data || {};
          // Remove from UI lists
          const removeFromList = (list) => {
            const i = list.findIndex(it => String(it.id) === String(r.id));
            if (i !== -1) list.splice(i, 1);
          };
          removeFromList(foundItems.value);
          removeFromList(lostItems.value);

          // Use the first item's details as primary if not set
          if (!returnedReport.name) returnedReport.name = itemData.name || itemData.item_name || 'Unknown';
          if (!returnedReport.category) returnedReport.category = itemData.category || itemData.item_category || 'General';
          if (!returnedReport.image_url) returnedReport.image_url = itemData.image_url || itemData.item_image || null;
          if (!returnedReport.transaction_place && itemData.location) returnedReport.transaction_place = itemData.location;

          // Emit socket so other clients update
          socket.emit('updateReport', itemData);
        }

        // Ensure claimant display fields on the synthesized returned entry
        try {
          await ensureClaimantForItem(returnedReport);
        } catch (e) {
          /* ignore */
        }

        // Generate and offer the PDF report for this returned transaction
        try {
          await generateReturnReport(returnedReport, { download: true });
        } catch (e) {
          console.warn('Failed to generate return PDF:', e);
        }

        // Add to returned history UI
        returnedHistory.value.unshift(returnedReport);
        unreadReturnedCount.value++;
      }
    } catch (approvalSideErr) {
      console.error('Error while marking items returned after claim approval:', approvalSideErr);
    }

    alert("✅ Claim approved.");
    closeClaimReviewModal();
  } catch (err) {
    console.error("Error approving claim:", err);
    alert("❌ Failed to approve claim.");
  }
};

// Confirm rejection from review modal
const confirmClaimRejection = async (claim) => {
  if (!claim) return;

  const claimId = claim.claim_id || claim.id;

  try {
    const rawId = String(claimId || "");
    const trimmed = rawId.trim();
    const encoded = encodeURIComponent(trimmed);
    const url = `${API_BASE_URL}/api/claims/${encoded}/reject`;
    console.log("[SecurityDashboard] Rejecting claim", { claimId: rawId, trimmed, url });
    await axios.put(url);

    // Keep status as "pending" when rejecting (don't change to "rejected")
    // The rejection is just a notification, status stays pending for future reconsideration
    console.log(`✅ Claim ${claimId} rejected (status remains pending)`);
    
    alert("❌ Claim rejected. The claim status remains pending.");
    closeClaimReviewModal();
  } catch (err) {
    console.error("Error rejecting claim:", err);
    // If the backend returned 404 -> claim not found, remove stale entries from local UI
    const status = err?.response?.status;
    if (status === 404) {
      console.warn(`Claim ${claimId} not found on server — cleaning local Claim Requests and notifications.`);
      
      // Remove from claimRequests
      const reqIdx = claimRequests.value.findIndex((c) => (c.claim_id || c.id) === claimId);
      if (reqIdx !== -1) {
        claimRequests.value.splice(reqIdx, 1);
      }
      
      // Remove from claimNotifications
      const notifIdx = claimNotifications.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (notifIdx !== -1) {
        claimNotifications.value.splice(notifIdx, 1);
      }
      
      // Remove from claimRequestsStore
      const storeIdx = claimRequestsStore.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (storeIdx !== -1) {
        claimRequestsStore.value.splice(storeIdx, 1);
      }
      
      alert("⚠️ Claim not found on server. Removed from local cache.");
      closeClaimReviewModal();
    } else {
      alert("❌ Failed to reject claim.");
    }
  }
};

// Method to view claim details - opens the existing claims modal
const viewClaimDetails = async (claim) => {
  if (claim.item) {
    // If we already have the item data, open the modal directly
    claimModalItem.value = claim.item;
    claimModalItemImageError.value = false;
    claimRequests.value = [claim];
  } else {
    // Otherwise try to fetch the item
    const item = await fetchItemById(claim.item_id || claim.claimed_item_id);
    if (item) {
      claimModalItem.value = item;
      claimModalItemImageError.value = false;
      claimRequests.value = [claim];
    } else {
      alert("❌ Could not load item details.");
    }
  }
};

const deleteRejectedClaim = async (claim) => {
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the rejected claim from ${claim.claimant_name || 'Unknown'}?`)) {
    return;
  }

  try {
    const claimId = claim.claim_id || claim.id;
    if (!claimId) {
      alert("❌ Error: Claim ID not found.");
      console.error("❌ Claim object has no ID:", claim);
      return;
    }

    console.log(`🗑️ Attempting to delete claim with ID: "${claimId}"`);
    console.log(`🗑️ Claim status: ${claim.status}`);
    console.log(`🗑️ Full claim object:`, claim);
    
    // ✅ Verify claim still exists and is in rejected status before deletion
    try {
      // First, try to fetch all claims to check current status
      const checkRes = await axios.get(`${API_BASE_URL}/api/claims/security/all`);
      const allClaims = Array.isArray(checkRes.data) ? checkRes.data : [];
      
      console.log(`🔍 Searching for claim ${claimId} in ${allClaims.length} claims from database`);
      
      // The API returns claim_id (not id), so search by claim_id
      const currentClaim = allClaims.find(c => String(c.claim_id) === String(claimId));
      
      if (!currentClaim) {
        console.warn(`⚠️ Claim ${claimId} not found in current database. It may have been already deleted.`);
        console.log(`📋 Available claim IDs in database:`, allClaims.map(c => c.claim_id));
        alert("❌ Claim not found. It may have been already deleted.");
        // Remove from local list anyway
        const idx = claimNotifications.value.findIndex(n => (n.claim_id || n.id) === claimId);
        if (idx !== -1) claimNotifications.value.splice(idx, 1);
        return;
      }
      
      if (currentClaim.status !== 'rejected') {
        console.warn(`⚠️ Claim ${claimId} is no longer in rejected status. Current status: ${currentClaim.status}`);
        alert(`❌ Claim status has changed to "${currentClaim.status}". Only rejected claims can be deleted.`);
        return;
      }
    } catch (checkErr) {
      console.error("⚠️ Could not verify claim status before deletion:", checkErr);
      // Continue anyway - backend will validate
    }
    
    const res = await axios.delete(`${API_BASE_URL}/api/claims/${claimId}`);
    
    if (res.status === 200 || res.data) {
      console.log(`✅ Rejected claim deleted: ${claimId}`, res.data);
      
      // Remove from claimNotifications
      const index = claimNotifications.value.findIndex((n) => (n.claim_id || n.id) === claimId);
      if (index !== -1) {
        claimNotifications.value.splice(index, 1);
      }
      
      alert("✅ Rejected claim has been deleted.");
      
      // 🔄 Refresh the claims from database
      await fetchClaimsFromDatabase();
      console.log("✅ Refreshed claims from database after deletion");
    }
  } catch (err) {
    console.error("❌ Error deleting rejected claim:", err);
    console.error("Error details:", err.response?.data || err.message);
    alert(`Failed to delete the rejected claim: ${err.response?.data?.message || err.message}`);
  }
};

const highlightNewItem = async (id) => {
  newItemIds.value.push(id);
  await nextTick();
  setTimeout(() => {
    newItemIds.value = newItemIds.value.filter((i) => i !== id);
  }, 5000);
};

const handleNewReport = (newReport) => {
  const reportWithFlags = {
    ...newReport,
    imageError: false,
    reporterImageError: false,
  };

  if (Notification.permission === "granted") {
    new Notification("🆕 New Report", {
      body: `${newReport.type === "lost" ? "Lost" : "Found"}: ${newReport.name}`,
      icon: newReport.image_url ? `${API_BASE_URL}${newReport.image_url}` : undefined,
    });
  }

  const exists =
    lostItems.value.some((i) => i.id === newReport.id) ||
    foundItems.value.some((i) => i.id === newReport.id) ||
    returnedHistory.value.some((i) => i.id === newReport.id);
  if (exists) return;

  if (newReport.type === "lost") {
    lostItems.value.unshift(reportWithFlags);
    unreadLostCount.value++;
    highlightNewItem(newReport.id);
  } else if (newReport.type === "found") {
    if (newReport.status === "returned") {
      // attempt to populate claimant info
      ensureClaimantForItem(reportWithFlags).catch(() => {});
      returnedHistory.value.unshift(reportWithFlags);
      unreadReturnedCount.value++;
      highlightNewItem(newReport.id);
    } else {
      foundItems.value.unshift(reportWithFlags);
      unreadFoundCount.value++;
      highlightNewItem(newReport.id);
    }
  }
};

socket.on("reportUpdated", async (updatedReport) => {
  const lists = [lostItems.value, foundItems.value, returnedHistory.value];
  lists.forEach((list) => {
    const idx = list.findIndex((item) => item.id === updatedReport.id);
    if (idx !== -1) list.splice(idx, 1);
  });

        if (updatedReport.status === "returned") {
    // ensure claimant info is present for updated returned reports
    await ensureClaimantForItem(updatedReport);
    returnedHistory.value.unshift(updatedReport);
  } else if (updatedReport.type === "found") {
    foundItems.value.unshift(updatedReport);
  } else if (updatedReport.type === "lost") {
    lostItems.value.unshift(updatedReport);
  }
});

socket.on("refreshDashboard", fetchItems);

// 🔸 UPDATED: newClaimRequest listener with counter
socket.on("newClaimRequest", (claimData) => {
  // Add to claim notifications (only for items in security custody)
  addClaimNotification(claimData);

  // Desktop notification (still useful)
  if (Notification.permission === "granted") {
    try {
      new Notification("🆕 New Claim", {
        body: `New claim for: ${claimData.item_name || claimData.item_name || claimData.item?.name || claimData.item_name}`,
      });
    } catch (e) {
      void e;
    }
  }

  // Add to modal if open for the same item
  try {
    if (claimModalItem.value && (String(claimModalItem.value.id) === String(claimData.item_id) || String(claimModalItem.value.id) === String(claimData.claimed_item_id))) {
      claimRequests.value.push(
        normalizeClaim({ ...claimData, status: claimData.status || 'pending' })
      );
    }
  } catch (e) {
    console.error('Error handling newClaimRequest add to modal', e);
  }
});

const confirmReceived = async () => {
  if (!reviewItem.value) return;
  try {
    const res = await axios.put(`${API_BASE_URL}/api/items/${reviewItem.value.id}`, {
      status: "in_security_custody",
    });

    const updated = { ...(res.data || {}), imageError: false, reporterImageError: false };

    // Try to find and replace the item in any of the lists so the UI updates immediately
    const lists = [foundItems.value, lostItems.value, returnedHistory.value];
    let replaced = false;
    for (const list of lists) {
      const idx = list.findIndex((i) => String(i.id) === String(updated.id));
      if (idx !== -1) {
        // preserve some local flags if present
        const prev = list[idx] || {};
        list.splice(idx, 1, { ...prev, ...updated });
        replaced = true;
        break;
      }
    }

    // If not found, add to foundItems if status is non-returned
    if (!replaced) {
      if ((updated.status || "").toLowerCase() === "returned") {
        returnedHistory.value.unshift(updated);
      } else {
        foundItems.value.unshift(updated);
      }
    }

    // Broadcast to other listeners via socket (server may rebroadcast as well)
    socket.emit("updateReport", updated);

    reviewItem.value = null;
    // Refresh the page to ensure the dashboard reflects the latest server state
    try {
      window.location.reload();
    } catch (e) {
      // best-effort reload; ignore errors
      console.warn('Could not reload page after confirming received', e);
    }
  } catch (err) {
    console.error("Error marking received:", err);
    alert("Failed to update item status. Please try again.");
  }
};



const confirmReturn = async () => {
  if (!returnItem.value) return;

  const item = returnItem.value;
  const itemId = item.id;
  const isLostItem = String(item.type || "").toLowerCase() === "lost";

  try {
    // Update status to returned on server
    const now = new Date().toISOString();
    const res = await axios.put(`${API_BASE_URL}/api/items/${itemId}`, {
      status: "returned",
      return_date: now,
    });

    const updated = { ...(res.data || {}), imageError: false, reporterImageError: false };
    // Ensure a return_date is present for UI display even if backend didn't echo it
    if (!updated.return_date && !updated.returnDate) {
      updated.return_date = now;
    } else if (!updated.return_date && updated.returnDate) {
      // handle alternative naming from server
      updated.return_date = updated.returnDate;
    }

    // Remove any existing occurrences from found/lost lists immediately
    const removeById = (list) => {
      const idx = list.findIndex((i) => String(i.id) === String(itemId));
      if (idx !== -1) list.splice(idx, 1);
    };

    removeById(foundItems.value);
    removeById(lostItems.value);

    // Add to returnedHistory if not already present
    const existsInReturned = returnedHistory.value.some((i) => String(i.id) === String(itemId));
      if (!existsInReturned) {
      returnedHistory.value.unshift(updated);
      unreadReturnedCount.value++;
    }

    // Notify other listeners
    socket.emit("updateReport", updated);

    // If this was a lost-type item, some backends may want it deleted from items table.
    if (isLostItem) {
      try {
        await axios.delete(`${API_BASE_URL}/api/items/${itemId}`);
      } catch (e) {
        console.warn("Failed to delete lost item after marking returned:", e);
      }
    }

    // Reconcile authoritative lists in background
    fetchItems().catch(() => {});

    alert("✅ Item marked as returned.");
  } catch (err) {
    console.error("Error marking as returned:", err);
    alert("Failed to mark item as returned. Please try again.");
  } finally {
    returnItem.value = null;
  }
};

onMounted(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.role === "security" || storedUser?.role === "admin") {
      securityUser.value = storedUser;
    }
  } catch (err) {
    console.error("Failed to parse security user from storage:", err);
  }

  document.addEventListener("click", handleProfileMenuOutside);
  document.addEventListener("click", handleNotificationsOutside);
  fetchItems();

  // 🔒 IMPORTANT: Remove any existing listeners first to prevent duplicates
  // (in case component remounts or socket reconnects)
  socket.off("newReport");
  socket.off("newClaimRequest");
  socket.off("claimStatusUpdated");
  socket.off("itemMatched");
  
  console.log("🔌 Cleared existing socket listeners to prevent duplicates");

  socket.on("newReport", handleNewReport);

  // 🔴 PRIMARY: Listen for new claim requests (main socket event from backend)
  socket.on("newClaimRequest", (claimData) => {
    try {
      console.log("🔔 [Socket] Received newClaimRequest event:", claimData);
      
      const normalized = normalizeClaim(claimData);
      const claimId = normalized.claim_id;
      
      // 🔒 Skip if we've already processed this claim_id
      if (processedClaimIds.has(claimId)) {
        console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
        return;
      }
      
      addClaimNotification(claimData);
      processedClaimIds.add(claimId);
      saveProcessedClaimIds();
      
      // ⚠️ Do NOT increment pendingClaimsCount here
      // It will be updated by periodic sync with authoritative backend count

      if (Notification.permission === "granted") {
        try {
          const claimantName = claimData.claimant_name || claimData.user_name || "Unknown claimant";
          const itemName = claimData.item_name || claimData.display_name || "Unknown item";
          new Notification("🆕 Claim Request", {
            body: `${claimantName} claims: ${itemName}`,
            icon: claimData.claimant_profile_picture ? getFullUrl(claimData.claimant_profile_picture) : undefined,
          });
        } catch (e) { 
          console.error("Failed to show notification:", e);
        }
      }

      // If the modal for this item is open, refresh the claims list
      if (claimModalItem.value) {
        const itemId = claimData.item_id || claimData.claimed_item_id || claimData.notification_item_id;
        if (itemId && String(itemId) === String(claimModalItem.value.id)) {
          console.log("📋 Modal open for this item, refreshing claims...");
          openClaimsModal(claimModalItem.value);
        }
      }
    } catch (e) {
      console.error('Error handling newClaimRequest socket event', e);
    }
  });

  // FALLBACK: Listen for claim status updates (secondary event)
  socket.on("claimStatusUpdated", (payload) => {
    try {
      console.log("🔔 [Socket] Received claimStatusUpdated event (fallback):", payload);
      
      const normalized = normalizeClaim(payload);
      const claimId = normalized.claim_id;
      
      // 🔒 Skip if we've already processed this claim_id
      if (processedClaimIds.has(claimId)) {
        console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
        return;
      }
      
      addClaimNotification(payload);
      processedClaimIds.add(claimId);
      saveProcessedClaimIds();
      
      // ⚠️ Do NOT increment pendingClaimsCount here
      // It will be updated by periodic sync with authoritative backend count

      if (Notification.permission === "granted") {
        try {
          new Notification("🆕 Claim Request", {
            body: `Claim for: ${payload.item_id}`,
          });
        } catch (e) { void e; }
      }

      // If the modal for this item is open, refresh the claims list
      if (claimModalItem.value) {
        const itemId = payload.item_id || payload.claimed_item_id;
        if (itemId && String(itemId) === String(claimModalItem.value.id)) {
          openClaimsModal(claimModalItem.value);
        }
      }
    } catch (e) {
      console.error('Error handling claimStatusUpdated socket event', e);
    }
  });

  // EXTRA: Also listen to itemMatched as fallback
  socket.on("itemMatched", (payload) => {
    try {
      console.log("🔔 [Socket] Received itemMatched event (fallback):", payload);
      
      if (payload && (payload.user_id || payload.item_id)) {
        const normalized = normalizeClaim(payload);
        const claimId = normalized.claim_id;
        
        // 🔒 Skip if we've already processed this claim_id
        if (claimId && processedClaimIds.has(claimId)) {
          console.log(`⚠️ [Socket] Claim ${claimId} already processed, skipping duplicate`);
          return;
        }
        
        addClaimNotification(payload);
        if (claimId) {
          processedClaimIds.add(claimId);
          saveProcessedClaimIds();
          // ⚠️ Do NOT increment pendingClaimsCount here
          // It will be updated by periodic sync with authoritative backend count
        }
      }
    } catch (e) {
      console.error('Error handling itemMatched socket event', e);
    }
  });

  if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  
  // Fetch initial pending claims count for badge
  (async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/claims/pending/count`);
      pendingClaimsCount.value = res.data?.pending_count || 0;
      console.log("📊 Initial pending claims count:", pendingClaimsCount.value);
    } catch (err) {
      console.error('Failed to fetch pending claims count:', err);
    }
  })();

  // 🔄 Fetch claims directly from database on mount
  (async () => {
    try {
      await fetchClaimsFromDatabase();
      console.log("✅ Initial claims fetched from database");
    } catch (err) {
      console.error('Failed to fetch initial claims from database:', err);
    }
  })();

  // Conditional sync management: start periodic syncs only when the user
  // is viewing the relevant page AND there is something to sync. This
  // avoids confusing automatic background requests when there are no
  // claim requests or submitted reports.

  const startClaimSyncIfNeeded = () => {
    if (claimSyncInterval) return;
    if (currentPage.value !== 'claim-requests') return;
  // require at least one active notification in the bell
  // NOTE: we intentionally do NOT start the periodic sync just because the
  // persistent claimRequestsStore contains entries — the periodic sync is
  // intended to keep the notification bell up-to-date only. We also avoid
  // using the backend pending count to start polling because that can be
  // out-of-sync with the bell visual state and cause confusing background
  // polling when the bell is empty.
  if (!(claimNotifications.value.length > 0)) return;

    // run an immediate sync and then start periodic sync as a failsafe
    syncPendingClaims();
    claimSyncInterval = setInterval(() => {
      syncPendingClaims();
    }, 60000);
  // periodic claim sync started
  };

  const stopClaimSync = () => {
    if (claimSyncInterval) {
      clearInterval(claimSyncInterval);
      claimSyncInterval = null;
  // periodic claim sync cleared
    }
  };

  const startItemSyncIfNeeded = () => {
    if (itemSyncInterval) return;
    if (!["lost-reports", "found-reports", "returned-history"].includes(currentPage.value)) return;
    if (!(lostItems.value.length > 0 || foundItems.value.length > 0 || returnedHistory.value.length > 0)) return;

    // fetch immediately then start periodic sync
    fetchItems();
    itemSyncInterval = setInterval(() => {
      fetchItems();
    }, 60000);
  // periodic item sync started
  };

  const stopItemSync = () => {
    if (itemSyncInterval) {
      clearInterval(itemSyncInterval);
      itemSyncInterval = null;
  // periodic item sync cleared
    }
  };

  // Watch page changes to enable/disable syncs based on which view is active
  watch(currentPage, (page) => {
    if (page === 'claim-requests') {
      // Mark notifications seen when the user navigates to the Claim Requests
      // page so sidebar/bell badges hide after clicking the sidebar.
      notificationsSeen.value = true;
      startClaimSyncIfNeeded();
    } else {
      stopClaimSync();
    }

    if (["lost-reports", "found-reports", "returned-history"].includes(page)) {
      startItemSyncIfNeeded();
    } else {
      stopItemSync();
    }
  });

  // Watch relevant signals so the sync can start/stop dynamically while
  // the user stays on the page (e.g., new notification arrives or is cleared)
  watch([
    () => claimNotifications.value.length,
  ], () => {
    // Only consider the bell for deciding whether to start the periodic
    // notification sync. Persistent claimRequestsStore entries do not
    // trigger automatic polling.
    if (currentPage.value === 'claim-requests') {
      if (claimNotifications.value.length > 0) {
        startClaimSyncIfNeeded();
      } else {
        stopClaimSync();
      }
    }
  });

  watch([
    () => lostItems.value.length,
    () => foundItems.value.length,
    () => returnedHistory.value.length,
  ], () => {
    if (["lost-reports", "found-reports", "returned-history"].includes(currentPage.value)) {
      if (lostItems.value.length > 0 || foundItems.value.length > 0 || returnedHistory.value.length > 0) {
        startItemSyncIfNeeded();
      } else {
        stopItemSync();
      }
    }
  });
});

onUnmounted(() => {
  // Clear periodic sync interval
  if (claimSyncInterval) {
    clearInterval(claimSyncInterval);
  // periodic claim sync cleared
  }

  // Clear database claims refresh interval
  if (dbClaimsRefreshInterval) {
    clearInterval(dbClaimsRefreshInterval);
    console.log("🔄 Cleared database claims refresh interval");
  }

  // Remove all socket listeners to prevent memory leaks
  socket.off("newReport", handleNewReport);
  socket.off("reportUpdated");
  socket.off("refreshDashboard");
  socket.off("newClaimRequest");
  socket.off("claimStatusUpdated");
  socket.off("itemMatched");
  
  // Remove DOM event listeners
  document.removeEventListener("click", handleProfileMenuOutside);
  document.removeEventListener("click", handleNotificationsOutside);
  
  // Do NOT disconnect the shared socket here; just remove listeners.
  console.log("🔌 SecurityDashboard unmounted, socket listeners removed");
});

// Filters (unchanged)
const filteredLostItems = computed(() => {
  let items = lostItems.value;
  if (lostSearch.value)
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(lostSearch.value.toLowerCase()) ||
        (i.student_id && i.student_id.includes(lostSearch.value))
    );
  if (lostCategoryFilter.value)
    items = items.filter((i) => i.category === lostCategoryFilter.value);
  return items;
});

const filteredFoundItems = computed(() => {
  let items = foundItems.value;
  if (foundStatusFilter.value)
    items = items.filter((i) => i.status === foundStatusFilter.value);
  if (foundSearch.value)
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(foundSearch.value.toLowerCase()) ||
        (i.student_id && i.student_id.includes(foundSearch.value))
    );
  if (foundCategoryFilter.value)
    items = items.filter((i) => i.category === foundCategoryFilter.value);
  return items;
});

const filteredReturnedHistory = computed(() => {
  let items = returnedHistory.value;
  if (returnedSearch.value)
    items = items.filter(
      (i) =>
        i.name?.toLowerCase().includes(returnedSearch.value.toLowerCase()) ||
        (i.student_id && i.student_id.includes(returnedSearch.value))
    );
  if (returnedCategoryFilter.value)
    items = items.filter((i) => i.category === returnedCategoryFilter.value);
  return items;
});

const filteredClaimRequests = computed(() => {
  // 🔄 ALWAYS fetch from database instead of persistent store
  // This ensures the claim requests section shows the authoritative state from the claims table
  let claims = dbClaimRequests.value;
  
  // Filter by search term (item name, student ID, or claimant name)
  if (claimsSearch.value) {
    const searchTerm = claimsSearch.value.toLowerCase();
    claims = claims.filter((c) =>
      (c.item_name || c.item?.name || '')?.toLowerCase().includes(searchTerm) ||
      (c.item?.student_id || '')?.includes(claimsSearch.value) ||
      (c.claimant_name || c.user_name || '')?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by status
  if (claimsStatusFilter.value) {
    claims = claims.filter((c) => (c.status || 'pending') === claimsStatusFilter.value);
  }
  // Filter by category: student (items with student_id) or general (items without student_id)
  if (claimsCategoryFilter.value) {
    if (claimsCategoryFilter.value === 'student') {
      claims = claims.filter((c) => !!(c.item && (c.item.student_id || c.item.studentId)));
    } else if (claimsCategoryFilter.value === 'general') {
      claims = claims.filter((c) => !(c.item && (c.item.student_id || c.item.studentId)));
    }
  }
  
  return claims;
});

const filteredDetails = computed(() => {
  if (!selectedItem.value) return {};
  const filtered = {};
  for (const [key, value] of Object.entries(selectedItem.value)) {
    if (
      value &&
      value !== "N/A" &&
      ![
        "id",
        "image_url",
        "created_at",
        "imageError",
        "reporter_id",
        "reporter_name",
        "reporter_email",
        "reporter_profile_picture",
        "reporterImageError",
      ].includes(key)
    ) {
      filtered[key] = value;
    }
  }
  return filtered;
});

const viewItem = (item) => {
  selectedItem.value = item;
  imageError.value = false;
  reporterImageError.value = false;
};

const closeModal = () => {
  selectedItem.value = null;
  claimModalItem.value = null;
};

const openReviewModal = (item) => {
  reviewItem.value = item;
  imageError.value = false;
  reporterImageError.value = false;
};
const closeReviewModal = () => {
  reviewItem.value = null;
  imageError.value = false;
  reporterImageError.value = false;
};
const openReturnModal = (item) => (returnItem.value = item);

const viewReporterProfile = (reporterId) => {
  if (reporterId) router.push(`/view-profile/${reporterId}`);
};

const logout = () => {
  showProfileMenu.value = false;
  disconnectSocket();
  localStorage.clear();
  router.push("/login");
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