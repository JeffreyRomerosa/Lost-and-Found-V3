<template>
  <div>
    <!-- Email Changed Modal -->
    <transition name="fade">
      <div v-if="showEmailChangedModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-emerald-500 rounded-2xl shadow-xl p-8 max-w-md w-full text-center transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <svg class="h-12 w-12 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Admin Account Changed</h2>
            <p class="text-gray-600 dark:text-gray-300">Your admin email or role has been updated.<br>Please log in again to continue.</p>
            <button @click="logoutToLogin" class="mt-4 px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition duration-300">Go to Login</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Role Change Confirmation Modal -->
    <transition name="fade">
      <div v-if="isRoleChangeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-emerald-500 rounded-2xl shadow-xl p-8 max-w-md w-full transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Confirm Role Change</h2>
            <div class="flex items-center space-x-4 mb-4">
              <div v-if="selectedRoleChangeUser?.profile_picture" class="w-20 h-20 rounded-full overflow-hidden">
                <img :src="`${API_BASE_URL}${selectedRoleChangeUser.profile_picture}`" 
                     :alt="selectedRoleChangeUser.full_name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center">
                <span class="text-2xl text-white font-bold">
                  {{ selectedRoleChangeUser?.full_name?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-center">{{ roleChangeMessage }}</p>
            <div class="flex space-x-4">
              <button @click="confirmRoleChange" 
                      class="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition duration-300">
                Confirm
              </button>
              <button @click="cancelRoleChange" 
                      class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete User Confirmation Modal -->
    <transition name="fade">
      <div v-if="userDeleteConfirmation" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-red-500 rounded-2xl shadow-xl p-8 max-w-md w-full transition-colors duration-200">
          <div class="flex flex-col items-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-red-600">Delete User</h2>
            <div class="flex items-center space-x-4 mb-4">
              <div v-if="selectedUserToDelete?.profile_picture" class="w-20 h-20 rounded-full overflow-hidden">
                <img :src="`${API_BASE_URL}${selectedUserToDelete.profile_picture}`" 
                     :alt="selectedUserToDelete.full_name"
                     class="w-full h-full object-cover">
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center">
                <span class="text-2xl text-white font-bold">
                  {{ selectedUserToDelete?.full_name?.[0]?.toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-center mb-2">Are you sure you want to delete this user?</p>
            <p class="text-gray-400 text-sm text-center mb-4">This action cannot be undone.</p>
            <div class="flex space-x-4">
              <button @click="deleteUserConfirmed" 
                      class="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300">
                Delete
              </button>
              <button @click="cancelUserDelete" 
                      class="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Item Details Modal -->
    <transition name="fade">
      <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Item Details</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                <img v-if="selectedItem.image_url && !imageError" 
                     :src="`${API_BASE_URL}${selectedItem.image_url}`"
                     :alt="selectedItem.name"
                     class="w-full h-64 object-contain">
                <div v-else class="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-gray-500 dark:text-gray-400">No image available</span>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Item Information</h3>
                <div class="space-y-3">
                  <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Name:</span> {{ selectedItem.name }}</p>
                  <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Category:</span> {{ selectedItem.category }}</p>
                  <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Status:</span> 
                    <span :class="{
                      'text-green-600 dark:text-green-400': selectedItem.status === 'returned',
                      'text-amber-600 dark:text-amber-400': selectedItem.status === 'pending'
                    }">
                      {{ selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1) }}
                    </span>
                  </p>
                  <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Location:</span> {{ selectedItem.location || 'N/A' }}</p>
                  <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Date & Time:</span> {{ formatDate(selectedItem.datetime) }}</p>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white mb-1">Description</p>
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ selectedItem.description }}</p>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Reporter Information</h3>
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-full overflow-hidden">
                      <img v-if="selectedItem.reporter?.profile_picture && !reporterImageError" 
                           :src="`${API_BASE_URL}${selectedItem.reporter.profile_picture}`"
                           @error="reporterImageError = true"
                           class="w-full h-full object-cover"
                           :alt="selectedItem.reporter.full_name">
                      <div v-else class="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                        {{ selectedItem.reporter?.full_name?.[0]?.toUpperCase() || '?' }}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Name:</span> {{ selectedItem.reporter?.full_name || 'Anonymous' }}</p>
                    <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Email:</span> {{ selectedItem.reporter?.email || 'N/A' }}</p>
                    <p class="text-gray-700 dark:text-gray-300"><span class="font-semibold text-gray-900 dark:text-white">Contact:</span> {{ selectedItem.reporter?.contact_number || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- User Details Modal -->
    <transition name="fade">
      <div v-if="userModal && selectedUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-8 max-w-2xl w-full m-4">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">User Details</h2>
            <button @click="closeUserModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0">
              <div class="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <img
                  v-if="selectedUser.profile_picture"
                  :src="`${API_BASE_URL}${selectedUser.profile_picture}`"
                  class="w-full h-full object-cover"
                  :alt="selectedUser.full_name"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-4xl font-bold"
                >
                  {{ selectedUser.full_name ? selectedUser.full_name[0].toUpperCase() : '?' }}
                </div>
              </div>
            </div>

            <div class="flex-grow space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400">Full Name</label>
                <p class="text-gray-900 dark:text-white text-lg">{{ selectedUser.full_name || 'Not provided' }}</p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
                <p class="text-gray-900 dark:text-white">{{ selectedUser.email }}</p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400">Role</label>
                <p class="text-gray-900 dark:text-white capitalize">
                  <span v-if="selectedUser.role === 'security'" class="text-blue-600 dark:text-blue-400 font-semibold">Security Staff</span>
                  <span v-else-if="selectedUser.role === 'admin'" class="text-emerald-600 dark:text-emerald-400 font-semibold">Administrator</span>
                  <span v-else class="text-green-600 dark:text-green-400 font-semibold">University Member</span>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-end">
            <button
              @click="closeUserModal"
              class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <!-- Sidebar -->
      <AdminSidebar @select-page="handleSidebarSelect" />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Navbar -->
        <AdminNavbar />
        
        <main class="p-8 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          <!-- Dashboard Overview -->
          <div v-if="activePage === 'dashboard'">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
              <p class="text-gray-600 dark:text-gray-400">Overview of lost and found items and system statistics</p>
            </div>

            <!-- Reports Statistics -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reports Overview</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Total Reports" :count="totalReports" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
                <DashboardCard title="Resolved Items" :count="resolvedCount" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
                <DashboardCard title="Pending Items" :count="pendingCount" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-700" />
              </div>
            </div>

            <!-- User Statistics -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Security Staff" :count="totalSecurityStaff" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-900" />
                <DashboardCard title="University Members" :count="totalUniversityMembers" 
                class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-gray-800 to-white dark:to-gray-900" />
              </div>
            </div>
          </div>

          <!-- REPORTED ITEMS SECTION -->
          <div v-if="activePage === 'reported-items'">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reported Items</h1>
              <p class="text-gray-600 dark:text-gray-400">Manage all lost and found item reports</p>
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                v-for="tab in reportTabs"
                :key="tab"
                @click="activeReportTab = tab"
                class="px-4 py-3 font-medium transition relative"
                :class="activeReportTab === tab
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'"
              >
                {{ tab }}
                <span
                  v-if="getUnreadCount(tab) > 0"
                  class="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-semibold"
                >
                  {{ getUnreadCount(tab) }}
                </span>
              </button>
            </div>

            <!-- improved filter/search layout -->
            <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                v-model="reportSearch"
                type="text"
                placeholder="Search by name, item, or student ID..."
                class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div class="flex gap-2">
                <select
                  v-model="categoryFilter"
                  class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Categories</option>
                  <option value="id">ID Items</option>
                  <option value="general">General Items</option>
                </select>
                <select
                  v-if="activeReportTab === 'Found Reports'"
                  v-model="statusFilter"
                  class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_security_custody">In Security Custody</option>
                </select>
              </div>
            </div>

            <!-- improved table styling with better contrast -->
            <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Image</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Category</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Location</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Date & Time</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Reported By</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in filteredReportItems"
                    :key="item.id"
                    class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td class="px-6 py-4">
                      <img
                        v-if="item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '' && !item.imageError"
                        :src="`${API_BASE_URL}${item.image_url}`"
                        @error="item.imageError = true"
                        class="w-12 h-12 object-cover rounded"
                      />
                      <span v-else class="text-gray-400">N/A</span>
                    </td>
                    <td class="px-6 py-4 text-gray-900 dark:text-white">{{ item.name || 'N/A' }}</td>
                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ item.category || 'General' }}</td>
                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ item.location || 'N/A' }}</td>
                    <td class="px-6 py-4 text-gray-700 dark:text-gray-300 text-xs">{{ formatDate(item.datetime) }}</td>
                    <td class="px-6 py-4">
                      <span :class="formatStatus(item.status).class">
                        {{ formatStatus(item.status).text }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-2">
                        <img
                          v-if="item.reporter_profile_picture && !item.reporterImageError"
                          :src="`${API_BASE_URL}${item.reporter_profile_picture}`"
                          @error="item.reporterImageError = true"
                          class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div
                          v-else
                          class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold"
                        >
                          {{ item.reporter_name ? item.reporter_name[0].toUpperCase() : '?' }}
                        </div>
                        <span class="text-gray-900 dark:text-white">{{ item.reporter_name || 'Anonymous' }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                      <button
                        @click="viewItem(item)"
                        class="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition text-xs font-medium"
                      >
                        View
                      </button>
                      <button
                        v-if="activeReportTab === 'Returned History'"
                        @click="confirmDelete(item)"
                        class="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        title="Delete item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- USERS MANAGEMENT SECTION -->
          <div v-if="activePage === 'users'">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
              <p class="text-gray-600 dark:text-gray-400">Manage system users and their roles</p>
            </div>

            <!-- Users Table -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Users</h3>
              
              <!-- improved filter section -->
              <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search by name or email..."
                  class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  v-model="userRoleFilter"
                  class="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Roles</option>
                  <option value="university_member">University Member</option>
                  <option value="security">Security Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Profile</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Role</th>
                      <th class="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="user in filteredUsers"
                      :key="user.id"
                      class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td class="px-6 py-4">
                        <img
                          v-if="user.profile_picture"
                          :src="`${API_BASE_URL}${user.profile_picture}`"
                          class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div
                          v-else
                          class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm"
                        >
                          {{ user.full_name ? user.full_name[0].toUpperCase() : '?' }}
                        </div>
    
                      </td>
                      <td class="px-6 py-4 text-gray-900 dark:text-white font-medium">{{ user.full_name || 'N/A' }}</td>
                      <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ user.email || 'N/A' }}</td>
                      <td class="px-6 py-4">
                        <span v-if="user.role === 'security'" 
                       
                        class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">Security Staff</span>
                        <span v-else-if="user.role === 'admin'" 
                        class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-semibold">Administrator</span>
                        <span v-else class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold">University Member</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex gap-2">
                          <button
                            @click="viewUser(user)"
                            class="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition text-xs font-medium"
                          >
                            View
                          </button>
                          <button
                            v-if="user.role === 'university_member'"
                            @click="changeUserRole(user, 'security')"
                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-medium whitespace-nowrap"
                          >
                            Assign Security
                          </button>
                          <button
                            v-else-if="user.role === 'security'"
                            @click="changeUserRole(user, 'university_member')"
                            class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition text-xs font-medium whitespace-nowrap"
                          >
                            Revert Role
                          </button>
                          <button
                            v-if="user.role !== 'admin'"
                            @click="confirmUserDelete(user)"
                            class="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="Delete user"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Admin Account Update Section -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Account</h2>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Update your admin credentials and security settings</p>
                </div>
                <button @click="showAdminUpdate = !showAdminUpdate" class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium">
                  {{ showAdminUpdate ? 'Hide' : 'Update Account' }}
                </button>
              </div>

              <div v-if="showAdminUpdate" class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <form @submit.prevent="updateAdminAccount" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Email Address</label>
                      <input
                        v-model="profileForm.email"
                        type="email"
                        placeholder="admin@carsu.edu.ph"
                        class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.oldPassword"
                          :type="showOldPassword ? 'text' : 'password'"
                          required
                          placeholder="Enter your current password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showOldPassword = !showOldPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showOldPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.newPassword"
                          :type="showNewPassword ? 'text' : 'password'"
                          placeholder="Enter new password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Confirm New Password</label>
                      <div class="relative">
                        <input
                          v-model="profileForm.confirmNewPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          placeholder="Re-enter new password"
                          class="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                        />
                        <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.192-5.877" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.6 6.6L17.4 17.4" />
                          </svg>
                          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-3">
                    <button
                      type="submit"
                      :disabled="profileFormLoading"
                      class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {{ profileFormLoading ? 'Updating...' : 'Update Account' }}
                    </button>
                  </div>

                  <div v-if="profileFormError" class="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                    {{ profileFormError }}
                  </div>
                  <div v-if="profileFormSuccess" class="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                    {{ profileFormSuccess }}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- OFFICE HOURS MANAGEMENT SECTION -->
          <div v-if="activePage === 'office-hours'">
            <EditableOfficeHours />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>


