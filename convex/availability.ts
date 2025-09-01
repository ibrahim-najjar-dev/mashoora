import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// Convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h: string): string => {
  const [time, period] = time12h.toLowerCase().trim().split(/\s+/);
  let [hours, minutes] = time.split(":").map((str) => str.padStart(2, "0"));

  if (period === "pm" && hours !== "12") {
    hours = String(parseInt(hours) + 12).padStart(2, "0");
  } else if (period === "am" && hours === "12") {
    hours = "00";
  }

  return `${hours}:${minutes}`;
};

// Convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${minutes} ${period}`;
};

// Get consultant's weekly availability
export const getConsultantAvailability = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    // First get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      return [];
    }

    // Get all availability records for this consultant
    const availabilityRecords = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();

    // Convert to the format expected by the UI
    const weeklyAvailability = DAYS_OF_WEEK.map((day) => {
      const dayRecord = availabilityRecords.find(
        (record) => record.dayOfWeek === day
      );

      if (!dayRecord || !dayRecord.isActive) {
        return {
          day,
          isActive: false,
          timesRanges: [],
        };
      }

      return {
        day,
        isActive: true,
        timesRanges: dayRecord.timeRanges.map((range) => ({
          from: convertTo12Hour(range.startTime),
          to: convertTo12Hour(range.endTime),
        })),
      };
    });

    return weeklyAvailability;
  },
});

// Save or update consultant's availability for a specific day
export const updateConsultantDayAvailability = mutation({
  args: {
    clerkUserId: v.string(),
    dayOfWeek: v.union(
      v.literal("Monday"),
      v.literal("Tuesday"),
      v.literal("Wednesday"),
      v.literal("Thursday"),
      v.literal("Friday"),
      v.literal("Saturday"),
      v.literal("Sunday")
    ),
    isActive: v.boolean(),
    timeRanges: v.array(
      v.object({
        from: v.string(), // 12-hour format: "9:00 am"
        to: v.string(), // 12-hour format: "5:00 pm"
      })
    ),
  },
  handler: async (ctx, { clerkUserId, dayOfWeek, isActive, timeRanges }) => {
    // First get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Convert time ranges to 24-hour format for storage
    const convertedTimeRanges = timeRanges.map((range) => ({
      startTime: convertTo24Hour(range.from),
      endTime: convertTo24Hour(range.to),
    }));

    // Check if availability record exists for this day
    const existingRecord = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserIdAndDay", (q) =>
        q.eq("userId", user._id).eq("dayOfWeek", dayOfWeek)
      )
      .first();

    const now = Date.now();

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, {
        isActive,
        timeRanges: convertedTimeRanges,
        updatedAt: now,
      });

      return existingRecord._id;
    } else {
      // Create new record
      const availabilityId = await ctx.db.insert("consultantAvailability", {
        userId: user._id,
        dayOfWeek,
        isActive,
        timeRanges: convertedTimeRanges,
        createdAt: now,
        updatedAt: now,
      });

      return availabilityId;
    }
  },
});

