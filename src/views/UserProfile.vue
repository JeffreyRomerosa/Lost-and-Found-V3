<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center justify-center p-6 animate-fade-in relative"
  >
    <!-- ✅ Success Message -->
    <transition name="fade">
      <div
        v-if="showSuccess"
        class="fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 border border-green-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-semibold">{{ successMessageText }}</span>
      </div>
    </transition>

    <!-- Profile Card -->
    <div
      class="relative bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden text-center"
    >
      <div class="h-40 bg-gradient-to-r from-gray-900 to-gray-700"></div>

      <div class="pb-8 px-8 -mt-16 flex flex-col items-center">
        <!-- Profile Image -->
        <div class="relative mb-4">
          <img
            :src="profilePhoto"
            alt="Profile Photo"
            class="w-32 h-32 rounded-full border-4 border-yellow-400 object-cover shadow-lg"
          />
            <div class="absolute inset-0 flex items-end justify-end pr-2 pb-1">
              <label
                v-if="editMode"
                class="bg-yellow-500 text-black px-2 py-1 text-xs rounded cursor-pointer hover:bg-yellow-400 transition"
              >
                Change
                <input type="file" accept="image/*" @change="openCropper" class="hidden" />
              </label>

              <button v-else @click="showImageOptions = true" class="bg-gray-800 text-yellow-400 px-2 py-1 text-xs rounded hover:bg-gray-700">Options</button>
            </div>
        </div>

        <!-- Image Cropper Modal -->
        <div
          v-if="showCropper"
          class="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6"
        >
          <div class="bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-lg border border-gray-700">
            <h2 class="text-yellow-400 font-semibold text-lg mb-4 text-center">
              Adjust Your Profile Photo
            </h2>

            <div class="relative w-full h-80 bg-gray-800 rounded-xl overflow-hidden">
              <Cropper
                ref="cropperRef"
                :src="tempPhoto"
                class="w-full h-full border-2 border-yellow-400 rounded-lg"
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

            <div class="flex justify-center mt-6 gap-4">
              <button @click="saveCroppedImage" class="bg-yellow-500 text-black px-5 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition">
                Save
              </button>
              <button @click="cancelCrop" class="bg-gray-700 px-5 py-2 rounded-lg text-gray-200 hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Suggestion if profile is empty (only show for university members) -->
        <div v-if="userRole === 'university_member' && !editMode && !name && !department && !contactNumber && (!birthday || birthday === 'Not set')" class="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
          <strong>Please fill in your profile information.</strong>
          <div class="text-sm mt-1">Complete your Full Name, Department, Contact Number, Birthday and Profile Photo so you can use all features.</div>
        </div>

        <!-- Profile Info -->
        <div class="text-center mt-3 w-full">
          <div v-if="!editMode">
            <h1 class="text-3xl font-bold mb-1">{{ name }}</h1>
            <p class="text-gray-400 mb-2">{{ email }}</p>
            <p class="text-gray-300">{{ userType }}</p>
            <p class="text-gray-300">{{ department }}</p>
            <p class="text-gray-300">Contact: {{ contactNumber }}</p>
            <p class="text-gray-400">Birthday: {{ birthday }}</p>
          </div>

          <!-- Editable Fields -->
          <div v-else class="space-y-3 max-w-sm mx-auto">
            <input v-model="editableName" type="text" placeholder="Full Name" class="w-full p-2 rounded-lg text-black border border-gray-400 text-center" />
            <!-- Role is managed by administrators; display only here -->
            <div class="w-full p-2 rounded-lg text-black border border-gray-400 text-center bg-gray-100 text-sm text-gray-700">
              {{ userType }}
            </div>
            <input v-model="editableDepartment" type="text" placeholder="Department / Office" class="w-full p-2 rounded-lg text-black border border-gray-400 text-center" />
            <input v-model="editableContactNumber" type="tel" placeholder="Contact Number" class="w-full p-2 rounded-lg text-black border border-gray-400 text-center" />
            <input v-model="editableBirthday" type="date" class="w-full p-2 rounded-lg text-black border border-gray-400 text-center" />
          </div>

          <p class="text-gray-500 mt-3 text-sm">Member since: {{ createdAt }}</p>

          <!-- Buttons -->
          <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-center sm:gap-3">
            <button
              v-if="!editMode"
              @click="toggleEdit"
              class="px-6 py-2 rounded-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
            >
              Edit Profile
            </button>

            <div v-else class="flex items-center justify-center gap-3">
              <button @click="saveProfile" class="px-6 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-500 transition">
                Save
              </button>
              <button @click="cancelEdit" class="px-6 py-2 rounded-full bg-gray-600 text-white font-semibold hover:bg-gray-500 transition">
                Cancel
              </button>
            </div>
          </div>

          <!-- ✅ Back to Home Button -->
          <div class="mt-6 flex justify-center items-center text-gray-400">
            <router-link
              to="/userdashboard"
              class="flex flex-col items-center hover:text-yellow-400 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0-8H5m4 0h10" />
              </svg>
              Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Options Modal -->
    <div v-if="showImageOptions" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div class="bg-gray-900 p-6 rounded-2xl border border-yellow-400 w-full max-w-md text-center">
        <img :src="profilePhoto" alt="Profile" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-yellow-400" />
        <div class="flex justify-center gap-3">
          <label class="px-4 py-2 bg-yellow-500 text-black rounded cursor-pointer hover:bg-yellow-400 transition">
            Replace
            <input type="file" accept="image/*" @change="onReplaceImage" class="hidden" />
          </label>
          <button @click="onDeleteImage" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          <button @click="showImageOptions = false" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">Cancel</button>
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