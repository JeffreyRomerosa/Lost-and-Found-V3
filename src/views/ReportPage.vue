<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
    <!-- Header -->
    <div class="max-w-2xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">Report an Item</h1>
        <button
          v-if="!submitted"
          @click="goBack"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 text-sm font-medium"
        >
          ← Back
        </button>
      </div>

      <!-- Step Indicator -->
      <div v-if="!submitted && !reviewing" class="flex items-center gap-2 mb-8">
        <div v-for="s in 3" :key="s" class="flex items-center">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
              s <= step
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            ]"
          >
            {{ s }}
          </div>
          <div v-if="s < 3" :class="['h-1 w-12 mx-2', s < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700']"></div>
        </div>
      </div>
    </div>

    <!-- Step 1: Choose Report Type -->
    <div v-if="step === 1 && !submitted && !reviewing" class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">What are you reporting?</h2>
        <div class="space-y-4">
          <button
            @click="selectType('lost')"
            class="w-full p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-200 text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl group-hover:scale-110 transition-transform">🔍</div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">Report Lost Item</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">I lost something and need help finding it</p>
              </div>
            </div>
          </button>

          <button
            @click="selectType('found')"
            class="w-full p-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-400 transition-all duration-200 text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl group-hover:scale-110 transition-transform">✨</div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">Report Found Item</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">I found something and want to return it</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Choose Item Category -->
    <div v-if="step === 2 && !submitted && !reviewing" class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">What type of item?</h2>
        <div class="space-y-4">
          <button
            @click="selectCategory('id')"
            class="w-full p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl group-hover:scale-110 transition-transform">🆔</div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ reportType === "lost" ? "Lost ID" : "Found ID" }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Student ID, passport, license, etc.</p>
              </div>
            </div>
          </button>

          <button
            @click="selectCategory('general')"
            class="w-full p-6 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 text-left group"
          >
            <div class="flex items-center gap-4">
              <div class="text-3xl group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ reportType === "lost" ? "Lost General Item" : "Found General Item" }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Phone, laptop, bag, keys, etc.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: ID Form -->
    <form
      v-if="step === 3 && itemCategory === 'id' && !reviewing && !submitted"
      @submit.prevent="prepareReview"
      class="max-w-2xl mx-auto"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ reportType === "lost" ? "Lost ID Details" : "Found ID Details" }}
        </h2>

        <!-- Image Upload -->
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 uppercase">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            @change="handleImage($event, 'id')"
            class="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
          />

          <div v-if="isExtractingQR" class="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
            🔍 Analyzing image for QR code...
          </div>
          <div v-else-if="qrDetected" class="mt-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
            ✅ QR code detected! Student ID auto-filled.
          </div>
          <div v-else-if="qrDetectionFailed" class="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
            ⚠️ No QR code found. Please enter details manually.
          </div>

          <div v-if="idForm.preview" class="mt-4 flex items-center gap-4">
            <img
              :src="idForm.preview"
              alt="Preview"
              @click="openImageModal(idForm.preview)"
              class="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
            />
            <button
              type="button"
              @click="removeImage('id')"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Student Name *</label>
            <input 
              v-model="idForm.name" 
              type="text" 
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              required 
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Student ID (123-45678) *</label>
            <input
              v-model="idForm.studentId"
              type="text"
              @input="formatStudentId"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Course / Program *</label>
            <input 
              v-model="idForm.course" 
              type="text" 
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              required 
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Date & Time Lost" : "Date & Time Found" }} *
            </label>
            <input
              v-model="idForm.dateTime"
              type="datetime-local"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Location Lost" : "Location Found" }} *
            </label>
            <input 
              v-model="idForm.location" 
              type="text" 
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              required 
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              Description (optional)
            </label>
            <textarea 
              v-model="idForm.description" 
              rows="3"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Review Report
        </button>
      </div>
    </form>

    <!-- Step 3: General Form -->
    <form
      v-if="step === 3 && itemCategory === 'general' && !reviewing && !submitted"
      @submit.prevent="prepareReview"
      class="max-w-2xl mx-auto"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg space-y-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ reportType === "lost" ? "Lost Item Details" : "Found Item Details" }}
        </h2>

        <!-- Image Upload -->
        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 uppercase">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            @change="handleImage($event, 'general')"
            class="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
          />

          <div v-if="isAnalyzing" class="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
            🔍 Analyzing image...
          </div>

          <div v-if="detectedObjects.length > 0" class="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p class="text-green-700 dark:text-green-300 text-sm font-bold mb-2">Detected Objects:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="obj in detectedObjects" 
                :key="obj.class_name"
                class="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium"
              >
                {{ obj.class_name }} ({{ Math.round(obj.confidence * 100) }}%)
              </span>
            </div>
          </div>

          <div v-if="generalForm.preview" class="mt-4 flex items-center gap-4">
            <img
              :src="generalForm.preview"
              alt="Preview"
              @click="openImageModal(generalForm.preview)"
              class="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
            />
            <button
              type="button"
              @click="removeImage('general')"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Item Name *</label>
            <input
              v-model="generalForm.name"
              type="text"
              @input="filterSuggestions"
              list="item-suggestions"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
            <datalist id="item-suggestions">
              <option v-for="item in filteredSuggestions" :key="item" :value="item" />
            </datalist>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Brand (optional)</label>
              <input 
                v-model="generalForm.brand" 
                type="text" 
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              />
            </div>

            <div>
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Color *</label>
              <input 
                v-model="generalForm.color" 
                type="text" 
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                required
              />
            </div>
          </div>

          <div v-if="showSmartphoneCover">
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Phone Cover?</label>
            <select 
              v-model="generalForm.cover" 
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Select</option>
              <option value="No Cover">No Cover</option>
              <option value="Color: Black">Black</option>
              <option value="Color: White">White</option>
              <option value="Color: Red">Red</option>
              <option value="Color: Blue">Blue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Date & Time Lost" : "Date & Time Found" }} *
            </label>
            <input
              v-model="generalForm.dateTime"
              type="datetime-local"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Location Lost" : "Location Found" }} *
            </label>
            <input 
              v-model="generalForm.location" 
              type="text" 
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
              required 
            />
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">Description (optional)</label>
            <textarea 
              v-model="generalForm.description" 
              rows="3"
              class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Review Report
        </button>
      </div>
    </form>

    <!-- Review Step -->
    <div
      v-if="reviewing && !submitted"
      class="max-w-2xl mx-auto"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Your Report</h2>
        
        <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 max-h-[500px] overflow-auto border border-gray-200 dark:border-gray-700 space-y-4">
          <div v-if="reviewData.preview" class="flex justify-center">
            <img
              :src="reviewData.preview"
              alt="Item Preview"
              @click="openImageModal(reviewData.preview)"
              class="w-48 h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80"
            />
          </div>

          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Type:</span>
              <span class="text-gray-900 dark:text-white font-semibold capitalize">{{ reviewData.type }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Category:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.category }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Name:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.name }}</span>
            </div>
            <div v-if="reviewData.studentId" class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Student ID:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.studentId }}</span>
            </div>
            <div v-if="reviewData.course" class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Course/Program:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.course }}</span>
            </div>
            <div v-if="reviewData.brand" class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Brand:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.brand }}</span>
            </div>
            <div v-if="reviewData.color" class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Color:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.color }}</span>
            </div>
            <div v-if="reviewData.cover" class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Cover:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.cover }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Date & Time:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ formatDateTime(reviewData.dateTime) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Location:</span>
              <span class="text-gray-900 dark:text-white font-semibold">{{ reviewData.location }}</span>
            </div>
            <div v-if="reviewData.description" class="py-2">
              <span class="text-gray-600 dark:text-gray-400 font-medium block mb-2">Description:</span>
              <span class="text-gray-900 dark:text-white">{{ reviewData.description }}</span>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-center gap-4">
          <button
            @click="confirmSubmit"
            class="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Confirm
          </button>
          <button
            @click="editReport"
            class="px-8 py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Success -->
    <div
      v-if="submitted"
      class="max-w-2xl mx-auto"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
        <div class="text-5xl mb-4">✅</div>
        <h2 class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Report Submitted!</h2>

        <p class="text-gray-600 dark:text-gray-300 text-lg mb-8">
          {{ reportType === "lost" 
            ? "Your lost item report has been submitted. You'll be notified if a matching item is found."
            : "Your found item report has been submitted. The owner will be notified if they match."
          }}
        </p>

        <button
          @click="resetForm"
          class="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Done
        </button>
      </div>
    </div>
  </div>

  <!-- 🔍 IMAGE MODAL (added from working template) -->
  <div
    v-if="showImageModal"
    @click="closeImageModal"
    class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
  >
    <div class="relative max-w-3xl w-full" @click.stop>
      <img
        :src="enlargedImageSrc"
        alt="Enlarged Preview"
        class="w-full h-auto rounded-xl shadow-2xl"
      />
      <button
        @click="closeImageModal"
        class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>

