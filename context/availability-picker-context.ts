import { createContext } from "react";
import { AvailibiltyContextProps } from "~/types/availability-picker";

export const WeeklyAvailabilityContext = createContext<AvailibiltyContextProps>(
  {} as AvailibiltyContextProps
);
