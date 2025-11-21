<template>
  <div class="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 pb-32">
    <!-- Header -->
    <div class="max-w-2xl mx-auto mb-8 mt-5">
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
            <div class="relative" ref="courseSuggestionsRef">
              <input 
                v-model="idForm.course" 
                type="text" 
                @input="filterCourseSuggestions"
                @focus="openCourseSuggestions"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10" 
                required 
              />

              <button type="button" @click.stop="toggleCourseSuggestions" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div v-if="showCourseSuggestions" class="absolute left-0 right-0 z-40 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full">
                <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                  <span class="font-bold text-lg">COURSE</span>
                  <button @click="closeCourseSuggestions" class="text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div class="overflow-y-auto max-h-40 py-2">
                  <button
                    v-for="c in (idForm.course ? (filteredCourseSuggestions.length ? filteredCourseSuggestions : courseOptions) : courseOptions)"
                    :key="c"
                    @click="selectCourseSuggestion(c)"
                    class="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {{ c }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 uppercase">
              {{ reportType === "lost" ? "Date & Time Lost" : "Date & Time Found" }} *
            </label>
            <!-- Date & Time Display -->
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg p-4 mb-4">
              <p class="text-base font-bold text-emerald-700 dark:text-emerald-300">{{ formatIdDateTime() }}</p>
            </div>
            <!-- Date Picker Row -->
            <div class="mb-4">
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">📅 SELECT DATE</label>
              <div class="grid grid-cols-3 gap-3">
                <!-- Month Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Month</label>
                  <button type="button" @click="openIdPickerWrapped('month')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ getMonthName(idDatePicker.month) }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Day Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Day</label>
                  <button type="button" @click="openIdPickerWrapped('day')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ String(idDatePicker.day).padStart(2, '0') }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Year Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Year</label>
                  <button type="button" @click="openIdPickerWrapped('year')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ idDatePicker.year }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            <!-- Time Picker Row -->
            <div>
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">⏰ SELECT TIME</label>
              <div class="grid grid-cols-3 gap-3">
                <!-- Hour Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Hour</label>
                  <button type="button" @click="openIdPickerWrapped('hour')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ idDatePicker.hour }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Minute Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Minute</label>
                  <button type="button" @click="openIdPickerWrapped('minute')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ String(idDatePicker.minute).padStart(2, '0') }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Period Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">AM/PM</label>
                  <button type="button" @click="openIdPickerWrapped('period')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ idDatePicker.period }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Location Lost" : "Location Found" }} *
            </label>
            <div class="relative" ref="idLocationSuggestionsRef">
              <input 
                v-model="idForm.location" 
                type="text" 
                @input="filterIdLocationSuggestions"
                @focus="openIdLocationSuggestions"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10" 
                required 
              />

              <button type="button" @click.stop="toggleIdLocationSuggestions" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div v-if="showIdLocationSuggestions" class="absolute left-0 right-0 z-40 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full">
                <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                  <span class="font-bold text-lg">LOCATION</span>
                  <button @click="closeIdLocationSuggestions" class="text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div class="overflow-y-auto max-h-40 py-2">
                  <button
                    v-for="loc in (idForm.location ? (filteredLocationSuggestions.length ? filteredLocationSuggestions : locationOptions) : locationOptions)"
                    :key="loc"
                    @click="selectIdLocationSuggestion(loc)"
                    class="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {{ loc }}
                  </button>
                </div>
              </div>
            </div>
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
         <!-- commented out for privacy reasons:hidden -->
          <!-- <div v-if="isAnalyzing" class="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
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
          </div> -->

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
            <div class="relative" ref="suggestionsRef">
              <input
                v-model="generalForm.name"
                type="text"
                @input="filterSuggestions"
                @focus="openSuggestions"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10"
                required
              />

              <!-- Always-visible caret button -->
              <button type="button" @click.stop="toggleSuggestions" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Custom suggestions dropdown styled like date picker modal -->
              <div v-if="showItemSuggestions" class="absolute left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-full">
                <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                  <span class="font-bold text-lg">ITEMS</span>
                  <button @click="closeSuggestions" class="text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div class="overflow-y-auto max-h-44 py-2">
                  <button
                    v-for="item in filteredSuggestions"
                    :key="item"
                    @click="selectSuggestion(item)"
                    class="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {{ item }}
                  </button>
                  <div v-if="filteredSuggestions.length === 0" class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">No suggestions</div>
                </div>
              </div>
            </div>
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
              <div class="relative" ref="colorSuggestionsRef">
                <input
                  v-model="generalForm.color"
                  type="text"
                  @input="filterColorSuggestions"
                  @focus="openColorSuggestions"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10"
                  required
                />

                <button type="button" @click.stop="toggleColorSuggestions" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <div v-if="showColorSuggestions" class="absolute left-0 right-0 z-40 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full">
                  <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                    <span class="font-bold text-lg">COLOR</span>
                    <button @click="closeColorSuggestions" class="text-white hover:text-gray-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  <div class="overflow-y-auto max-h-40 py-2">
                    <button
                      v-for="c in (generalForm.color ? (filteredColorSuggestions.length ? filteredColorSuggestions : colorOptions) : colorOptions)"
                      :key="c"
                      @click="selectColorSuggestion(c)"
                      class="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      {{ c }}
                    </button>
                  </div>
                </div>
              </div>
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
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 uppercase">
              {{ reportType === "lost" ? "Date & Time Lost" : "Date & Time Found" }} *
            </label>
            <!-- Date & Time Display -->
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg p-4 mb-4">
              <p class="text-base font-bold text-emerald-700 dark:text-emerald-300">{{ formatGeneralDateTime() }}</p>
            </div>
            <!-- Date Picker Row -->
            <div class="mb-4">
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">📅 SELECT DATE</label>
              <div class="grid grid-cols-3 gap-3">
                <!-- Month Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Month</label>
                  <button type="button" @click="openGeneralPickerWrapped('month')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ getMonthName(generalDatePicker.month) }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Day Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Day</label>
                  <button type="button" @click="openGeneralPickerWrapped('day')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ String(generalDatePicker.day).padStart(2, '0') }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Year Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Year</label>
                  <button type="button" @click="openGeneralPickerWrapped('year')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ generalDatePicker.year }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            <!-- Time Picker Row -->
            <div>
              <label class="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">⏰ SELECT TIME</label>
              <div class="grid grid-cols-3 gap-3">
                <!-- Hour Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Hour</label>
                  <button type="button" @click="openGeneralPickerWrapped('hour')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ generalDatePicker.hour }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Minute Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Minute</label>
                  <button type="button" @click="openGeneralPickerWrapped('minute')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ String(generalDatePicker.minute).padStart(2, '0') }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
                <!-- Period Picker -->
                <div class="flex flex-col">
                  <label class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">AM/PM</label>
                  <button type="button" @click="openGeneralPickerWrapped('period')" class="w-full px-3 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2">
                    {{ generalDatePicker.period }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 uppercase">
              {{ reportType === "lost" ? "Location Lost" : "Location Found" }} *
            </label>
            <div class="relative" ref="generalLocationSuggestionsRef">
              <input 
                v-model="generalForm.location" 
                type="text" 
                @input="filterGeneralLocationSuggestions"
                @focus="openGeneralLocationSuggestions"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10" 
                required 
              />

              <button type="button" @click.stop="toggleGeneralLocationSuggestions" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div v-if="showGeneralLocationSuggestions" class="absolute left-0 right-0 z-40 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full">
                <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
                  <span class="font-bold text-lg">LOCATION</span>
                  <button @click="closeGeneralLocationSuggestions" class="text-white hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div class="overflow-y-auto max-h-40 py-2">
                  <button
                    v-for="loc in (generalForm.location ? (filteredLocationSuggestions.length ? filteredLocationSuggestions : locationOptions) : locationOptions)"
                    :key="loc"
                    @click="selectGeneralLocationSuggestion(loc)"
                    class="w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {{ loc }}
                  </button>
                </div>
              </div>
            </div>
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
      <!-- For Found Items: Show Office Hours + Delivery Instructions -->
      <FoundItemDeliveryNotice
        v-if="reportType === 'found'"
        :itemType="itemCategory === 'id' ? 'Student ID' : 'General Item'"
        @done="resetForm"
      />

      <!-- For Lost Items: Show standard success message -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg text-center">
        <div class="text-5xl mb-4">✅</div>
        <h2 class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Report Submitted!</h2>

        <p class="text-gray-600 dark:text-gray-300 text-lg mb-8">
          Your lost item report has been submitted. You'll be notified if a matching item is found.
        </p>

        <button
          @click="resetForm"
          class="px-8 py-3 rounded-lg bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Done
        </button>
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

  <!-- 📦 ITEM RECEIVED MODAL -->
  <ItemReceivedModal
    :isOpen="showItemReceivedModal"
    :itemName="itemReceivedModalData.itemName"
    :itemId="itemReceivedModalData.itemId"
    @close="closeItemReceivedModal"
  />

  <!-- 📱 PICKER MODAL OVERLAY -->
  <div v-if="activePickerModal" @click="closePicker" class="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
    <div @click.stop class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs max-h-96">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <span class="font-bold text-lg">{{ activePickerModal.split('-')[1].toUpperCase() }}</span>
        <button @click="closePicker" class="text-white hover:text-gray-200 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Scrollable Options -->
      <div class="overflow-y-auto max-h-64 py-2">
        <button 
          v-for="option in getPickerOptions(activePickerModal.split('-')[1])" 
          :key="option"
          @click="selectPickerValue(activePickerModal.split('-')[1] === 'month' ? (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(option) + 1) : (activePickerModal.split('-')[1] === 'period' ? option : parseInt(option)))"
          :class="[
            'w-full px-4 py-3 text-left font-semibold text-gray-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors',
            getPickerCurrentValue(activePickerModal.split('-')[1]) === option ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100' : ''
          ]"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </div>
  </div>

