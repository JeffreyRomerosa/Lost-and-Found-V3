<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
    <!-- Moved notification to always be rendered but hidden with opacity -->
    <div
      :class="[
        'fixed top-4 sm:top-8 right-4 sm:right-8 bg-emerald-500 dark:bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 border border-emerald-300 dark:border-emerald-400 transition-all duration-300',
        showSuccess ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      ]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span class="font-semibold text-sm sm:text-base">{{ successMessageText }}</span>
    </div>

    <!-- Main Container -->
    <div class="max-w-4xl mx-auto pb-20">
      <!-- Updated card styling with responsive padding and borders -->
      <div class="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden ">
        
        <!-- Profile Header with Image -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-white dark:to-gray-700">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <!-- Profile Image -->
            <div class="relative flex-shrink-0">
              <img
                :src="profilePhoto"
                alt="Profile Photo"
                class="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-yellow-400 dark:border-yellow-400 object-cover shadow-lg"
              />
              <div v-if="editMode" class="absolute inset-0 flex items-end justify-end p-1">
                <label
                  class="bg-yellow-500 text-gray-900 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full cursor-pointer hover:bg-yellow-400 transition duration-300 font-semibold"
                >
                  Change
                  <input type="file" accept="image/*" @change="onReplaceImage" class="hidden" />
                </label>
                <button @click="onDeleteImage" class="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full cursor-pointer hover:bg-red-400 transition duration-300 font-semibold ml-2">
                  Delete
                </button>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-yellow-400 mb-1">{{ name || 'Unnamed User' }}</h1>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">{{ email }}</p>
              <div v-if="editMode" class="space-y-3">
                <input 
                  v-model="editableName" 
                  type="text" 
                  placeholder="Full Name" 
                  class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Image Cropper Modal -->
        <div
          v-show="showCropper"
          class="fixed inset-0 bg-black/80 dark:bg-black/90 flex flex-col items-center justify-center z-50 p-4"
        >
          <div class="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
            <h2 class="text-yellow-600 dark:text-yellow-400 font-semibold text-lg mb-4 text-center">Adjust Your Profile Photo</h2>

            <div class="relative w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Cropper
                v-if="tempPhoto"
                ref="cropperRef"
                :src="tempPhoto"
                class="w-full h-full"
                :stencil-props="{
                  aspectRatio: 1,
                  movable: true,
                  resizable: true,
                  handlers: true,
                  lines: true,
                  aspectRatioLocked: true
                }"
                :stencil-size="{ width: 250, height: 250 }"
                :auto-zoom="true"
                image-restriction="stencil"
              />
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button @click="saveCroppedImage" class="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition duration-300 text-sm sm:text-base">
                Save
              </button>
              <button @click="cancelCrop" class="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 font-semibold text-sm sm:text-base">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Personal Details Section -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-yellow-400 mb-6">Personal Details</h2>

          <div v-if="!editMode" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- Full Name -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ name || 'Not set' }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Email</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ email || 'Not set' }}</p>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Date of Birth</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ birthday || 'Not set' }}</p>
            </div>

            <!-- Gender -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Gender</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ gender || 'Not set' }}</p>
            </div>

            <!-- Department -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Department</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ department || 'Not set' }}</p>
            </div>

            <!-- Nationality -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Nationality</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ nationality || 'Not set' }}</p>
            </div>

            <!-- Address -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Address</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ address || 'Not set' }}</p>
            </div>

            <!-- Phone Number -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Phone Number</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ contactNumber || 'Not set' }}</p>
            </div>

            <!-- User Type -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">User Type</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ userType }}</p>
            </div>

            <!-- Member Since -->
            <div>
              <label class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Member Since</label>
              <p class="text-sm sm:text-base text-gray-900 dark:text-white mt-1">{{ createdAt }}</p>
            </div>
          </div>

          <!-- Edit Mode Form -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <input 
              v-model="editableName" 
              type="text" 
              placeholder="Full Name" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableDepartment" 
              type="text" 
              placeholder="Department / Office" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableContactNumber" 
              type="tel" 
              placeholder="Contact Number" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableBirthday" 
              type="date" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableGender" 
              type="text" 
              placeholder="Gender" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableNationality" 
              type="text" 
              placeholder="Nationality" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
            <input 
              v-model="editableAddress" 
              type="text" 
              placeholder="Address" 
              class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-900 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
            />
          </div>
        </div>

      

    
        <!-- Action Buttons -->
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row gap-3 items-center justify-center sm:justify-end">
          <button
            v-if="!editMode"
            @click="toggleEdit"
            class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition duration-300 shadow-md text-sm sm:text-base"
          >
            Edit Profile
          </button>

           

          <template v-else>
            <button 
              @click="saveProfile" 
              class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition duration-300 shadow-md text-sm sm:text-base"
            >
              Save Changes
            </button>
            <button 
              @click="cancelEdit" 
              class="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-300 text-sm sm:text-base"
            >
              Cancel
            </button>
          </template>
        </div>

        <!-- Back to Dashboard -->
        <div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <router-link
            to="/userdashboard"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition duration-300 font-semibold text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0-8H5m4 0h10" />
            </svg>
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { Cropper } from "vue-advanced-cropper";
import { disconnectSocket } from "../socket";
import "vue-advanced-cropper/dist/style.css";