// Save complete weekly availability (batch update)
export const updateConsultantWeeklyAvailability = mutation({
  args: {
    clerkUserId: v.string(),
    weeklyAvailability: v.array(
      v.object({
        day: v.string(),
        isActive: v.boolean(),
        timesRanges: v.array(
          v.object({
            from: v.string(),
            to: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { clerkUserId, weeklyAvailability }) => {
    // First get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const results = [];

    // Update each day's availability
    for (const dayData of weeklyAvailability) {
      if (!DAYS_OF_WEEK.includes(dayData.day as any)) {
        continue; // Skip invalid day names
      }

      // Convert time ranges to 24-hour format for storage
      const convertedTimeRanges = dayData.timesRanges.map((range) => ({
        startTime: convertTo24Hour(range.from),
        endTime: convertTo24Hour(range.to),
      }));

      // Check if availability record exists for this day
      const existingRecord = await ctx.db
        .query("consultantAvailability")
        .withIndex("byUserIdAndDay", (q) =>
          q.eq("userId", user._id).eq("dayOfWeek", dayData.day as any)
        )
        .first();

      const now = Date.now();

      if (existingRecord) {
        // Update existing record
        await ctx.db.patch(existingRecord._id, {
          isActive: dayData.isActive,
          timeRanges: convertedTimeRanges,
          updatedAt: now,
        });

        results.push(existingRecord._id);
      } else {
        // Create new record
        const availabilityId = await ctx.db.insert("consultantAvailability", {
          userId: user._id,
          dayOfWeek: dayData.day as any,
          isActive: dayData.isActive,
          timeRanges: convertedTimeRanges,
          createdAt: now,
          updatedAt: now,
        });

        results.push(availabilityId);
      }
    }

    return {
      message: "Weekly availability updated successfully",
      updatedDays: results.length,
    };
  },
});

// Get availability for a specific consultant on a specific day (useful for booking)
export const getConsultantDayAvailability = query({
  args: {
    consultantClerkUserId: v.string(),
    dayOfWeek: v.union(
      v.literal("Monday"),
      v.literal("Tuesday"),
      v.literal("Wednesday"),
      v.literal("Thursday"),
      v.literal("Friday"),
      v.literal("Saturday"),
      v.literal("Sunday")
    ),
  },
  handler: async (ctx, { consultantClerkUserId, dayOfWeek }) => {
    // First get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) =>
        q.eq("clerkUserId", consultantClerkUserId)
      )
      .first();

    if (!user) {
      return null;
    }

    // Get availability for the specific day
    const dayAvailability = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserIdAndDay", (q) =>
        q.eq("userId", user._id).eq("dayOfWeek", dayOfWeek)
      )
      .first();

    if (!dayAvailability || !dayAvailability.isActive) {
      return null;
    }

    return {
      day: dayOfWeek,
      isActive: dayAvailability.isActive,
      timeRanges: dayAvailability.timeRanges.map((range) => ({
        from: convertTo12Hour(range.startTime),
        to: convertTo12Hour(range.endTime),
        startTime: range.startTime, // Also include 24-hour format for easier processing
        endTime: range.endTime,
      })),
    };
  },
});

// Get all available time slots for a consultant (useful for booking calendar)
export const getConsultantAvailableSlots = query({
  args: {
    consultantClerkUserId: v.string(),
    date: v.string(), // Format: "YYYY-MM-DD"
  },
  handler: async (ctx, { consultantClerkUserId, date }) => {
    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
    }) as any;

    // Get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) =>
        q.eq("clerkUserId", consultantClerkUserId)
      )
      .first();

    if (!user) {
      return [];
    }

    // Get availability for the specific day
    const dayAvailability = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserIdAndDay", (q) =>
        q.eq("userId", user._id).eq("dayOfWeek", dayOfWeek)
      )
      .first();

    if (!dayAvailability || !dayAvailability.isActive) {
      return [];
    }

    // Get existing bookings for this date
    const existingBookings = await ctx.db
      .query("bookings")
      .filter((q) =>
        q.and(
          q.eq(q.field("date"), date),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    // Generate 1-hour time slots from the available time ranges
    const availableSlots = [];

    for (const timeRange of dayAvailability.timeRanges) {
      // Parse start and end times
      const [startHour, startMinute] = timeRange.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = timeRange.endTime.split(":").map(Number);

      // Convert to minutes for easier calculation
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Generate 30-minute slots (30 minutes each)
      for (
        let currentMinutes = startMinutes;
        currentMinutes < endMinutes;
        currentMinutes += 30
      ) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMinute = currentMinutes % 60;

        // Format times
        const slotStartTime = `${slotStartHour.toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`;

        // Check if this slot conflicts with existing bookings
        const isBooked = existingBookings.some((booking) => {
          return booking.time === slotStartTime;
        });

        // Only add if not within the time range end boundary and not booked
        if (currentMinutes + 30 <= endMinutes && !isBooked) {
          availableSlots.push({
            startTime: slotStartTime,
            displayTime: convertTo12Hour(slotStartTime), // Only show start time
          });
        }
      }
    }

    return availableSlots;
  },
});

// Get available dates for a consultant (for calendar marking)
export const getConsultantAvailableDates = query({
  args: {
    consultantClerkUserId: v.string(),
    startDate: v.optional(v.string()), // Format: "YYYY-MM-DD"
    endDate: v.optional(v.string()), // Format: "YYYY-MM-DD"
  },
  handler: async (ctx, { consultantClerkUserId, startDate, endDate }) => {
    // Get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) =>
        q.eq("clerkUserId", consultantClerkUserId)
      )
      .first();

    if (!user) {
      return [];
    }

    // Get all availability records for this consultant
    const availabilityRecords = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Create a map of available days
    const availableDays = new Set(
      availabilityRecords.map((record) => record.dayOfWeek)
    );

    // Generate dates for the next 3 months if no range specified
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const availableDates = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (availableDays.has(dayOfWeek as any)) {
        const dateString = currentDate.toISOString().split("T")[0];
        availableDates.push(dateString);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  },
});

// Create dummy data for testing (development only)
export const createDummyAvailability = mutation({
  args: {
    consultantClerkUserId: v.string(),
  },
  handler: async (ctx, { consultantClerkUserId }) => {
    // Get the consultant's user record
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) =>
        q.eq("clerkUserId", consultantClerkUserId)
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    // Create dummy availability data
    const dummyAvailability = [
      {
        dayOfWeek: "Monday" as const,
        isActive: true,
        timeRanges: [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "14:00", endTime: "17:00" },
        ],
      },
      {
        dayOfWeek: "Tuesday" as const,
        isActive: true,
        timeRanges: [
          { startTime: "10:00", endTime: "13:00" },
          { startTime: "15:00", endTime: "18:00" },
        ],
      },
      {
        dayOfWeek: "Wednesday" as const,
        isActive: true,
        timeRanges: [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "13:00", endTime: "16:00" },
        ],
      },
      {
        dayOfWeek: "Thursday" as const,
        isActive: false,
        timeRanges: [],
      },
      {
        dayOfWeek: "Friday" as const,
        isActive: true,
        timeRanges: [
          { startTime: "08:00", endTime: "11:00" },
          { startTime: "14:00", endTime: "17:00" },
        ],
      },
      {
        dayOfWeek: "Saturday" as const,
        isActive: true,
        timeRanges: [{ startTime: "10:00", endTime: "14:00" }],
      },
      {
        dayOfWeek: "Sunday" as const,
        isActive: false,
        timeRanges: [],
      },
    ];

    // Insert or update availability records
    const results = [];
    for (const availability of dummyAvailability) {
      // Check if record exists
      const existingRecord = await ctx.db
        .query("consultantAvailability")
        .withIndex("byUserIdAndDay", (q) =>
          q.eq("userId", user._id).eq("dayOfWeek", availability.dayOfWeek)
        )
        .first();

      if (existingRecord) {
        // Update existing record
        await ctx.db.patch(existingRecord._id, {
          isActive: availability.isActive,
          timeRanges: availability.timeRanges,
          updatedAt: now,
        });
        results.push(existingRecord._id);
      } else {
        // Create new record
        const availabilityId = await ctx.db.insert("consultantAvailability", {
          userId: user._id,
          dayOfWeek: availability.dayOfWeek,
          isActive: availability.isActive,
          timeRanges: availability.timeRanges,
          createdAt: now,
          updatedAt: now,
        });
        results.push(availabilityId);
      }
    }

    return {
      message: "Dummy availability data created successfully",
      createdRecords: results.length,
    };
  },
});

// Create dummy consultant user for testing
export const createDummyConsultant = mutation({
  args: {
    clerkUserId: v.string(),
    phoneNumber: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, phoneNumber, firstName, lastName }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (existingUser) {
      return {
        message: "User already exists",
        userId: existingUser._id,
      };
    }

    const now = Date.now();

    // Create user
    const userId = await ctx.db.insert("users", {
      clerkUserId,
      phonenumber: phoneNumber,
      firstName: firstName || "John",
      lastName: lastName || "Consultant",
      role: "consultant",
      createdAt: now,
      updatedAt: now,
      onBoardingCompleted: true,
    });

    // Create consultant profile
    const consultantProfileId = await ctx.db.insert("consultantProfiles", {
      userId,
      clerkUserId,
      bio: "Experienced consultant available for bookings",
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: "Dummy consultant created successfully",
      userId,
      consultantProfileId,
    };
  },
});