</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import jsQR from 'jsqr';
import FoundItemDeliveryNotice from '../components/FoundItemDeliveryNotice.vue';
import { initSocket } from '../socket';
import ItemReceivedModal from '../components/ItemReceivedModal.vue';

const router = useRouter();

// Socket instance
let socket = null;

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

// Item Received Modal state
const showItemReceivedModal = ref(false);
const itemReceivedModalData = ref({ itemName: null, itemId: null });

// Picker Modal state
const activePickerModal = ref(null); // 'id-month', 'id-day', etc. or null
const pickerFormType = ref(null); // 'id' or 'general'

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

// Date picker state for ID form
const initializeIdDatePicker = () => {
  const now = new Date();
  const hour24 = now.getHours();
  let hour12 = hour24 % 12 || 12;
  let period = hour24 >= 12 ? 'PM' : 'AM';
  
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear(),
    hour: hour12,
    minute: now.getMinutes(),
    period: period
  };
};

const idDatePicker = reactive(initializeIdDatePicker());

// Date picker state for General form
const initializeGeneralDatePicker = () => {
  const now = new Date();
  const hour24 = now.getHours();
  let hour12 = hour24 % 12 || 12;
  let period = hour24 >= 12 ? 'PM' : 'AM';
  
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear(),
    hour: hour12,
    minute: now.getMinutes(),
    period: period
  };
};