<script setup>
/* eslint-disable no-unused-vars */
import { ref, reactive, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import initSocket from "../socket";
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminNavbar from '../components/AdminNavbar.vue';
import DashboardCard from '../components/DashboardCard.vue';
import EditableOfficeHours from '../components/EditableOfficeHours.vue';

const API_BASE_URL = "http://localhost:5000";
const router = useRouter();
const route = useRoute();
const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));

// Item details modal state
const selectedItem = ref(null);
const imageError = ref(false);
const reporterImageError = ref(false);

// Email change modal state
const showEmailChangedModal = ref(false);
const emailChangedTimer = ref(null);

// Logout helper function
const logoutToLogin = () => {
  localStorage.removeItem('token');
  router.push('/admin-login');
};

// ====================
// Persisted Page State
// ====================
const activePage = ref(localStorage.getItem('admin-active-page') || 'dashboard');
const activeReportTab = ref(localStorage.getItem('admin-active-report-tab') || 'Lost Reports');
watch(activePage, (newPage) => {
  localStorage.setItem('admin-active-page', newPage);
});
watch(activeReportTab, (newTab) => {
  localStorage.setItem('admin-active-report-tab', newTab);
});

// ====================
// Static Data
// ====================
const reportTabs = ["Lost Reports", "Found Reports", "Returned History"];