const router = useRouter();
const route = useRoute();
const API_URL = "http://localhost:5000/api/profile";

const redirectToLogin = () => {
  disconnectSocket();
  localStorage.clear();
  router.push("/login");
};

// Profile state
const name = ref("");
const email = ref("");
const userType = ref("");
const userRole = ref("");
const department = ref("");
const contactNumber = ref("");
const birthday = ref(""); // ← will show formatted date
const createdAt = ref("");
const profilePhoto = ref("https://via.placeholder.com/150");

// Editable state
const editableName = ref("");
// editableUserType removed: role is managed server-side; users cannot change role here
const editableDepartment = ref("");
const editableContactNumber = ref("");
const editableBirthday = ref(""); // ← raw YYYY-MM-DD for input
const selectedFile = ref(null);

const editMode = ref(false);
const showCropper = ref(false);
const showSuccess = ref(false);
const tempPhoto = ref(null);
const cropperRef = ref(null);
const successMessageText = ref("Profile updated successfully!");

// ✅ Fetch profile safely with backend base URL
const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return redirectToLogin();
    }

    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;

    name.value = data.full_name;
    email.value = data.email;
    // Derive a displayable role from the stored role field
    if (data.role) {
      if (data.role === 'admin') userType.value = 'Administrator';
      else if (data.role === 'security') userType.value = 'Security Staff';
      else if (data.role === 'university_member') userType.value = 'University Member';
      else userType.value = data.role;
    } else {
      userType.value = '';
    }
    // store raw role for conditional UI logic
    userRole.value = data.role || '';
    department.value = data.department;
    contactNumber.value = data.contact_number;

    // ✅ Format birthday for display (e.g., "April 18, 2003")
    if (data.birthday) {
      const date = new Date(data.birthday);
      birthday.value = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      birthday.value = "Not set";
    }

    createdAt.value = new Date(data.created_at || data.updated_at).toLocaleDateString();

    // ✅ Profile photo
    if (data.profile_picture) {
      const normalizedPath = data.profile_picture.replace(/^\/?uploads\//, "/uploads/");
      profilePhoto.value = `http://localhost:5000${normalizedPath}`;
    } else {
      profilePhoto.value = "https://via.placeholder.com/150";
    }

    // Editable fields
    editableName.value = name.value;
    editableDepartment.value = department.value;
    editableContactNumber.value = contactNumber.value;
    // Keep raw value for date input (YYYY-MM-DD)
    editableBirthday.value = data.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "";

    // If user was redirected here to complete profile, open edit mode automatically
    try {
      const nextPath = route.query?.next;
      const isIncomplete = !data.full_name || !data.department || !data.contact_number || !data.birthday || !data.profile_picture;
      if (nextPath && isIncomplete) {
        editMode.value = true;
      }
    } catch (err) {
      // ignore
    }

  } catch (err) {
    console.error("Failed to fetch profile:", err.message);
    if (err.response?.status === 401) {
      redirectToLogin();
    }
  }
};