const generalDatePicker = reactive(initializeGeneralDatePicker());

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
// Color options for dropdown
const colorOptions = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Silver', 'Gold', 'Brown', 'Pink', 'Purple', 'Orange', 'Maroon', 'Beige',
  'Navy','Teal','Turquoise','Lavender','Khaki','Cream','Bronze','Olive','Mustard','Charcoal','Transparent/Clear'

];
const filteredColorSuggestions = ref([]);
// Location options for dropdown (provided list)
const locationOptions = [
  "GUARD HOUSE",
  "OVERPASS",
  "CSU MILK PROCESSING FACILITY",
  "CED BUILDING",
  "CHED CARAGA REGIONAL OFFICE",
  "GASOLINE STATION",
  "FOOD TECH. BUILDING",
  "FOOD INNOVATION CENTER",
  "AGRO-WORKSHOP/CAA TESDA",
  "TISSUE CULTURE LABORATORY",
  "CAA BUILDING",
  "GREEN HOUSE",
  "H.E.R.O LEARNING COMMONS",
  "S & T BUILDING",
  "HOSTEL BUILDING (e.i CLINIC OFFICE)",
  "EXECUTIVE HOUSE",
  "DIAGNOSTIC LABORATORY",
  "FARM MECHANIZATION CENTER",
  "NEW ADMINISTRATION BUILDING",
  "OLD ADMINISTRATION BUILDING",
  "OVAL",
  "ORGMS OFFICE/BOOKSTORE",
  "ANNEX 3/SENIOR HIGH SCHOOL",
  "UNIVERSITY GYMNASIUM & CULTURAL CENTER",
  "PHYSICAL FITNESS OFFICE",
  "OLD CAS BUILDING",
  "KINAADMAN BUILDING",
  "CEIT ANNEX BUILDING",
  "HIRAYA BUILDING",
  "HINANG BUILDING",
  "CHAPEL",
  "ECO-LODGE",
  "OLD FARM MECHANIZATION CENTER",
  "OLD GENTS’ DORMITORY",
  "PIG PENS",
  "NATIVE CHICKEN HOUSE",
  "OATC",
  "VERMI HOUSE/NURSERY/POULTRY",
  "BOTANICAL GARDEN",
  "CoFES ANNEX",
  "ANNEX 2 BUILDING",
  "DOST BUILDING",
  "CoFES BUILDING",
  "CoFES CLASSROOM/HOSTEL",
  "NEW GENTS’ DORMITORY",
  "MICROIZA OFFICE",
  "WOOD WORKSHOP\\TECH VOC BUILDING",
  "ROOTING RECOVERY FACILITY",
  "NEW LADIES DORMITORY"
];
const filteredLocationSuggestions = ref([]);
// Course / Program options for ID form
const courseOptions = [
  "BACHELOR OF ARTS IN SOCIOLOGY (AB-SOCIO)",
  "BACHELOR OF ELEMENTARY EDUCATION (BEED)",
  "BACHELOR OF SCIENCE IN AGRICULTURAL AND BIOSYSTEMS ENGINEERING (BSABE)",
  "BACHELOR OF SCIENCE IN AGRICULTURE (BSA)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRIBUSINESS MANAGEMENT (BSA-AGRI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRICULTURAL ECONOMICS (BSA-AGECON)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN AGRONOMY (BSA-AGRON)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN ANIMAL SCIENCE (BSA-ANSCI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN CROP PROTECTION (BSA-CROPPROT)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN HORTICULTURE (BSA-HORTI)",
  "BACHELOR OF SCIENCE IN AGRICULTURE MAJOR IN SOIL SCIENCE (BSA-SOILSCI)",
  "BACHELOR OF SCIENCE IN AGROFORESTRY (BSAF)",
  "BACHELOR OF SCIENCE IN APPLIED MATHEMATICS (BSAM)",
  "BACHELOR OF SCIENCE IN BIOLOGY (BSBIO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN BIODIVERSITY CONSERVATION (BSBIO BIOCON)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN ENTOMOLOGY (BSBIO-ENT)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MEDICAL BIOLOGY (BSBIO MEDBIO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN MICROBIOLOGY (BSBIO MICRO)",
  "BACHELOR OF SCIENCE IN BIOLOGY MAJOR IN PLANT BIOLOGY (BSBIO PLANTBIO)",
  "BACHELOR OF SCIENCE IN CHEMISTRY (BSCHEM)",
  "BACHELOR OF SCIENCE IN CIVIL ENGINEERING (BSCE)",
  "BACHELOR OF SCIENCE IN CIVIL ENGINEERING WITH SPECIALIZATION IN STRUCTURAL ENGINEERING (BSCE-SE)",
  "BACHELOR OF SCIENCE IN COMPUTER SCIENCE (BSCS)",
  "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING (BSEcE)",
  "BACHELOR OF SCIENCE IN ENVIRONMENTAL SCIENCE (BSES)",
  "BACHELOR OF SCIENCE IN FORESTRY (BSF)",
  "BACHELOR OF SCIENCE IN GEODETIC ENGINEERING (BSGE)",
  "BACHELOR OF SCIENCE IN GEOLOGY (BSGeol)",
  "BACHELOR OF SCIENCE IN INFORMATION SYSTEM (BSIS)",
  "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT)",
  "BACHELOR OF SCIENCE IN MARINE BIOLOGY (BS Marine Bio)",
  "BACHELOR OF SCIENCE IN MATHEMATICS (BSMATH)",
  "BACHELOR OF SCIENCE IN MINING ENGINEERING (BSEM)",
  "BACHELOR OF SCIENCE IN PHYSICS (BS-PHYS)",
  "BACHELOR OF SCIENCE IN PSYCHOLOGY (BS PSYCH)",
  "BACHELOR OF SCIENCE IN SOCIAL WORK (BSSW)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH (BSED ENG)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPINO (BSED FIL)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN MATHEMATICS (BSED-MATH)",
  "BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE (BSED SCI)",
  "TEACHERS CERTIFICATE PROGRAM (TCP)"
];
const filteredCourseSuggestions = ref([]);
const showCourseSuggestions = ref(false);
const courseSuggestionsRef = ref(null);
const showItemSuggestions = ref(false);
const showColorSuggestions = ref(false);
const showIdLocationSuggestions = ref(false);
const showGeneralLocationSuggestions = ref(false);
const suggestionsRef = ref(null);
const colorSuggestionsRef = ref(null);
const idLocationSuggestionsRef = ref(null);
const generalLocationSuggestionsRef = ref(null);
let _handleDocClick = null;

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

