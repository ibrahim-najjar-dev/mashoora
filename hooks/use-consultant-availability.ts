import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "~/convex/_generated/api";

export type DayAvailability = {
  day: string;
  isActive: boolean;
  timesRanges: { from: string; to: string }[];
};

export const useConsultantAvailability = (clerkUserId: string) => {
  const [localAvailability, setLocalAvailability] = useState<DayAvailability[]>(
    [
      { day: "Monday", isActive: false, timesRanges: [] },
      { day: "Tuesday", isActive: false, timesRanges: [] },
      { day: "Wednesday", isActive: false, timesRanges: [] },
      { day: "Thursday", isActive: false, timesRanges: [] },
      { day: "Friday", isActive: false, timesRanges: [] },
      { day: "Saturday", isActive: false, timesRanges: [] },
      { day: "Sunday", isActive: false, timesRanges: [] },
    ]
  );

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch existing availability from database
  const existingAvailability = useQuery(
    api.availability.getConsultantAvailability,
    clerkUserId ? { clerkUserId } : "skip"
  );

  // Mutations
  const updateWeeklyAvailability = useMutation(
    api.availability.updateConsultantWeeklyAvailability
  );
  const updateDayAvailability = useMutation(
    api.availability.updateConsultantDayAvailability
  );

  // Load existing data when it becomes available
  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      setLocalAvailability(existingAvailability);
      setHasUnsavedChanges(false);
    }
  }, [existingAvailability]);

  // Update a specific day's availability
  const updateDay = (dayIndex: number, updates: Partial<DayAvailability>) => {
    setLocalAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dayIndex] = { ...newAvailability[dayIndex], ...updates };
      return newAvailability;
    });
    setHasUnsavedChanges(true);
  };

  // Toggle day active state
  const toggleDayActive = (dayIndex: number) => {
    const currentDay = localAvailability[dayIndex];
    const newActiveState = !currentDay.isActive;

    updateDay(dayIndex, {
      isActive: newActiveState,
      timesRanges: newActiveState ? [{ from: "9:00 am", to: "5:00 pm" }] : [],
    });
  };

  // Update time ranges for a specific day
  const updateTimeRanges = (
    dayIndex: number,
    newRanges: { from: string; to: string }[]
  ) => {
    updateDay(dayIndex, { timesRanges: newRanges });
  };

  // Add a new time range to a day
  const addTimeRange = (dayIndex: number) => {
    const currentDay = localAvailability[dayIndex];
    const newRanges = [
      ...currentDay.timesRanges,
      { from: "9:00 am", to: "5:00 pm" },
    ];
    updateTimeRanges(dayIndex, newRanges);
  };

  // Remove a time range from a day
  const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
    const currentDay = localAvailability[dayIndex];
    const newRanges = currentDay.timesRanges.filter((_, i) => i !== rangeIndex);
    updateTimeRanges(dayIndex, newRanges);
  };

  // Update a specific time in a range
  const updateTimeInRange = (
    dayIndex: number,
    rangeIndex: number,
    timeType: "from" | "to",
    newTime: string
  ) => {
    const currentDay = localAvailability[dayIndex];
    const newRanges = [...currentDay.timesRanges];
    newRanges[rangeIndex] = {
      ...newRanges[rangeIndex],
      [timeType]: newTime,
    };
    updateTimeRanges(dayIndex, newRanges);
  };

  // Save all changes to database
  const saveAvailability = async () => {
    if (!clerkUserId) {
      throw new Error("No user ID provided");
    }

    try {
      await updateWeeklyAvailability({
        clerkUserId,
        weeklyAvailability: localAvailability,
      });
      setHasUnsavedChanges(false);
      return { success: true };
    } catch (error) {
      console.error("Failed to save availability:", error);
      return { success: false, error };
    }
  };

  // Save a specific day's availability
  const saveDayAvailability = async (dayIndex: number) => {
    if (!clerkUserId) {
      throw new Error("No user ID provided");
    }

    const dayData = localAvailability[dayIndex];

    try {
      await updateDayAvailability({
        clerkUserId,
        dayOfWeek: dayData.day as any,
        isActive: dayData.isActive,
        timeRanges: dayData.timesRanges,
      });

      // Mark this day as saved by updating hasUnsavedChanges logic
      // You might want to track per-day changes for more granular control
      return { success: true };
    } catch (error) {
      console.error("Failed to save day availability:", error);
      return { success: false, error };
    }
  };

  // Reset to last saved state
  const resetChanges = () => {
    if (existingAvailability && existingAvailability.length > 0) {
      setLocalAvailability(existingAvailability);
    } else {
      setLocalAvailability([
        { day: "Monday", isActive: false, timesRanges: [] },
        { day: "Tuesday", isActive: false, timesRanges: [] },
        { day: "Wednesday", isActive: false, timesRanges: [] },
        { day: "Thursday", isActive: false, timesRanges: [] },
        { day: "Friday", isActive: false, timesRanges: [] },
        { day: "Saturday", isActive: false, timesRanges: [] },
        { day: "Sunday", isActive: false, timesRanges: [] },
      ]);
    }
    setHasUnsavedChanges(false);
  };

  return {
    availability: localAvailability,
    hasUnsavedChanges,
    isLoading: existingAvailability === undefined,

    // Day-level operations
    toggleDayActive,
    updateDay,

    // Time range operations
    addTimeRange,
    removeTimeRange,
    updateTimeInRange,
    updateTimeRanges,

    // Save operations
    saveAvailability,
    saveDayAvailability,
    resetChanges,
  };
};