// Cropper functions
const openCropper = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    tempPhoto.value = event.target.result;
    showCropper.value = true;
  };
  reader.readAsDataURL(file);
};

const saveCroppedImage = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    canvas.toBlob((blob) => {
      selectedFile.value = new File([blob], "profile.png", { type: "image/png" });
      profilePhoto.value = URL.createObjectURL(selectedFile.value);
      showCropper.value = false;
    }, "image/png");
  }
};

// ✅ Save profile safely
const saveProfile = async () => {
  try {
    const token = localStorage.getItem("token");
  if (!token) return redirectToLogin();

    const formData = new FormData();
    formData.append("full_name", editableName.value);
    // role/user_type is not editable via this form (managed by admin)
    formData.append("department", editableDepartment.value);
    formData.append("contact_number", editableContactNumber.value);
    formData.append("birthday", editableBirthday.value);
    if (selectedFile.value) formData.append("profile_picture", selectedFile.value);

    const response = await axios.post(`${API_URL}/save`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedUser = response.data?.user || null;
    if (updatedUser) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null") || {};

        // Normalize profile_picture to full URL so other pages can use it immediately
        let normalizedProfilePicture = null;
        if (updatedUser.profile_picture) {
          const normalizedPath = updatedUser.profile_picture.replace(/^\/?uploads\//, "/uploads/");
          normalizedProfilePicture = `http://localhost:5000${normalizedPath}`;
          // update local display immediately
          profilePhoto.value = normalizedProfilePicture;
        }

        const nextUser = { ...storedUser, ...updatedUser };
        if (normalizedProfilePicture) nextUser.profile_picture = normalizedProfilePicture;
        localStorage.setItem("user", JSON.stringify(nextUser));
      } catch (err) {
        console.error("Failed to sync updated user in storage:", err);
      }
    }

    showSuccess.value = true;
  editMode.value = false;
  successMessageText.value = 'Your profile information has been successfully made.';
    fetchProfile();
    setTimeout(() => (showSuccess.value = false), 3000);

    // If user was redirected here to complete their profile, send them back
    // to the original page after successful save.
    try {
      const nextPath = route.query?.next;
      if (nextPath) {
        // remove query from URL then navigate
        router.replace({ path: '/profile' }).catch(() => {});
        router.push(String(nextPath)).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to redirect after profile save:', err);
    }

  } catch (err) {
    console.error("Error saving profile:", err.message);
    if (err.response?.status === 401) {
      redirectToLogin();
    }
  }
};

const cancelCrop = () => (showCropper.value = false);
const toggleEdit = () => (editMode.value = true);
const cancelEdit = () => (editMode.value = false);

onMounted(fetchProfile);

// Image options for profile page
const showImageOptions = ref(false);

const onReplaceImage = (e) => {
  // reuse existing cropper flow
  openCropper(e);
  showImageOptions.value = false;
};

const onDeleteImage = async () => {
  const token = localStorage.getItem('token');
  try {
    if (token) {
      // attempt backend delete (best-effort)
      await axios.delete(`${API_URL}/photo`, { headers: { Authorization: `Bearer ${token}` } });
    }
  } catch (err) {
    // ignore error; we'll still remove locally
    console.warn('Delete profile photo API failed, continuing with local removal.', err?.message || err);
  }
  // clear local display and refetch profile to sync
  profilePhoto.value = 'https://via.placeholder.com/150';
  try { await fetchProfile(); } catch (e) { /* ignore */ }
  showImageOptions.value = false;
};
</script>