// Hide any open suggestion dropdowns whenever a picker modal becomes active
watch(activePickerModal, (val) => {
  if (val) _blurSuggestionsInput();
});

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

  // Initialize date/time pickers with current date/time
  updateIdDateTime();
  updateGeneralDateTime();

  // ✅ Socket listeners for item received notifications
  socket = initSocket();
  if (socket) {
    socket.on("itemReceived", handleItemReceivedEvent);
  }
  // Close suggestions when clicking outside (checks both suggestion menus)
  _handleDocClick = (e) => {
    if (suggestionsRef.value && suggestionsRef.value.contains(e.target)) return;
    if (colorSuggestionsRef.value && colorSuggestionsRef.value.contains(e.target)) return;
    if (idLocationSuggestionsRef.value && idLocationSuggestionsRef.value.contains(e.target)) return;
    if (generalLocationSuggestionsRef.value && generalLocationSuggestionsRef.value.contains(e.target)) return;
    if (courseSuggestionsRef.value && courseSuggestionsRef.value.contains(e.target)) return;
    showItemSuggestions.value = false;
    showColorSuggestions.value = false;
    showIdLocationSuggestions.value = false;
    showGeneralLocationSuggestions.value = false;
    showCourseSuggestions.value = false;
  };
  window.addEventListener('click', _handleDocClick);
});