</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import jsQR from 'jsqr';

const router = useRouter();

// Core report state (will be auto-saved)
const step = ref(1);
const reportType = ref("");
const itemCategory = ref("");
const reviewing = ref(false);
const submitted = ref(false);
const reporterId = ref(null);

// Transient states (NOT saved to localStorage)
const isExtractingQR = ref(false);
const qrDetected = ref(false);
const qrDetectionFailed = ref(false);
const isAnalyzing = ref(false);
const detectedObjects = ref([]);
const objectDetected = ref(false);

// Image Modal state
const showImageModal = ref(false);
const enlargedImageSrc = ref(null);

const yoloApiUrl = "http://localhost:8080";
const backendUrl = "http://localhost:5000/api";

const idForm = reactive({
  name: "",
  studentId: "",
  course: "",
  dateTime: "",
  location: "",
  description: "",
  file: null,
  preview: null,
});

const generalForm = reactive({
  name: "",
  brand: "",
  color: "",
  cover: "",
  dateTime: "",
  location: "",
  description: "",
  file: null,
  preview: null,
});


//nov13

const reviewData = reactive({});
// Item suggestions from YOLO class mapping
const suggestions = [
  "Airpods",
  "Backpack",
  "Calculator",
  "Cap",
  "Eyeglasses",
  "Flash-drive",
  "Handbag",
  "Headphone",
  "Helmet",
  "Key",
  "Laptop",
  "Laptop Bag",
  "Phone Charger",
  "Powerbank",
  "Sling bag",
  "Smart Watch",
  "Wallet",
  "Smartphone",
  "Tablet",
  "Totebag",
  "Tumbler",
  "Umbrella",
  "Watch"
];
//end of nov13

