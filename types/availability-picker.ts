export type AvailaibilityDates = {
  weeklyAvailability: WeeklyAvailabilityDay[];
}[];

export type WeeklyAvailabilityDay = {
  day: string; // e.g. "Monday"
  hours: { start: string; end: string }[]; // e.g. [{ start: "09:00", end: "12:00" }]
};

export interface AvailibiltyContextProps {
  weeklyAvailability: AvailaibilityDates;
  setWeeklyAvailability: React.Dispatch<
    React.SetStateAction<AvailaibilityDates>
  >;
  handleSheetChanges: (index: number) => void;
  SelectedWeeklyAvailability: WeeklyAvailabilityDay;
}