onUnmounted(() => {
  if (socket) {
    socket.off("itemReceived", handleItemReceivedEvent);
  }
  if (_handleDocClick) {
    window.removeEventListener('click', _handleDocClick);
  }
});

const handleItemReceivedEvent = (evt) => {
  try {
    console.log("📦 Item received notification on ReportPage:", evt);
    
    // Show modal with item details
    itemReceivedModalData.value = {
      itemName: evt.item_name || "Your Item",
      itemId: evt.item_student_id || null
    };
    showItemReceivedModal.value = true;

    // Send desktop notification
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("📦 Item Received!", {
        body: evt.message || "Your item has been received by the security office.",
        icon: "/logo.png",
      });
    }
  } catch (e) {
    console.error("Error handling item received event on ReportPage:", e);
  }
};

const closeItemReceivedModal = () => {
  showItemReceivedModal.value = false;
  itemReceivedModalData.value = { itemName: null, itemId: null };
};

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

    // ✅ Validate required fields
    if (!data.location || !data.location.trim()) {
      alert("Please enter the location where the item was found/lost.");
      return;
    }

    if (!data.dateTime || !data.dateTime.trim()) {
      alert("Please enter the date and time when the item was found/lost.");
      return;
    }

    formData.append("type", reportType.value);
    formData.append("category", itemCategory.value);
    formData.append("name", data.name || "");
    formData.append("student_id", data.studentId || "");
    formData.append("course", data.course || "");
    formData.append("brand", data.brand || "");
    formData.append("color", data.color || "");
    formData.append("datetime", data.dateTime);
    formData.append("location", data.location);
    formData.append("description", data.description || "");
    formData.append("cover", data.cover || "");
    formData.append("reporter_id", reporterId.value);
    if (data.file) formData.append("photo", data.file);

    const response = await fetch(`${backendUrl}/report`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to submit report");
    }

    submitted.value = true;
    reviewing.value = false;
    clearProgress(); // ✅ Clear after successful submit
  } catch (err) {
    console.error("❌ Error submitting report:", err);
    alert("Failed to submit report: " + err.message);
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
  if (!term) {
    // show full list when empty
    filteredSuggestions.value = [...suggestions];
  } else {
    filteredSuggestions.value = suggestions.filter((s) => s.toLowerCase().includes(term));
  }
  // Show the dropdown when there are suggestions
  showItemSuggestions.value = filteredSuggestions.value.length > 0;
};