const handleSidebarSelect = (page) => {
  if (page === 'profile') {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push('/profile');
    }
    return;
  }
  activePage.value = page;
};

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/admin-dashboard') {
      activePage.value = 'dashboard';
    }
  },
  { immediate: true }
);

// ====================
// Reported Items
// ====================
const lostItems = ref([]);
const foundItems = ref([]);
const returnedHistory = ref([]);
const reportSearch = ref("");
const categoryFilter = ref("");
const statusFilter = ref("");

// ====================
// Users
// ====================
const users = ref([]);
const userSearch = ref("");
const userRoleFilter = ref("");
const selectedUser = ref(null);
const userModal = ref(false);
// ✅ Removed staffForm — no longer needed

// ====================
// Admin Profile Form ✅
// ====================
const profileForm = reactive({
  email: "",
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});
const profileFormError = ref("");
const profileFormSuccess = ref("");
const profileFormLoading = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// ====================
// Role & Delete Modal State
// ====================
const isRoleChangeModalOpen = ref(false);
const selectedRoleChangeUser = ref(null);
const targetRole = ref('');
const roleChangeMessage = ref('');
const userDeleteConfirmation = ref(false);
const selectedUserToDelete = ref(null);
const deleteConfirmation = ref(false);

// ====================
// Socket
// ====================
const socket = initSocket();
const autoDeletedIds = new Set();