const filteredSuggestions = ref([]);

// ✅ Automatically save progress (only core state)
const saveProgress = () => {
  localStorage.setItem(
    "report-progress",
    JSON.stringify({
      step: step.value,
      reportType: reportType.value,
      itemCategory: itemCategory.value,
      reviewing: reviewing.value,
      submitted: submitted.value,
    })
  );
};

// 🔄 Watch for changes and save automatically
watch([step, reportType, itemCategory, reviewing, submitted], saveProgress);

// 🚀 Restore progress on page load
onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.id) {
    reporterId.value = user.id;
  } else {
    console.warn("⚠️ No authenticated user found. Redirecting to login...");
    router.push("/login");
  }

  const savedProgress = JSON.parse(localStorage.getItem("report-progress"));
  if (savedProgress) {
    step.value = savedProgress.step || 1;
    reportType.value = savedProgress.reportType || "";
    itemCategory.value = savedProgress.itemCategory || "";
    reviewing.value = savedProgress.reviewing || false;
    submitted.value = savedProgress.submitted || false;
  }
});

// 🧼 Optional: clear saved progress when done
const clearProgress = () => {
  localStorage.removeItem("report-progress");
};

// Existing logic below remains unchanged

const selectType = (type) => {
  // When switching between reporting types, clear transient form data so
  // values (images, previews, detected fields) don't leak between flows.
  reportType.value = type;
  step.value = 2;

  // Clear both forms to avoid cross-population when switching between Lost/Found
  idForm.name = "";
  idForm.studentId = "";
  idForm.course = "";
  idForm.dateTime = "";
  idForm.location = "";
  idForm.description = "";
  idForm.file = null;
  idForm.preview = null;
  qrDetected.value = false;
  qrDetectionFailed.value = false;

  generalForm.name = "";
  generalForm.brand = "";
  generalForm.color = "";
  generalForm.cover = "";
  generalForm.dateTime = "";
  generalForm.location = "";
  generalForm.description = "";
  generalForm.file = null;
  generalForm.preview = null;
  detectedObjects.value = [];
};

