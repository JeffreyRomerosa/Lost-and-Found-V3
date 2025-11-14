<template>
  <div
    class="relative min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center pb-24 pt-20 transition-colors duration-200"
  >
    <!-- Header with step indicator -->
    <div class="w-full max-w-4xl px-6 mb-12">
      <div class="flex justify-between items-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          <text-balance>Find Your Lost Item</text-balance>
        </h1>
        

           <!-- Added step progress indicator -->
        <div v-if="step > 1" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">Step {{ step }} of 4</span>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="mt-8 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1">
        <div
          class="bg-emerald-500 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${(step / 4) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Step 1: Choose Category -->
    <div v-if="step === 1" class="w-full max-w-2xl px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          What did you lose?
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Select the type of item to help us find it faster
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Redesigned category buttons with better styling and icons -->
        <button
          @click="selectCategory('id')"
          class="p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-900 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">🎓</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Student ID</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Scan or enter your ID number</p>
        </button>

        <button
          @click="selectCategory('general')"
          class="p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-900 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">General Item</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Describe or show your item</p>
        </button>
      </div>
    </div>

    <!-- Step 2: Choose Search Method -->
    <div v-if="step === 2" class="w-full max-w-2xl px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          How would you like to search?
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ category === 'id' ? 'Choose how to identify your Student ID' : 'Pick your preferred search method' }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Redesigned method selection with better visual hierarchy -->
        <button
          @click="selectMethod('image')"
          class="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Image</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ category === 'id' ? 'Scan QR code' : 'Use AI to detect items' }}
          </p>
        </button>

        <button
          @click="selectMethod('manual')"
          class="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 border-2 border-emerald-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 text-left group"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">✏️</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Manual Entry</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ category === 'id' ? 'Type ID number' : 'Describe the item' }}
          </p>
        </button>
      </div>

      <!-- Better back button styling -->
      <div class="mt-8 flex justify-center">
        <button
          @click="step = 1"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Category
        </button>
      </div>
    </div>

    <!-- Step 3A: Upload Image for General Items (AI-assisted) -->
    <div
      v-if="step === 3 && searchMethod === 'image' && category === 'general'"
      class="w-full max-w-4xl px-6"
    >
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Describe your item with a photo
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Upload a clear image and AI will help detect what you lost
        </p>
      </div>

      <!-- Improved two-column layout with better visual separation -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left column: Upload -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Your Photo
          </label>
          <div class="mb-6">
            <div class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
              <input
                type="file"
                @change="handleImageUpload"
                id="file"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div v-if="!previewImageCurrent" class="py-12">
                <div class="text-4xl mb-3">📷</div>
                <p class="text-gray-900 dark:text-white font-medium">Click or drag to upload</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <div v-else class="relative">
                <img :src="previewImageCurrent" alt="Preview" class="w-full h-64 object-cover rounded-lg" />
              </div>
            </div>
          </div>
        

          <form @submit.prevent="submitForm" class="space-y-3">
            <button
              type="submit"
              :disabled="!hasSelectedFile"
              :class="hasSelectedFile 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'"
              class="w-full py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {{ hasSelectedFile ? 'Analyze Image' : 'Select an image first' }}
            </button>
          </form>
        </div>

        <!-- Right column: Results -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            AI Detection Result
          </label>
          <div class="space-y-4">
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50 min-h-64 flex items-center justify-center">
              <template v-if="predictedImage">
                <img :src="'data:image/jpeg;base64,' + predictedImage" alt="Prediction Result" class="w-full h-full object-cover rounded-lg" />
              </template>
              <template v-else>
                <div class="text-center text-gray-500 dark:text-gray-400">
                  <div class="text-4xl mb-2">🔍</div>
                  <p>Results will appear here</p>
                </div>
              </template>
            </div>

            <div v-if="classNames" class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Detected Object</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ classNames }}</p>
              <p v-if="detectedConfidence" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Confidence: {{ detectedConfidence }}
              </p>
            </div>

            <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p class="text-red-700 dark:text-red-400 text-sm">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <button
          @click="step = 2"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>
      </div>
    </div>

    <!-- Step 3B: Upload Student ID Image (QR scan) -->
    <div
      v-if="step === 3 && searchMethod === 'image' && category === 'id'"
      class="w-full max-w-4xl px-6"
    >
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Scan your Student ID
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Take a clear photo of the QR code on your Student ID
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Upload -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            ID Photo
          </label>
          <div class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer group mb-4">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div v-if="!previewImageCurrent" class="py-12">
              <div class="text-4xl mb-3">🎓</div>
              <p class="text-gray-900 dark:text-white font-medium">Upload ID photo</p>
            </div>
            <div v-else class="relative">
              <img :src="previewImageCurrent" alt="ID Preview" class="w-full h-64 object-cover rounded-lg" />
            </div>
          </div>

          <button
            type="button"
            @click="resetIdUpload"
            v-if="selectedFileId"
            class="w-full py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Image
          </button>
        </div>

        <!-- QR Results -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Detected Student ID
          </label>
          <div class="space-y-4">
            <!-- Status -->
            <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Scan Status</p>
              <div class="space-y-2">
                <p v-if="isExtractingQR" class="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-2">
                  <span class="animate-spin">⏳</span> Analyzing QR code...
                </p>
                <p v-else-if="qrDetected" class="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <span>✅</span> QR code detected!
                </p>
                <p v-else-if="qrDetectionFailed" class="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> No QR code found
                </p>
                <p v-if="qrErrorMessage" class="text-red-600 dark:text-red-400 text-sm">{{ qrErrorMessage }}</p>
              </div>
            </div>

            <!-- Student ID Input -->
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Student ID Number</label>
              <input
                v-model="studentId"
                @input="formatStudentId"
                placeholder="e.g. 221-01878"
                class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p v-if="studentId && !isValidStudentId" class="text-red-600 dark:text-red-400 text-sm mt-2">
                ❌ Format: 3 digits + dash + 5 digits
              </p>
            </div>

            <!-- Search Button -->
            <button
              type="button"
              :disabled="isExtractingQR || !studentId || !isValidStudentId"
              @click="performSearch"
              class="w-full py-3 px-4 rounded-lg font-semibold transition-colors"
              :class="(isExtractingQR || !studentId || !isValidStudentId)
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
            >
              Search Using Student ID
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <button
          @click="step = 2"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>
      </div>
    </div>

    <!-- Step 3C: Manual Input -->
    <div
      v-if="step === 3 && searchMethod === 'manual'"
      class="w-full max-w-2xl px-6"
    >
      <div class="text-center mb-10">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ category === 'id' ? 'Enter Your Student ID' : 'Describe Your Item' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ category === 'id' ? 'Type your student ID number to search' : 'Tell us what you lost' }}
        </p>
      </div>

      <div class="space-y-6">
        <!-- Student ID Input -->
        <div v-if="category === 'id'">
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Student ID Number
          </label>
          <input
            v-model="studentId"
            @input="formatStudentId"
            placeholder="e.g. 221-01878"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p v-if="studentId && !isValidStudentId" class="text-red-600 dark:text-red-400 text-sm mt-2">
            ❌ Format: 3 digits + dash + 5 digits (e.g. 221-01878)
          </p>
        </div>

        <!-- Item Name Input -->
        <div v-if="category === 'general'" class="relative">
          <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Item Name
          </label>
          <input
            v-model="itemName"
            @input="filterSuggestions"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
            placeholder="e.g. Black Umbrella, Silver Laptop"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-lg text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          
          <!-- Suggestions Dropdown -->
          <ul
            v-if="showSuggestions && filteredSuggestions && filteredSuggestions.length"
            class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <li
              v-for="(suggestion, index) in filteredSuggestions"
              :key="index"
              @mousedown.prevent="selectSuggestion(suggestion)"
              class="px-4 py-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300 transition-colors"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- Search Button -->
        <button
          :disabled="(category === 'id' && !isValidStudentId) || (category === 'general' && !itemName)"
          @click="performSearch"
          class="w-full py-4 px-6 rounded-lg font-semibold transition-colors"
          :class="((category === 'id' && !isValidStudentId) || (category === 'general' && !itemName))
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-600 text-white'"
        >
          Start Search
        </button>
      </div>

      <div class="mt-8 flex justify-center">
        <button
          @click="step = 2"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back
        </button>
      </div>
    </div>

    <!-- Step 4: Results -->
    <div v-if="step === 4" class="w-full max-w-6xl px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Search Results
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ results.length > 0 ? `Found ${results.length} matching item${results.length !== 1 ? 's' : ''}` : noResultsMessage }}
        </p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block">
          <div class="animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>

      <!-- Results Grid -->
      <div
        v-if="!loading && results.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        <!-- Improved result card styling with better visual hierarchy -->
        <div
          v-for="(item, index) in results"
          :key="index"
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-lg/50 transition-shadow duration-300"
        >
          <div class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 h-48">
            <img
              :src="formatImageUrl(item.image_url)"
              alt="Found Item"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 blur-sm"
            />
          </div>
          <div class="p-5">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.name }}</h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <!-- If this result represents a Student ID item, show student details -->
              <template v-if="item.student_id">
                <p class="flex items-center gap-2">
                  <span class="text-emerald-500">🎓</span>
                  <span class="text-gray-900 dark:text-white font-medium">{{ item.name }}</span>
                </p>
                <p class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span>🎫</span> ID: {{ item.student_id }}
                </p>
                <p class="flex items-center gap-2">
                  <span>📄</span> Type: ID
                </p>
                <p class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <span>🔒</span> In custody of the security office
                </p>
              </template>

              <!-- Otherwise treat as a general item: show name, brand, and custody status -->
              <template v-else>
                <p class="flex items-center gap-2">
                  <span class="text-amber-500">📦</span> {{ item.name }}
                </p>
                <p v-if="item.brand" class="flex items-center gap-2">
                  <span>🏷️</span> Brand: {{ item.brand }}
                </p>
                <p class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <span>🔒</span> In custody of the security office
                </p>
              </template>
            </div>
            <div class="mt-4 flex items-center gap-3 px-5">
              <button
                @click="openClaimModal(item)"
                class="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-0.5"
              >
                I want to claim this item
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results Message -->
      <div v-if="!loading && results.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-8">{{ noResultsMessage }}</p>
      </div>

      <!-- New Search Button -->
      <div class="flex justify-center">
        <button
          @click="resetSearch"
          class="py-3 px-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
        >
          Start New Search
        </button>
      </div>
    </div>
    
    <!-- Claim Request Modal (uses existing logic in script) -->
    <div
      v-if="showClaimModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4 py-6"
      @click="closeClaimModal"
    >
      <div
        @click.stop
        class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl animate-fade-in"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Claim Item</h3>
          <button @click="closeClaimModal" class="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <div class="flex items-center gap-4 mb-4">
            <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
              <img v-if="selectedClaimItem && selectedClaimItem.image_url" :src="formatImageUrl(selectedClaimItem.image_url)" alt="item" class="w-full h-full object-cover" />
            </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">You are claiming:</p>
            <p class="font-semibold text-gray-900 dark:text-white">{{ selectedClaimItem && selectedClaimItem.name }}</p>
          </div>
        </div>

        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Message (optional)</label>
        <textarea
          v-model="claimMessage"
          rows="4"
          class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none mb-3"
          placeholder="Add a short message for the security office (e.g. where you lost it, contact info)"
        ></textarea>

        <div v-if="claimError" class="text-sm text-red-600 dark:text-red-400 mb-3">{{ claimError }}</div>
        <div v-if="claimSuccess" class="text-sm text-green-600 dark:text-green-400 mb-3">{{ claimSuccess }}</div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeClaimModal"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitClaim"
            :disabled="isSubmittingClaim"
            class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors disabled:opacity-60"
          >
            {{ isSubmittingClaim ? 'Submitting...' : 'Confirm Claim' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import axios from "axios";
import jsQR from "jsqr";

export default {
  name: "SearchPage",
  data() {
    return {
      predictedImage: null, // Holds the base64 image returned by Flask
      errorMessage: '', // Holds any error message
      classNames: '', // Holds the single classname string returned by Flask (top detection)
      detectedConfidence: null, // Confidence value for the returned classname
      step: 1,
      category: null,
      searchMethod: null,
      selectedFile: null,  // Holds the selected file
    // Separate storage for ID vs General uploads
    selectedFileId: null,
    selectedFileGeneral: null,
    previewImageId: null,
    previewImageGeneral: null,
    previewImage: null,
      studentId: "",
      itemName: "",
      results: [],
      loading: false,
      showNotifications: false,
      showProfileMenu: false,
      notifications: [],
      user: null,
      reporterId: null,
      sourceItemId: null,
      showSuggestions: false,
      filteredSuggestions: [],
      itemSuggestions: [
        "Airpods", "Backpack", "Cap", "Eyeglasses", "Flash Drive", "Handbag",
        "Handheld Mini Fan", "Headphone", "Helmet", "Laptop", "Laptop Briefcase",
        "Laptop Charger", "Motorcycle keys", "Phone Charger", "Powerbank",
        "Scientific Calculator", "Sling bag", "Smart Watch", "Smartphone",
        "Sunglasses", "T-square Ruler", "Tablet", "Tote bag", "Tumbler",
        "Umbrella", "Wallet", "Watch"
      ],
      isExtractingQR: false,
      qrDetected: false,
      qrDetectionFailed: false,
      qrErrorMessage: "",
      showClaimModal: false,
      selectedClaimItem: null,
      claimMessage: "",
      isSubmittingClaim: false,
      claimError: "",
      claimSuccess: "",
    };
  },
  computed: {
    unreadNotificationCount() {
      return this.notifications.filter((n) => !n.is_read).length;
    },
    profileInitial() {
      return this.user?.full_name?.[0]?.toUpperCase() || "U";
    },
    isValidStudentId() {
      return /^\d{3}-\d{5}$/.test(this.studentId);
    },
    noResultsMessage() {
      // Show a helpful message depending on what the user searched for
      if (this.category === 'id') {
        return 'Student ID not found in security custody yet.';
      }

      if (this.category === 'general') {
        return 'This object is not found yet.';
      }

      return 'No matching items found.';
    },
    // Shows the preview image for the currently active category
    previewImageCurrent() {
      if (this.category === 'id') return this.previewImageId || null;
      if (this.category === 'general') return this.previewImageGeneral || null;
      return this.previewImage;
    },
    // Whether a file is selected for the active category
    hasSelectedFile() {
      if (this.category === 'id') return !!this.selectedFileId;
      if (this.category === 'general') return !!this.selectedFileGeneral;
      return !!this.selectedFile;
    },
  },
  methods: {
    // Small helper to retry fetch requests for a short period while backend starts
    async fetchWithRetry(url, options = {}, retries = 6, delayMs = 500) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, options);
          return res;
        } catch (err) {
          // Only retry on network errors (connection refused). If last try, rethrow.
          if (i === retries - 1) throw err;
          // Wait and retry
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 1.5;
        }
      }
    },

    // Resolve image URLs stored in DB to full backend URLs when needed
    formatImageUrl(url) {
      if (!url) return "";
      // If already absolute or a data URI, return as-is
      if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;

      // Ensure the path starts with a single '/'
      const normalized = url.startsWith("/") ? url : "/" + url;

      // Backend base (matches other files in the project)
      const API_BASE = "http://localhost:5000";

      return `${API_BASE}${normalized}`;
    },

    // Handle form submission
    async submitForm() {
      if (this.category !== 'general') {
        return;
      }
      const fileToUpload = this.selectedFileGeneral;

      if (!fileToUpload) {
        this.errorMessage = 'Please select an image for upload before starting prediction.';
        return;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload); // Append the selected file
      // include category so backend can differentiate if needed
      formData.append('category', this.category || 'general');

      try {
        const response = await this.fetchWithRetry('http://localhost:8080/predict_yolo', {
          method: 'POST',
          body: formData,
        });

        // If the response is not JSON or not OK, try to show useful message
        let result = null;
        try {
          result = await response.json();
        } catch (e) {
          // Non-JSON response
          result = null;
        }

        if (response.ok) {
          this.predictedImage = result?.image || null;
          // Backend now returns detections as array of objects [{classname, confidence}, ...]
          if (result?.detections && result.detections.length > 0) {
            const top = result.detections[0];
            // Support both {classname} or legacy {name} or simple string
            this.classNames = top.classname || top.name || (typeof top === 'string' ? top : '');
            this.detectedConfidence = top.confidence ?? null;
          } else {
            this.classNames = '';
            this.detectedConfidence = null;
          }
          this.errorMessage = '';
          // If category is general, set detected class as itemName so user can search by it
          if (this.category === 'general' && this.classNames) {
            this.itemName = this.classNames;
            // Automatically perform search using the predicted class
            try {
              // small delay to allow UI to update (optional)
              await new Promise((r) => setTimeout(r, 200));
              await this.performSearch();
            } catch (e) {
              console.error('Auto-search after prediction failed:', e);
            }
          }
        } else {
          this.predictedImage = null;
          this.classNames = '';
          this.detectedConfidence = null;
          // Prefer backend message if present
          this.errorMessage = (result && (result.error || result.message)) || 'Error occurred during prediction';
          console.error('Prediction error response:', result);
        }
      } catch (error) {
        // Network or retry-exhausted
        this.predictedImage = null;
        this.classNames = '';
        this.detectedConfidence = null;
        this.errorMessage = 'Could not reach prediction server. Please ensure the model server is running.';
        console.error('Request failed:', error);
      }
    },
    selectCategory(cat) {
      this.category = cat;
      this.step = 2;
    },
    selectMethod(method) {
      this.searchMethod = method;
      this.step = 3;
    },
    formatStudentId() {
      let val = this.studentId.replace(/\D/g, "");
      if (val.length > 3) val = val.slice(0, 3) + "-" + val.slice(3);
      if (val.length > 9) val = val.slice(0, 9);
      this.studentId = val;
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (this.category === 'id') {
        if (this.previewImageId) {
          URL.revokeObjectURL(this.previewImageId);
        }
        this.resetQrState(true);
        this.selectedFileId = file;
        this.previewImageId = URL.createObjectURL(file);
        this.scanQrFromFile(file);
      } else if (this.category === 'general') {
        if (this.previewImageGeneral) {
          URL.revokeObjectURL(this.previewImageGeneral);
        }
        this.selectedFileGeneral = file;
        this.previewImageGeneral = URL.createObjectURL(file);
      } else {
        // fallback to generic slot
        if (this.previewImage) {
          URL.revokeObjectURL(this.previewImage);
        }
        this.selectedFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
      // clear previous prediction when a new file is chosen
      this.predictedImage = null;
      this.classNames = '';
      this.detectedConfidence = null;
      this.errorMessage = '';
    },
    async readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result);
        reader.onerror = () => reject(new Error('Failed to read file as data URL'));
        reader.readAsDataURL(file);
      });
    },
    async scanQrFromFile(file) {
      this.isExtractingQR = true;
      this.qrDetected = false;
      this.qrDetectionFailed = false;
      this.qrErrorMessage = '';

      try {
        const dataUrl = await this.readFileAsDataURL(file);
        const qrRawData = await this.extractQRFromImage(dataUrl);

        if (qrRawData) {
          const extractedId = this.extractStudentIdFromQR(qrRawData);
          if (extractedId) {
            this.studentId = extractedId;
            this.qrDetected = true;
          } else {
            this.qrDetectionFailed = true;
            this.qrErrorMessage = 'QR detected but no valid student ID was found.';
          }
        } else {
          this.qrDetectionFailed = true;
          this.qrErrorMessage = 'No QR code detected in the image.';
        }
      } catch (error) {
        console.error('Error scanning QR:', error);
        this.qrDetectionFailed = true;
        this.qrErrorMessage = 'Unable to process the image. Please try another photo.';
      } finally {
        this.isExtractingQR = false;
      }
    },
    async extractQRFromImage(imageDataUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Unable to access canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            resolve(qrCode?.data || null);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for QR extraction'));
        img.crossOrigin = 'anonymous';
        img.src = imageDataUrl;
      });
    },
    extractStudentIdFromQR(qrText) {
      if (!qrText) return null;
      const patterns = [
        /(\d{3}-\d{5})/,
        /CSU[-\s]?(\d{3}-\d{5})/i,
        /ID[:\s]?(\d{3}-\d{5})/i,
        /Student[:\s]?(\d{3}-\d{5})/i,
        /(\d{8})/,
      ];

      for (const pattern of patterns) {
        const match = qrText.match(pattern);
        if (match) {
          let studentId = match[1];
          if (studentId.length === 8 && !studentId.includes('-')) {
            studentId = `${studentId.substring(0, 3)}-${studentId.substring(3)}`;
          }
          return studentId;
        }
      }

      return null;
    },
    filterSuggestions() {
      const input = this.itemName.toLowerCase();
      this.filteredSuggestions = this.itemSuggestions.filter((item) =>
        item.toLowerCase().includes(input)
      );
    },
    selectSuggestion(suggestion) {
      this.itemName = suggestion;
      this.showSuggestions = false;
    },
    hideSuggestions() {
      setTimeout(() => (this.showSuggestions = false), 150);
    },
    async performSearch() {
      // Clear previous errors and show loading UI
      this.errorMessage = '';
      this.loading = true;
      this.results = [];

      // Move to results area so user sees searching state
      this.step = 4;

      try {
        // Validate inputs based on selected category
        if (this.category === 'id') {
          if (!this.isValidStudentId) {
            this.errorMessage = 'Invalid Student ID format. Use XXX-XXXXX.';
            this.loading = false;
            return;
          }

          // Send both studentId and legacy query to be robust
          const params = { studentId: this.studentId, query: this.studentId };
          if (this.sourceItemId) params.source_item_id = this.sourceItemId;
          const reporterId = this.reporterId || this.user?.id;
          if (reporterId) params.reporter_id = reporterId;
          const resp = await axios.get('http://localhost:5000/api/items/search', {
            params,
          });

          this.results = resp.data || [];
          return;
        }

        if (this.category === 'general') {
          if (!this.itemName || !this.itemName.trim()) {
            this.errorMessage = 'Please enter an item name to search.';
            this.loading = false;
            return;
          }

          // Send itemName param so backend can filter by item name
          const trimmed = this.itemName.trim();

          // Send both itemName (new param) and query (legacy) to be robust while debugging
          const params = { itemName: trimmed, query: trimmed };
          if (this.sourceItemId) params.source_item_id = this.sourceItemId;
          const reporterId = this.reporterId || this.user?.id;
          if (reporterId) params.reporter_id = reporterId;
          const resp = await axios.get('http://localhost:5000/api/items/search', {
            params,
          });
          this.results = resp.data || [];
          return;
        }

        // Fallback: no category selected
        this.errorMessage = 'Please select a category and search method.';
      } catch (err) {
        console.error('Error searching items:', err);
        // Prefer backend message if present
        if (err.response && err.response.data && err.response.data.message) {
          this.errorMessage = err.response.data.message;
        } else {
          this.errorMessage = 'An error occurred while searching. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.step = 1;
      this.category = null;
      this.searchMethod = null;
      // clear both upload states
      if (this.previewImageId) {
        URL.revokeObjectURL(this.previewImageId);
      }
      if (this.previewImageGeneral) {
        URL.revokeObjectURL(this.previewImageGeneral);
      }
      if (this.previewImage) {
        URL.revokeObjectURL(this.previewImage);
      }
      this.previewImage = null;
      this.previewImageId = null;
      this.previewImageGeneral = null;
      this.selectedFile = null;
      this.selectedFileId = null;
      this.selectedFileGeneral = null;
      this.studentId = "";
      this.itemName = "";
      this.results = [];
      this.predictedImage = null;
      this.classNames = '';
      this.detectedConfidence = null;
      this.errorMessage = '';
      this.resetQrState(true);
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    goToProfile() {
      this.$router.push("/profile");
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    },
    resetQrState(clearStudentId = false) {
      this.isExtractingQR = false;
      this.qrDetected = false;
      this.qrDetectionFailed = false;
      this.qrErrorMessage = '';
      if (clearStudentId) {
        this.studentId = '';
      }
    },
    resetIdUpload() {
      if (this.previewImageId) {
        URL.revokeObjectURL(this.previewImageId);
      }
      this.previewImageId = null;
      this.selectedFileId = null;
      this.resetQrState(true);
    },
    openClaimModal(item) {
      this.selectedClaimItem = item;
      this.claimMessage = "";
      this.claimError = "";
      this.claimSuccess = "";
      this.showClaimModal = true;
    },
    closeClaimModal() {
      this.showClaimModal = false;
      this.selectedClaimItem = null;
      this.claimMessage = "";
      this.claimError = "";
      this.claimSuccess = "";
    },
    async submitClaim() {
      if (!this.selectedClaimItem || !this.user) {
        this.claimError = "Unable to process claim at this time.";
        return;
      }

      this.isSubmittingClaim = true;
      this.claimError = "";
      this.claimSuccess = "";

      try {
        const itemId = this.selectedClaimItem.id;
        const API_BASE = "http://localhost:5000";

        // Submit claim directly to the claims route (same flow as NotificationsPage.vue)
        const claimRes = await axios.post(`${API_BASE}/api/claims`, {
          user_id: this.user.id,
          item_id: itemId,
          // No existing notification id in this flow
          notification_id: null,
          message: this.claimMessage || null,
        });

        if (claimRes.status === 201 || claimRes.status === 200) {
          this.claimSuccess = "✅ Your claim request has been submitted and is now received by the security office. Please visit the security office for claiming and verification of the item.";
          setTimeout(() => {
            this.closeClaimModal();
            this.resetSearch();
          }, 2000);
        } else {
          this.claimError = claimRes.data?.message || "Failed to submit claim.";
        }
      } catch (err) {
        console.error("Error submitting claim:", err);
        const errorMsg = err?.response?.data?.message || err.message || "Failed to submit claim.";
        this.claimError = errorMsg;
      } finally {
        this.isSubmittingClaim = false;
      }
    },
  },
  watch: {
    "$route.query"(next = {}) {
      if (next.source_item_id || next.sourceItemId) {
        this.sourceItemId = next.source_item_id || next.sourceItemId;
      }
      if (next.reporter_id || next.reporterId) {
        this.reporterId = next.reporter_id || next.reporterId;
      }
    },
  },
  async mounted() {
    // Restore authenticated context so the search API knows who is searching.
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        this.user = storedUser;
        if (!this.reporterId && storedUser.id) {
          this.reporterId = storedUser.id;
        }

        // Fetch profile data including profile picture
        try {
          const response = await axios.get(`http://localhost:5000/api/profile/${storedUser.id}`);
          if (response.data) {
            // Update user data with profile information including profile picture
            this.user = { ...storedUser, ...response.data };
            // Update localStorage with the new user data including profile picture
            localStorage.setItem("user", JSON.stringify(this.user));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }
    } catch (err) {
      console.error("Failed to parse stored user:", err);
    }

    // Accept both snake_case and camelCase query params for flexibility.
    const query = this.$route?.query || {};
    this.sourceItemId =
      query.source_item_id || query.sourceItemId || this.sourceItemId;
    this.reporterId =
      query.reporter_id || query.reporterId || this.reporterId;
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