// ====================
// Fetching
// ====================
const fetchItems = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/items`);
    const rawData = Array.isArray(res.data) ? res.data : [];
    const nextLost = [];
    const nextFound = [];
    const nextReturned = [];
    for (const record of rawData) {
      const item = { ...record, imageError: false, reporterImageError: false };
      const removed = await maybeAutoDeleteReturnedLost(item);
      if (removed) continue;
      if (item.type === "lost") nextLost.push(item);
      if (item.type === "found" && item.status !== "returned") nextFound.push(item);
      if (item.status === "returned") nextReturned.push(item);
    }
    lostItems.value = nextLost;
    foundItems.value = nextFound;
    returnedHistory.value = nextReturned;
  } catch (err) {
    console.error("Error fetching items:", err);
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/user`);
    const toRole = (role) => {
      if (!role) return "university_member";
      if (role === "security_staff") return "security";
      return role;
    };
    users.value = res.data.map((u) => ({ ...u, role: toRole(u.role) }));
  } catch (err) {
    console.error("Error fetching users:", err);
    alert("Failed to fetch users. Please refresh the page.");
  }
};

// ====================
// Users Management
// ====================
// User statistics
const totalSecurityStaff = computed(() => 
  users.value.filter(u => u.role === 'security').length
);

const totalUniversityMembers = computed(() => 
  users.value.filter(u => u.role === 'university_member').length
);