const selectCategory = (category) => {
  // When switching category, clear the opposite form so the other category's
  // image/details won't appear unexpectedly.
  itemCategory.value = category;
  step.value = 3;

  if (category === 'id') {
    // clear general form
    generalForm.name = "";
    generalForm.brand = "";
    generalForm.color = "";
    generalForm.cover = "";
    generalForm.dateTime = "";
    generalForm.location = "";
    generalForm.description = "";
    generalForm.file = null;
    generalForm.preview = null;
    detectedObjects.value = [];
  } else {
    // clear id form
    idForm.name = "";
    idForm.studentId = "";
    idForm.course = "";
    idForm.dateTime = "";
    idForm.location = "";
    idForm.description = "";
    idForm.file = null;
    idForm.preview = null;
    qrDetected.value = false;
    qrDetectionFailed.value = false;
  }
};

const handleImage = async (event, formType) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageDataUrl = e.target.result;
    
    if (formType === "id") {
      qrDetected.value = false;
      qrDetectionFailed.value = false;
      idForm.preview = imageDataUrl;
      idForm.file = file;
      await extractQRFromImage(imageDataUrl);
    } else {
      generalForm.preview = imageDataUrl;
      generalForm.file = file;
      await analyzeImageWithYOLO(file);
    }
  };
  reader.readAsDataURL(file);
};

// ✅ Enhanced QR extraction with detailed logging
const extractQRFromImage = async (imageDataUrl) => {
  isExtractingQR.value = true;
  qrDetected.value = false;
  qrDetectionFailed.value = false;
  
  try {
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise(resolve => {
      img.onload = resolve;
      img.onerror = () => resolve();
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (qrCode && qrCode.data) {
      console.log("📷 QR code detected! Raw data:", qrCode.data);

      const studentId = extractStudentIdFromQR(qrCode.data);
      if (studentId) {
        idForm.studentId = studentId;
        qrDetected.value = true;
        console.log("✅ Student ID match found:", studentId);
      } else {
        qrDetectionFailed.value = true;
        console.warn("⚠️ QR detected but no valid student ID pattern matched.");
      }
    } else {
      qrDetectionFailed.value = true;
      console.warn("❌ No QR code found in the image.");
    }
  } catch (error) {
    console.error('🚨 Error extracting QR from image:', error);
    qrDetectionFailed.value = true;
  } finally {
    isExtractingQR.value = false;
  }
};

// ✅ Enhanced student ID extraction with logging
const extractStudentIdFromQR = (qrText) => {
  console.log("🔍 Extracting student ID from QR text:", qrText);
  
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
      console.log("🧩 Pattern matched:", pattern, "→", match[1]);
      let studentId = match[1];
      if (studentId.length === 8 && !studentId.includes('-')) {
        studentId = `${studentId.substring(0, 3)}-${studentId.substring(3)}`;
      }
      return studentId;
    }
  }
  
  console.warn("🚫 No student ID pattern matched from QR text.");
  return null;
};

