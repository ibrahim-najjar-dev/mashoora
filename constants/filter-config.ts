import {
  CalendarDays,
  CircleDollarSign,
  Clock9,
  LucideProps,
  Star,
  Globe,
  Tag,
  MapPin,
  Award,
} from "lucide-react-native";
import { FilterConfig, FILTER_CONFIGS } from "~/types/filter-config";
import { createAllDefaultFilters } from "~/utils/filter-helpers";

// Simplified UI config for filter display
export interface FilterUIConfig {
  key: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  CircleDollarSign: CircleDollarSign,
  CalendarDays: CalendarDays,
  Tag: Tag,
  Clock9: Clock9,
  Star: Star,
  Globe: Globe,
  MapPin: MapPin,
  Award: Award,
};

// Convert new config format to simplified UI format
export const filterUIConfigs: Record<string, FilterUIConfig> =
  FILTER_CONFIGS.reduce(
    (acc, config) => {
      acc[config.key] = {
        key: config.key,
        icon: iconMap[config.ui?.icon || "Tag"] || Tag,
        label: config.label,
      };
      return acc;
    },
    {} as Record<string, FilterUIConfig>
  );

// Use the new dynamic filter creation
export const defaultFilters = createAllDefaultFilters();

export const allFilterUIConfigs = Object.values(filterUIConfigs);

// Export the new configurations for advanced usage
export { FILTER_CONFIGS } from "~/types/filter-config";
export { getFilterConfig } from "~/utils/filter-helpers";