const filteredUsers = computed(() => {
  const search = userSearch.value?.trim().toLowerCase();
  const role = userRoleFilter.value;

  return users.value.filter(u => {
    // Role filter
    if (role) {
      // normalize roles used in UI: 'security' | 'admin' | 'university_member'
      if (u.role !== role) return false;
    }

    // Search filter
    if (!search) return true;
    return (
      u.full_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  });
});

const viewUser = (user) => {
  selectedUser.value = user;
  userModal.value = true;
};

const closeUserModal = () => {
  userModal.value = false;
  selectedUser.value = null;
};

const confirmUserDelete = (user) => {
  selectedUserToDelete.value = user;
  userDeleteConfirmation.value = true;
};

const cancelUserDelete = () => {
  userDeleteConfirmation.value = false;
  selectedUserToDelete.value = null;
};

const deleteUserConfirmed = async () => {
  try {
    const user = selectedUserToDelete.value;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Missing authentication token. Unable to delete user.");
      alert("Authentication required. Please log in again.");
      return;
    }

    // Check if trying to delete yourself
    if (user.id === currentUser.value?.id) {
      alert("You cannot delete your own account.");
      userDeleteConfirmation.value = false;
      selectedUserToDelete.value = null;
      return;
    }

    // Check if trying to delete another admin
    if (user.role === 'admin') {
      alert("Cannot delete an admin account.");
      userDeleteConfirmation.value = false;
      selectedUserToDelete.value = null;
      return;
    }

    await axios.delete(`${API_BASE_URL}/api/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Remove user from the list
    users.value = users.value.filter(u => u.id !== user.id);
    
    // Reset modal state
    userDeleteConfirmation.value = false;
    selectedUserToDelete.value = null;
    
    alert("User deleted successfully.");

  } catch (err) {
    console.error("Error deleting user:", err);
    alert(err.response?.data?.message || "Failed to delete user. Please try again.");
    userDeleteConfirmation.value = false;
    selectedUserToDelete.value = null;
  }
};

// ====================
// Role Change Logic
// ====================
const changeUserRole = (user, newRole) => {
  selectedRoleChangeUser.value = user;
  targetRole.value = newRole;
  isRoleChangeModalOpen.value = true;
  const roleName = newRole === 'security' ? 'Security Staff' : 'University Member';
  roleChangeMessage.value = `Are you sure you want to assign ${user.full_name || user.email} as ${roleName}?`;
};

const confirmRoleChange = async () => {
  try {
    const user = selectedRoleChangeUser.value;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/user/${user.id}/assign-role`,
      { role: targetRole.value },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const updatedUser = response.data.user;
    const index = users.value.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users.value.splice(index, 1, updatedUser);
    }
    
    isRoleChangeModalOpen.value = false;
    selectedRoleChangeUser.value = null;
    const roleName = targetRole.value === 'security' ? 'Security Staff' : 'University Member';
    alert(`${user.full_name || user.email} has been updated to ${roleName}.`);
    targetRole.value = '';
  } catch (error) {
    console.error("Error changing user role:", error);
    // ... error handling (kept as-is)
  }
};