const openSuggestions = () => {
  if (!filteredSuggestions.value.length) filteredSuggestions.value = [...suggestions];
  showItemSuggestions.value = true;
};

const closeSuggestions = () => {
  showItemSuggestions.value = false;
};

const toggleSuggestions = () => {
  // When opening via caret ensure full list is available so users see all options
  if (!showItemSuggestions.value) {
    filteredSuggestions.value = [...suggestions];
  }
  showItemSuggestions.value = !showItemSuggestions.value;
};

const selectSuggestion = (item) => {
  generalForm.name = item;
  showItemSuggestions.value = false;
  filteredSuggestions.value = [];
};

// Color suggestion helpers
const filterColorSuggestions = () => {
  const term = (generalForm.color || '').toLowerCase();
  if (!term) {
    filteredColorSuggestions.value = [];
  } else {
    filteredColorSuggestions.value = colorOptions.filter(c => c.toLowerCase().includes(term));
  }
  console.debug('filterColorSuggestions -> term:', term, 'results:', filteredColorSuggestions.value.length);
  showColorSuggestions.value = filteredColorSuggestions.value.length > 0;
};

const openColorSuggestions = () => {
  if (!filteredColorSuggestions.value.length) filteredColorSuggestions.value = [...colorOptions];
  showColorSuggestions.value = true;
};

const closeColorSuggestions = () => {
  showColorSuggestions.value = false;
};

const toggleColorSuggestions = () => {
  // Always populate full color list when opening so caret shows all options
  if (!showColorSuggestions.value) {
    filteredColorSuggestions.value = [...colorOptions];
    console.debug('toggleColorSuggestions -> populated full color list, count =', filteredColorSuggestions.value.length);
  }
  showColorSuggestions.value = !showColorSuggestions.value;
};

const selectColorSuggestion = (c) => {
  generalForm.color = c;
  showColorSuggestions.value = false;
  filteredColorSuggestions.value = [];
};

