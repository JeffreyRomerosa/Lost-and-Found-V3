<template>
  <div class="space-y-4">
    <!-- Success Message -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
        <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Report Submitted!</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Your found report has been submitted. Please deliver the item you found to the security office.
      </p>
    </div>

    <!-- Delivery Instructions -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
      <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        Delivery Instructions
      </h3>
      <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">
        Please deliver this found item to the
        <span class="font-semibold">{{ itemType === 'Student ID' ? 'OSAS Office' : 'Security Office' }}</span>
        as soon as possible for secure storage.
      </p>
    </div>

    <!-- Office Availability Status -->
    <div v-if="officeHours" :class="[
      'p-4 rounded border-l-4',
      isOfficeOpenToday 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400'
    ]">
      <h3 class="font-semibold mb-3 flex items-center gap-2" :class="[
        isOfficeOpenToday 
          ? 'text-green-900 dark:text-green-100'
          : 'text-amber-900 dark:text-amber-100'
      ]">
        <svg v-if="isOfficeOpenToday" class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v6a3 3 0 01-.709 1.938l-5.854 7.381a3 3 0 01-4.474 0L3.172 10.938A3 3 0 012.5 9V3.457a3.066 3.066 0 012.767-3.002z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ isOfficeOpenToday ? '✓ Office is Open Today!' : '⚠ Office is Closed Today' }}
      </h3>
      
      <!-- Today's Hours -->
      <div class="mb-4 p-3 bg-white dark:bg-gray-800 rounded border" :class="[
        isOfficeOpenToday
          ? 'border-green-200 dark:border-green-700'
          : 'border-amber-200 dark:border-amber-700'
      ]">
        <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today ({{ todayName }}):</p>
        <div v-if="isOfficeOpenToday" class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <p class="text-sm font-bold text-green-700 dark:text-green-300">
            {{ officeHours.today.open }} - {{ officeHours.today.close }}
          </p>
          <span class="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-semibold">OPEN</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <p class="text-sm font-semibold text-red-700 dark:text-red-300">Closed Today</p>
        </div>
      </div>

      <!-- Recommendation -->
      <div v-if="isOfficeOpenToday" class="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded p-3 text-sm text-green-800 dark:text-green-200">
        <p><span class="font-semibold">✓ Great news!</span> You can deliver the item today during the hours shown above!</p>
      </div>
      <div v-else-if="nextOpenDay" class="bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded p-3 text-sm text-amber-800 dark:text-amber-200">
        <p class="font-semibold mb-2">Next Available Time:</p>
        <p><span class="font-semibold">{{ nextOpenDay.name }} ({{ nextOpenDay.date }})</span></p>
        <p class="text-xs mt-1">{{ nextOpenDay.open }} - {{ nextOpenDay.close }}</p>
      </div>
    </div>



    <!-- Office Hours Information - Detailed Schedule -->
    <div v-if="officeHours" class="bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-400 dark:border-gray-600 p-4 rounded">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
        </svg>
        Complete Office Hours
      </h3>

      <!-- Weekly Schedule -->
      <details class="cursor-pointer">
        <summary class="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-200">
          View Full Weekly Schedule
        </summary>
        <div class="mt-3 space-y-2 text-xs text-gray-800 dark:text-gray-200">
          <div v-for="day in weekDays" :key="day.name" class="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <span class="font-semibold">{{ day.name }}</span>
            <span v-if="day.isOpen" class="text-green-600 dark:text-green-400">{{ day.open }} - {{ day.close }}</span>
            <span v-else class="text-red-600 dark:text-red-400">Closed</span>
          </div>
        </div>
      </details>
    </div>

    <!-- Storage Information -->
    <div class="bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-400 dark:border-gray-600 p-4 rounded">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        Storage Information
      </h3>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Once delivered, your item will be securely stored and catalogued. The original owner will be notified of the found item, 
        and they can claim it by visiting the office during business hours.
      </p>
    </div>

    <!-- Done Button -->
    <button
      @click="$emit('done')"
      class="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
    >
      Done
    </button>
  </div>
</template>

<script>
export default {
  name: "FoundItemDeliveryNotice",
  props: {
    itemType: {
      type: String,
      default: "General Item",
      validator: (value) => ["Student ID", "General Item"].includes(value)
    }
  },
  data() {
    return {
      weekSchedule: [],
      isOfficeOpenToday: false,
      todayName: "",
      currentDateTime: "",
      nextOpenDay: null,
    };
  },
  computed: {
    officeHours() {
      if (this.weekSchedule.length === 0) return null;

      const today = new Date();
      const todayIndex = today.getDay();

      const todaySchedule = this.weekSchedule[todayIndex] || {};
      const isOpen = todaySchedule.is_open;

      return {
        today: {
          open: isOpen ? this.formatTime(todaySchedule.opening_time) : "Closed",
          close: isOpen ? this.formatTime(todaySchedule.closing_time) : "-",
        }
      };
    },
    weekDays() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return this.weekSchedule.map((day, index) => ({
        name: dayNames[index],
        isOpen: day.is_open,
        open: day.is_open ? this.formatTime(day.opening_time) : "Closed",
        close: day.is_open ? this.formatTime(day.closing_time) : "-",
      }));
    }
  },
  methods: {
    formatTime(timeStr) {
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
    },

    async loadOfficeHours() {
      try {
        const response = await fetch("http://localhost:5000/api/office-hours/week");
        if (!response.ok) throw new Error("Failed to fetch office hours");

        this.weekSchedule = await response.json();

        // Check if office is open today
        const today = new Date();
        const todayIndex = today.getDay();
        const todayData = this.weekSchedule[todayIndex];
        this.isOfficeOpenToday = todayData?.is_open || false;

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.todayName = dayNames[todayIndex];

        // Find next open day
        this.findNextOpenDay();

        // Update current time
        this.updateCurrentDateTime();
      } catch (error) {
        console.error("❌ Error loading office hours:", error);
      }
    },

    findNextOpenDay() {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = new Date();
      let currentDay = today.getDay();

      // Check next 7 days
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDayData = this.weekSchedule[nextDayIndex];

        if (nextDayData?.is_open) {
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + i);

          this.nextOpenDay = {
            name: dayNames[nextDayIndex],
            date: nextDate.toLocaleDateString(),
            open: this.formatTime(nextDayData.opening_time),
            close: this.formatTime(nextDayData.closing_time),
          };
          break;
        }
      }
    },

    updateCurrentDateTime() {
      const now = new Date();
      this.currentDateTime = now.toLocaleString();
    },
  },
  mounted() {
    this.loadOfficeHours();
  }
};
</script>

<style scoped>
details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}

details > summary::before {
  content: "▶ ";
  margin-right: 0.5rem;
}

details[open] > summary::before {
  content: "▼ ";
}
</style>