const cancelRoleChange = () => {
  isRoleChangeModalOpen.value = false;
  selectedRoleChangeUser.value = null;
  targetRole.value = '';
};

// ====================
// ✅ Admin Account Update Function
// ====================
const updateAdminAccount = async () => {
  profileFormError.value = "";
  profileFormSuccess.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    profileFormError.value = "Authentication expired. Please sign in again.";
    setTimeout(() => { profileFormError.value = ""; }, 4000);
    return;
  }
  if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
    profileFormError.value = "New passwords do not match.";
    setTimeout(() => { profileFormError.value = ""; }, 4000);
    return;
  }
  profileFormLoading.value = true;
    try {
      const payload = {};
      if (profileForm.email) payload.email = profileForm.email.trim();
      if (profileForm.oldPassword) payload.oldPassword = profileForm.oldPassword;
      if (profileForm.newPassword) {
        payload.newPassword = profileForm.newPassword;
        // backend expects 'confirmPassword' for confirmation
        payload.confirmPassword = profileForm.confirmNewPassword;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/api/user/profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      // Reset form
      profileForm.email = "";
      profileForm.oldPassword = "";
      profileForm.newPassword = "";
      profileForm.confirmNewPassword = "";

      // If backend indicated verification required (email change), show message and keep session
      if (response.data?.needsVerification) {
        profileFormSuccess.value = response.data.message || 'Verification email sent. Please check your new email to confirm the change.';
        setTimeout(() => { profileFormSuccess.value = ""; }, 8000);
        return;
      }

      // For password changes (or other immediate updates), force re-login
      alert("Account updated. Please sign in again with your new credentials.");
      localStorage.removeItem('token');
      router.push('/admin-login');
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update account.";
      profileFormError.value = message;
      console.error("Error updating admin account:", err);
      setTimeout(() => { profileFormError.value = ""; }, 5000);
    } finally {
      profileFormLoading.value = false;
    }
};
const showAdminUpdate = ref(false);

// ====================
// Rest of logic (item management, stats, socket, etc.) remains unchanged
// ====================
const viewReporterProfile = (reporterId) => {
  if (reporterId) router.push(`/view-profile/${reporterId}`);
};

// Open the logged-in user's profile page (include id if available)
const openProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    if (stored && stored.id) {
      router.push(`/profile/${stored.id}`);
      return;
    }
  } catch (err) {
    // fall back to profile route without id
  }
  router.push('/profile');
};

const filteredReportItems = computed(() => {
  let items = [];
  if (activeReportTab.value === "Lost Reports") items = lostItems.value;
  else if (activeReportTab.value === "Found Reports") items = foundItems.value;
  else if (activeReportTab.value === "Returned History") items = returnedHistory.value;
  if (reportSearch.value) {
    items = items.filter(i =>
      i.name?.toLowerCase().includes(reportSearch.value.toLowerCase()) ||
      (i.student_id && i.student_id.includes(reportSearch.value))
    );
  }
  if (categoryFilter.value) items = items.filter(i => i.category === categoryFilter.value);
  if (statusFilter.value && activeReportTab.value === "Found Reports") {
    items = items.filter(i => i.status === statusFilter.value);
  }
  return items;
});

const viewItem = (item) => {
  selectedItem.value = item;
  imageError.value = false;
  reporterImageError.value = false;
};

const closeModal = () => {
  selectedItem.value = null;
  imageError.value = false;
  reporterImageError.value = false;
};

const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteConfirmation.value = true;
};

