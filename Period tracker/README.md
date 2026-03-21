I've created a comprehensive Google Apps Script for tracking your period cycle so you don't have to download an app for it! Here's how to use it:

# Quick Setup Steps:

## Open Google Apps Script:

- Go to [Google Apps Script](https://script.google.com)
- Click "New Project"
- Delete any default code and paste in the [period tracker script](./Period%20tracker.gs)

## Configure Your Settings:

- Find your Calendar ID: Go to Google Calendar Settings → find your calendar → copy the Calendar ID (or use 'primary' for your main calendar)

### Update the CONFIG section with:

- Your calendar ID
- Your average cycle length (default is 28 days)
- Your period length (default is 5 days)
- The start date of your last period
- How many months to predict

## Run the Script:

First run setupPeriodTracker (you'll need to authorize it)
Then run createPeriodEvents to generate all your cycle events

# Features:

🩸 Tracks period days with day count
🥚 Marks ovulation day (day 14)
💚 Shows fertile window (days 10-15)
Color-coded events (red for period, yellow for ovulation, green for fertile window)
Automatic reminders 2 days before period
Easy cleanup function if you want to regenerate events

The script includes a deleteAllPeriodEvents() function if you ever want to clear everything and start fresh with updated settings!

# Main Functions (The ones you'll use)

## setupPeriodTracker()

### What it does:

This is a test function to make sure everything is connected properly.

Checks if your Calendar ID is correct
Verifies the script can access your calendar
Confirms permissions are set up

### When to run it:

First time you set up the script
If you change your Calendar ID
If you're getting errors and want to troubleshoot

What happens: You'll see a message in the log saying either "Calendar found" (success) or an error message.

## createPeriodEvents()

### What it does: This is the main function that creates all your period tracking events.

Calculates how many cycles to create based on monthsToPredict
For each cycle, it creates events based on what you have enabled:

Period days (if trackPeriod: true)
Ovulation day (if trackOvulation: true)
Fertile window days (if trackFertileWindow: true)

Colors each type of event differently
Adds reminders if enabled

### When to run it:

After initial setup
Whenever you want to add more predictions into the future
After deleting old events and updating configuration

### What happens:

Calendar events appear in your Google Calendar for the next X months (based on your monthsToPredict setting).

## deleteAllPeriodEvents()

### What it does:

Removes ALL period-related events that were created by this script.

Searches for events with titles matching your period, ovulation, and fertile window event names
Deletes every event it finds within the prediction timeframe

### When to run it:

Before re-running createPeriodEvents() with new settings
If you made a mistake and want to start over
If you want to change your cycle length or prediction timeframe

### What happens:

All period tracking events disappear from your calendar (your other events are safe - it only deletes events with the specific titles from CONFIG).
⚠️ Warning: This permanently deletes events - there's no undo!

## updateCycleLength(newAverageCycleLength)

### What it does:

Changes your average cycle length setting.

Updates the CONFIG.averageCycleLength value
Tells you what to do next (delete old events and create new ones)

### When to run it:

After tracking for a few months and noticing your actual cycle is different from what you estimated
Example: If you set 28 days but your cycles are actually 30 days

### How to use it:

In the script editor, you'd type: updateCycleLength(30) to change to 30 days
Then follow the instructions to delete and recreate events

### What happens:

Just updates the setting - you still need to delete and recreate events for the change to show up.

# Helper Functions (These run automatically, you don't run them directly)

## createPeriodDays()

### What it does: Creates the actual period day events

Called automatically by createPeriodEvents()
Creates one event for each day of your period
Labels them "Period (Day 1)", "Period (Day 2)", etc.
Uses the red/tomato color

You don't run this directly - it's called automatically when you run createPeriodEvents().

## createOvulationEvent()

### What it does: Creates the ovulation day event

Called automatically by createPeriodEvents()
Typically marks day 14 of your cycle (standard ovulation timing)
Creates one event per cycle
Uses the yellow/banana color

You don't run this directly - it's called automatically when you run createPeriodEvents().

## createFertileWindow()

### What it does: Creates fertile window events

Called automatically by createPeriodEvents()
Marks days 10-15 of your cycle (the fertile window)
Creates 6 events per cycle
Uses the green/basil color

You don't run this directly - it's called automatically when you run createPeriodEvents().

## createEvent()

### What it does: The core function that actually adds an event to your calendar

Takes all the details (title, date, description, color)
Creates either an all-day event or timed event (based on createAllDayEvents setting)
Adds reminders if enabled and if it's the first day of period

You don't run this directly - it's used by all the other creation functions.

# Typical Usage Flow:

First time: setupPeriodTracker() → createPeriodEvents()
Changing settings: deleteAllPeriodEvents() → createPeriodEvents()
Adjusting cycle length: updateCycleLength(30) → deleteAllPeriodEvents() → createPeriodEvents()

# The Basic Logic

The script uses a simple pattern that repeats over and over:
"Your cycle repeats every X days"
Example with 28-day cycle:
Last period started: January 15, 2026

Cycle 1: January 15 (your actual last period)
Cycle 2: January 15 + 28 days = February 12
Cycle 3: February 12 + 28 days = March 12
Cycle 4: March 12 + 28 days = April 9
... and so on

## What Gets Created for Each Cycle:

For each predicted cycle start date, the script creates:

### Period Days (Days 1-5)

Day 1 = Cycle start date
Day 2 = Cycle start + 1 day
Day 3 = Cycle start + 2 days
Day 4 = Cycle start + 3 days
Day 5 = Cycle start + 4 days

### Ovulation (Day 14)

Cycle start + 13 days = Day 14 (ovulation typically happens mid-cycle)

### Fertile Window (Days 10-15)

Cycle start + 9 days = Day 10
Cycle start + 10 days = Day 11
... up to Day 15

Visual Example:
January 15 (Cycle Start)
├─ Day 1-5: Period 🩸
├─ Day 10-15: Fertile Window 💚
└─ Day 14: Ovulation 🥚

February 12 (Next Cycle Start - 28 days later)
├─ Day 1-5: Period 🩸
├─ Day 10-15: Fertile Window 💚
└─ Day 14: Ovulation 🥚
Key Points:

It's an estimate - Real cycles vary, but the script uses your average
Starts from your last known period - Everything counts forward from there
Repeats the same pattern - Every cycle follows the same day counts
Creates predictions for months ahead - Based on your monthsToPredict setting