// Course suggestion helpers (ID form)
const filterCourseSuggestions = () => {
  const term = (idForm.course || '').toLowerCase();
  if (!term) filteredCourseSuggestions.value = [...courseOptions];
  else filteredCourseSuggestions.value = courseOptions.filter(c => c.toLowerCase().includes(term));
  showCourseSuggestions.value = filteredCourseSuggestions.value.length > 0;
};

const openCourseSuggestions = () => {
  if (!filteredCourseSuggestions.value.length) filteredCourseSuggestions.value = [...courseOptions];
  showCourseSuggestions.value = true;
};

const closeCourseSuggestions = () => {
  showCourseSuggestions.value = false;
};

const toggleCourseSuggestions = () => {
  if (!showCourseSuggestions.value) filteredCourseSuggestions.value = [...courseOptions];
  showCourseSuggestions.value = !showCourseSuggestions.value;
};

const selectCourseSuggestion = (c) => {
  idForm.course = c;
  showCourseSuggestions.value = false;
  filteredCourseSuggestions.value = [];
};

// Location helpers for ID form
const filterIdLocationSuggestions = () => {
  const term = (idForm.location || '').toLowerCase();
  if (!term) filteredLocationSuggestions.value = [...locationOptions];
  else filteredLocationSuggestions.value = locationOptions.filter(l => l.toLowerCase().includes(term));
  showIdLocationSuggestions.value = filteredLocationSuggestions.value.length > 0;
};

const openIdLocationSuggestions = () => {
  if (!filteredLocationSuggestions.value.length) filteredLocationSuggestions.value = [...locationOptions];
  showIdLocationSuggestions.value = true;
};

const closeIdLocationSuggestions = () => {
  showIdLocationSuggestions.value = false;
};

const toggleIdLocationSuggestions = () => {
  if (!showIdLocationSuggestions.value) filteredLocationSuggestions.value = [...locationOptions];
  showIdLocationSuggestions.value = !showIdLocationSuggestions.value;
};

const selectIdLocationSuggestion = (loc) => {
  idForm.location = loc;
  showIdLocationSuggestions.value = false;
  filteredLocationSuggestions.value = [];
};

// Location helpers for General form
const filterGeneralLocationSuggestions = () => {
  const term = (generalForm.location || '').toLowerCase();
  if (!term) filteredLocationSuggestions.value = [...locationOptions];
  else filteredLocationSuggestions.value = locationOptions.filter(l => l.toLowerCase().includes(term));
  showGeneralLocationSuggestions.value = filteredLocationSuggestions.value.length > 0;
};

const openGeneralLocationSuggestions = () => {
  if (!filteredLocationSuggestions.value.length) filteredLocationSuggestions.value = [...locationOptions];
  showGeneralLocationSuggestions.value = true;
};

const closeGeneralLocationSuggestions = () => {
  showGeneralLocationSuggestions.value = false;
};

const toggleGeneralLocationSuggestions = () => {
  if (!showGeneralLocationSuggestions.value) filteredLocationSuggestions.value = [...locationOptions];
  showGeneralLocationSuggestions.value = !showGeneralLocationSuggestions.value;
};

const selectGeneralLocationSuggestion = (loc) => {
  generalForm.location = loc;
  showGeneralLocationSuggestions.value = false;
  filteredLocationSuggestions.value = [];
};

