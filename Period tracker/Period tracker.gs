/**
 * Period Cycle Tracker for Google Calendar
 *
 * This script helps you track and predict your menstrual cycle by creating
 * calendar events automatically.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Calendar (calendar.google.com)
 * 2. Click Settings (gear icon) > Settings
 * 3. Scroll down to "Integrate calendar" and copy your Calendar ID
 * 4. In this script, replace YOUR_CALENDAR_ID with your actual calendar ID
 * 5. Set your cycle parameters in the CONFIG section below
 * 6. Run the 'setupPeriodTracker' function first to authorize
 * 7. Run 'createPeriodEvents' to generate your cycle events
 */

// ============== CONFIGURATION ==============
const CONFIG = {
  // Your Google Calendar ID (find it in Calendar Settings)
  calendarId:
    "12a842b6f6fcad8e9b6db066fd72f17e7415e9d97bc86c97493ff55da6bf8b8b@group.calendar.google.com", // Usually your email or 'primary' for main calendar

  // Cycle Settings
  averageCycleLength: 28, // Average number of days in your cycle
  periodLength: 5, // How many days your period typically lasts

  // Date Settings
  lastPeriodStart: "2026-01-6", // YYYY-MM-DD format - your last period start date
  monthsToPredict: 6, // How many months ahead to create predictions

  // Event Customization
  periodEventTitle: "🩸 Period",
  ovulationEventTitle: "🥚 Ovulation Window",
  fertileWindowTitle: "💚 Fertile Window",

  // Colors (Google Calendar color IDs)
  // 1=Lavender, 2=Sage, 3=Grape, 4=Flamingo, 5=Banana, 6=Tangerine,
  // 7=Peacock, 8=Graphite, 9=Blueberry, 10=Basil, 11=Tomato
  periodColor: "11", // Red/Tomato
  ovulationColor: "5", // Yellow/Banana
  fertileColor: "10", // Green/Basil

  // Event Options
  createAllDayEvents: true,
  addReminders: true,
  reminderDaysBefore: 2,

  // What to track
  trackPeriod: true,
  trackOvulation: false,
  trackFertileWindow: false,
};

// ============== MAIN FUNCTIONS ==============

/**
 * Initial setup function - Run this first to authorize the script
 */
function setupPeriodTracker() {
  Logger.log("Setting up Period Tracker...");

  // Check if calendar exists
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
    if (!calendar) {
      Logger.log(
        "ERROR: Calendar not found. Please check your calendarId in CONFIG.",
      );
      return;
    }
    Logger.log("✓ Calendar found: " + calendar.getName());
    Logger.log(
      "✓ Setup complete! Now run createPeriodEvents() to generate your cycle events.",
    );
  } catch (e) {
    Logger.log("ERROR: " + e.message);
    Logger.log(
      "Please make sure you have entered your Calendar ID in the CONFIG section.",
    );
  }
}

/**
 * Creates period cycle events for the specified number of months
 */
function createPeriodEvents() {
  Logger.log("Creating period cycle events...");

  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  if (!calendar) {
    Logger.log("ERROR: Calendar not found. Run setupPeriodTracker() first.");
    return;
  }

  const startDate = new Date(CONFIG.lastPeriodStart);
  let cycleNumber = 1;
  let eventsCreated = 0;

  // Calculate how many cycles to create
  const totalDays = CONFIG.monthsToPredict * 30;
  const numberOfCycles = Math.ceil(totalDays / CONFIG.averageCycleLength);

  for (let i = 0; i < numberOfCycles; i++) {
    const cycleStartDate = new Date(startDate);
    cycleStartDate.setDate(
      cycleStartDate.getDate() + i * CONFIG.averageCycleLength,
    );

    // Create period events
    if (CONFIG.trackPeriod) {
      eventsCreated += createPeriodDays(calendar, cycleStartDate, cycleNumber);
    }

    // Create ovulation event
    if (CONFIG.trackOvulation) {
      eventsCreated += createOvulationEvent(
        calendar,
        cycleStartDate,
        cycleNumber,
      );
    }

    // Create fertile window events
    if (CONFIG.trackFertileWindow) {
      eventsCreated += createFertileWindow(
        calendar,
        cycleStartDate,
        cycleNumber,
      );
    }

    cycleNumber++;
  }

  Logger.log(
    "✓ Complete! Created " +
      eventsCreated +
      " events for " +
      numberOfCycles +
      " cycles.",
  );
}