const analyzeImageWithYOLO = async (file) => {
  isAnalyzing.value = true;
  objectDetected.value = false;
  detectedObjects.value = [];

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${yoloApiUrl}/predict_yolo`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("YOLO API error");

    const result = await response.json();
    detectedObjects.value = result.detections || [];

    if (detectedObjects.value.length > 0) {
      const topObject = detectedObjects.value.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );
      generalForm.name = topObject.classname || "";
      objectDetected.value = true;
      detectedObjects.value = [topObject];
    }
  } catch (error) {
    console.error("❌ Error analyzing image with YOLO:", error);
  } finally {
    isAnalyzing.value = false;
  }
};

const removeImage = (formType) => {
  if (formType === "id") {
    idForm.preview = null;
    idForm.file = null;
    qrDetected.value = false;
    qrDetectionFailed.value = false;
    isExtractingQR.value = false;
  } else {
    generalForm.preview = null;
    generalForm.file = null;
    detectedObjects.value = [];
    objectDetected.value = false;
  }
};

const prepareReview = () => {
  reviewing.value = true;
  if (itemCategory.value === "id") {
    Object.assign(reviewData, { type: reportType.value, category: "ID", ...idForm });
  } else {
    Object.assign(reviewData, { type: reportType.value, category: "General", ...generalForm });
  }
};

const confirmSubmit = async () => {
  try {
    const formData = new FormData();
    const data = itemCategory.value === "id" ? idForm : generalForm;

    formData.append("type", reportType.value);
    formData.append("category", itemCategory.value);
    formData.append("name", data.name || "");
    formData.append("student_id", data.studentId || "");
    formData.append("course", data.course || "");
    formData.append("brand", data.brand || "");
    formData.append("color", data.color || "");
    formData.append("datetime", data.dateTime || "");
    formData.append("location", data.location || "");
    formData.append("description", data.description || "");
    formData.append("cover", data.cover || "");
    formData.append("reporter_id", reporterId.value);
    if (data.file) formData.append("photo", data.file);

    const response = await fetch(`${backendUrl}/report`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to submit report");

    submitted.value = true;
    reviewing.value = false;
    clearProgress(); // ✅ Clear after successful submit
  } catch (err) {
    console.error("❌ Error submitting report:", err);
    alert("Failed to submit report. Please try again.");
  }
};

const editReport = () => {
  reviewing.value = false;
};

const resetForm = () => {
  step.value = 1;
  reportType.value = "";
  itemCategory.value = "";
  reviewing.value = false;
  submitted.value = false;
  qrDetected.value = false;
  qrDetectionFailed.value = false;
  isExtractingQR.value = false;
  Object.keys(idForm).forEach((k) => (idForm[k] = k === "preview" || k === "file" ? null : ""));
  Object.keys(generalForm).forEach((k) => (generalForm[k] = k === "preview" || k === "file" ? null : ""));
  clearProgress(); // ✅ Clear on reset
};

const goBack = () => {
  if (step.value === 1) router.push("/userdashboard");
  else if (step.value === 2) step.value = 1;
  else if (step.value === 3) step.value = 2;
};

const formatStudentId = () => {
  let value = idForm.studentId.replace(/[^0-9]/g, "");
  if (value.length >= 4) {
    value = `${value.slice(0, 3)}-${value.slice(3, 8)}`;
  }
  idForm.studentId = value;
};

const filterSuggestions = () => {
  const term = generalForm.name.toLowerCase();
  filteredSuggestions.value = suggestions.filter((s) => s.toLowerCase().includes(term));
};

const formatDateTime = (dt) => {
  return new Date(dt).toLocaleString();
};

const showSmartphoneCover = computed(() => {
  return generalForm.name.toLowerCase().includes("phone") || generalForm.name.toLowerCase().includes("smartphone");
});

const openImageModal = (imageSrc) => {
  enlargedImageSrc.value = imageSrc;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  enlargedImageSrc.value = null;
};
</script>