// Format and update date/time for ID form
const updateIdDateTime = () => {
  let hour24 = idDatePicker.hour;
  if (idDatePicker.period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (idDatePicker.period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  idForm.dateTime = `${idDatePicker.year}-${String(idDatePicker.month).padStart(2, '0')}-${String(idDatePicker.day).padStart(2, '0')}T${String(hour24).padStart(2, '0')}:${String(idDatePicker.minute).padStart(2, '0')}`;
};

// Format and update date/time for General form
const updateGeneralDateTime = () => {
  let hour24 = generalDatePicker.hour;
  if (generalDatePicker.period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (generalDatePicker.period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  generalForm.dateTime = `${generalDatePicker.year}-${String(generalDatePicker.month).padStart(2, '0')}-${String(generalDatePicker.day).padStart(2, '0')}T${String(hour24).padStart(2, '0')}:${String(generalDatePicker.minute).padStart(2, '0')}`;
};

// Format display for ID form date/time
const formatIdDateTime = () => {
  if (idForm.dateTime) {
    const dateObj = new Date(idForm.dateTime);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return dateObj.toLocaleDateString('en-US', options);
  }
  return 'Select date and time';
};

// Format display for General form date/time
const formatGeneralDateTime = () => {
  if (generalForm.dateTime) {
    const dateObj = new Date(generalForm.dateTime);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return dateObj.toLocaleDateString('en-US', options);
  }
  return 'Select date and time';
};

// Watch for changes in ID date picker
watch([() => idDatePicker.month, () => idDatePicker.day, () => idDatePicker.year, () => idDatePicker.hour, () => idDatePicker.minute, () => idDatePicker.period], () => {
  updateIdDateTime();
});

// Watch for changes in General date picker
watch([() => generalDatePicker.month, () => generalDatePicker.day, () => generalDatePicker.year, () => generalDatePicker.hour, () => generalDatePicker.minute, () => generalDatePicker.period], () => {
  updateGeneralDateTime();
});

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

// Picker Modal Methods
const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || 'Jan';
};

const openIdPicker = (pickerType) => {
  // ensure item suggestions are closed so the picker modal doesn't get overlapped
  try { closeSuggestions(); } catch (e) { /* ignore if not available */ }
  activePickerModal.value = `id-${pickerType}`;
  pickerFormType.value = 'id';
};

const openGeneralPicker = (pickerType) => {
  // ensure item suggestions are closed so the picker modal doesn't get overlapped
  try { closeSuggestions(); } catch (e) { /* ignore if not available */ }
  activePickerModal.value = `general-${pickerType}`;
  pickerFormType.value = 'general';
};

// Also blur item input and hide any suggestion overlays when opening pickers
const _blurSuggestionsInput = () => {
  try {
    if (suggestionsRef.value && suggestionsRef.value.querySelector) {
      const inputEl = suggestionsRef.value.querySelector('input');
      if (inputEl && typeof inputEl.blur === 'function') inputEl.blur();
    }
  } catch (e) {
    // ignore
  }
  showItemSuggestions.value = false;
  showColorSuggestions.value = false;
  showIdLocationSuggestions.value = false;
  showGeneralLocationSuggestions.value = false;
  showCourseSuggestions.value = false;
};

// Wrap pickers to also blur suggestions (keeps behavior consistent)
const openIdPickerWrapped = (pickerType) => {
  _blurSuggestionsInput();
  openIdPicker(pickerType);
};

const openGeneralPickerWrapped = (pickerType) => {
  _blurSuggestionsInput();
  openGeneralPicker(pickerType);
};

const closePicker = () => {
  activePickerModal.value = null;
  pickerFormType.value = null;
};

const selectPickerValue = (value) => {
  if (!activePickerModal.value) return;
  
  const [formType, pickerType] = activePickerModal.value.split('-');
  const picker = formType === 'id' ? idDatePicker : generalDatePicker;
  
  picker[pickerType] = value;
  closePicker();
};

const getPickerOptions = (pickerType) => {
  if (pickerType === 'month') {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  } else if (pickerType === 'day') {
    return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  } else if (pickerType === 'year') {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  } else if (pickerType === 'hour') {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  } else if (pickerType === 'minute') {
    return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  } else if (pickerType === 'period') {
    return ['AM', 'PM'];
  }
  return [];
};

const getPickerCurrentValue = (pickerType) => {
  const picker = pickerFormType.value === 'id' ? idDatePicker : generalDatePicker;
  if (pickerType === 'month') {
    return getMonthName(picker.month);
  }
  return String(picker[pickerType]);
};
</script>