const deleteReportConfirmed = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/items/${selectedItem.value.id}`
    );
    const deletedIds = Array.isArray(response.data?.deleted_ids)
      ? response.data.deleted_ids
      : [selectedItem.value.id];
    deletedIds.forEach((deletedId) => {
      autoDeletedIds.add(deletedId);
      removeItemFromLists(deletedId);
    });
    deleteConfirmation.value = false;
    selectedItem.value = null;
  } catch (err) {
    console.error("Error deleting item:", err);
  }
};

const cancelDelete = () => {
  deleteConfirmation.value = false;
  selectedItem.value = null;
};

const removeItemFromLists = (id) => {
  lostItems.value = lostItems.value.filter(i => i.id !== id);
  foundItems.value = foundItems.value.filter(i => i.id !== id);
  returnedHistory.value = returnedHistory.value.filter(i => i.id !== id);
  if (selectedItem.value?.id === id) selectedItem.value = null;
};

async function maybeAutoDeleteReturnedLost(item) {
  if (!item || item.type !== "lost" || item.status !== "returned") return false;
  if (!item.id || autoDeletedIds.has(item.id)) return false;
  try {
    await axios.delete(`${API_BASE_URL}/api/items/${item.id}`);
    autoDeletedIds.add(item.id);
    removeItemFromLists(item.id);
    return true;
  } catch (err) {
    console.error("Error auto-deleting returned lost item:", err);
    return false;
  }
}

const formatDate = (datetime) =>
  new Date(datetime).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatStatus = (status) => {
  if (!status) return { text: 'Unknown', class: 'text-gray-500' };
  const statusText = status
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  
  switch (status.toLowerCase()) {
    case 'found':
      return { text: statusText, class: 'text-green-500' };
    case 'lost':
      return { text: statusText, class: 'text-red-500' };
    case 'claimed':
      return { text: statusText, class: 'text-blue-500' };
    case 'pending':
      return { text: statusText, class: 'text-yellow-500' };
    default:
      return { text: statusText, class: 'text-gray-500' };
  }
};

const totalReports = computed(() =>
  lostItems.value.length + foundItems.value.length + returnedHistory.value.length
);
const resolvedCount = computed(() =>
  foundItems.value.filter(i => i.status !== "pending").length +
  returnedHistory.value.length
);
const pendingCount = computed(() =>
  lostItems.value.filter(i => i.status === "pending").length +
  foundItems.value.filter(i => i.status === "pending").length
);

const unreadLostCount = ref(0);
const unreadFoundCount = ref(0);
const unreadReturnedCount = ref(0);

const getUnreadCount = (tab) => {
  switch (tab) {
    case "Lost Reports": return unreadLostCount.value;
    case "Found Reports": return unreadFoundCount.value;
    case "Returned History": return unreadReturnedCount.value;
    default: return 0;
  }
};

socket.on("newReport", async (report) => {
  const item = { ...report, imageError: false, reporterImageError: false };
  if (await maybeAutoDeleteReturnedLost(item)) return;
  if (item.type === "lost") lostItems.value.unshift(item);
  else if (item.type === "found") foundItems.value.unshift(item);
  else if (item.status === "returned") returnedHistory.value.unshift(item);
});

socket.on("reportUpdated", async (updatedReport) => {
  if (await maybeAutoDeleteReturnedLost(updatedReport)) return;
  const normalized = {
    ...updatedReport,
    imageError: false,
    reporterImageError: false,
  };
  removeItemFromLists(normalized.id);
  if (normalized.status === "returned") returnedHistory.value.unshift(normalized);
  else if (normalized.type === "found") foundItems.value.unshift(normalized);
  else lostItems.value.unshift(normalized);
});

socket.on("reportDeleted", ({ id }) => {
  removeItemFromLists(id);
});

onMounted(() => {
  fetchItems();
  fetchUsers();
  // If redirected here after email verification, capture token and show success
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'email-verified') {
      const newToken = params.get('token');
      if (newToken) {
        localStorage.setItem('token', newToken);
        profileFormSuccess.value = 'Email change verified and updated.';
        setTimeout(() => { profileFormSuccess.value = ''; }, 5000);
      }
      // Clean the query string to avoid repeating the message
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  } catch (err) {
    // ignore
  }

  // Check for email-changed status in query params
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'email-changed') {
      showEmailChangedModal.value = true;
      // Clean the query string
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
      // Auto-logout after 7 seconds if user doesn't click
      emailChangedTimer.value = setTimeout(() => {
        if (showEmailChangedModal.value) logoutToLogin();
      }, 7000);
    }
  } catch (err) {
    console.error('Error checking email change status:', err);
  }
});

onUnmounted(() => {
  if (emailChangedTimer.value) {
    clearTimeout(emailChangedTimer.value);
    emailChangedTimer.value = null;
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>