/**
 * Creates period day events
 */
function createPeriodDays(calendar, cycleStart, cycleNumber) {
  let count = 0;

  for (let day = 0; day < CONFIG.periodLength; day++) {
    const eventDate = new Date(cycleStart);
    eventDate.setDate(eventDate.getDate() + day);

    const title = CONFIG.periodEventTitle + " (Day " + (day + 1) + ")";
    const description = "Cycle #" + cycleNumber + " - Period Day " + (day + 1);

    createEvent(calendar, title, eventDate, description, CONFIG.periodColor);
    count++;
  }

  return count;
}

/**
 * Creates ovulation event (typically day 14 of cycle)
 */
function createOvulationEvent(calendar, cycleStart, cycleNumber) {
  const ovulationDay = 14; // Standard ovulation day
  const eventDate = new Date(cycleStart);
  eventDate.setDate(eventDate.getDate() + ovulationDay - 1);

  const title = CONFIG.ovulationEventTitle;
  const description = "Cycle #" + cycleNumber + " - Estimated ovulation day";

  createEvent(calendar, title, eventDate, description, CONFIG.ovulationColor);
  return 1;
}

/**
 * Creates fertile window events (typically days 10-15 of cycle)
 */
function createFertileWindow(calendar, cycleStart, cycleNumber) {
  const fertileStart = 10;
  const fertileEnd = 15;
  let count = 0;

  for (let day = fertileStart; day <= fertileEnd; day++) {
    const eventDate = new Date(cycleStart);
    eventDate.setDate(eventDate.getDate() + day - 1);

    const title = CONFIG.fertileWindowTitle;
    const description =
      "Cycle #" +
      cycleNumber +
      " - Fertile window day " +
      (day - fertileStart + 1);

    createEvent(calendar, title, eventDate, description, CONFIG.fertileColor);
    count++;
  }

  return count;
}

/**
 * Helper function to create a calendar event
 */
function createEvent(calendar, title, date, description, colorId) {
  try {
    let event;

    if (CONFIG.createAllDayEvents) {
      event = calendar.createAllDayEvent(title, date, {
        description: description,
      });
    } else {
      const endDate = new Date(date);
      endDate.setHours(date.getHours() + 1);
      event = calendar.createEvent(title, date, endDate, {
        description: description,
      });
    }

    event.setColor(colorId);

    // Add reminder for period start
    if (
      CONFIG.addReminders &&
      title.includes(CONFIG.periodEventTitle) &&
      title.includes("Day 1")
    ) {
      const reminderDate = new Date(date);
      reminderDate.setDate(reminderDate.getDate() - CONFIG.reminderDaysBefore);
      event.addPopupReminder(CONFIG.reminderDaysBefore * 24 * 60); // minutes before
    }
  } catch (e) {
    Logger.log("Error creating event: " + e.message);
  }
}

/**
 * Deletes all period-related events (cleanup function)
 * Use this if you want to start fresh
 */
function deleteAllPeriodEvents() {
  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  if (!calendar) {
    Logger.log("ERROR: Calendar not found.");
    return;
  }

  const searchTerms = [
    CONFIG.periodEventTitle,
    CONFIG.ovulationEventTitle,
    CONFIG.fertileWindowTitle,
  ];

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + CONFIG.monthsToPredict + 1);

  let deletedCount = 0;

  searchTerms.forEach((term) => {
    const events = calendar.getEvents(startDate, endDate, { search: term });
    events.forEach((event) => {
      event.deleteEvent();
      deletedCount++;
    });
  });

  Logger.log("✓ Deleted " + deletedCount + " events.");
}

/**
 * Updates cycle length based on actual data
 * Call this after tracking for a few months to adjust predictions
 */
function updateCycleLength(newAverageCycleLength) {
  CONFIG.averageCycleLength = newAverageCycleLength;
  Logger.log(
    "Updated average cycle length to: " + newAverageCycleLength + " days",
  );
  Logger.log(
    "Run deleteAllPeriodEvents() then createPeriodEvents() to regenerate with new cycle length.",
  );
}
