import {
  Filter,
  NumberFilterValue,
  DateFilterValue,
  SelectFilterValue,
  StringFilterValue,
  createNumberFilter,
  createDateFilter,
  createSelectFilter,
  createStringFilter,
} from "~/store/filters";
import {
  FilterConfig,
  getFilterConfig,
  FILTER_CONFIGS,
} from "~/types/filter-config";

// Re-export for convenience
export { getFilterConfig, FILTER_CONFIGS };

// Dynamic filter factory - creates filters based on configuration
export const createFilterFromConfig = (
  config: FilterConfig,
  isActive = false
): Filter => {
  switch (config.type) {
    case "number":
      if (config.inputType === "range") {
        const defaultVal = (config.defaultValue as {
          min: number;
          max: number;
        }) || { min: 0, max: 100 };
        return createNumberFilter(
          config.key,
          { type: "range", min: defaultVal.min, max: defaultVal.max },
          isActive
        );
      } else {
        return createNumberFilter(
          config.key,
          { type: "single", value: (config.defaultValue as number) || 0 },
          isActive
        );
      }

    case "string":
      if (config.inputType === "multiple") {
        return createStringFilter(
          config.key,
          { type: "multiple", values: (config.defaultValue as string[]) || [] },
          isActive
        );
      } else {
        return createStringFilter(
          config.key,
          { type: "single", value: (config.defaultValue as string) || "" },
          isActive
        );
      }

    case "date":
      if (config.inputType === "range") {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Format dates to YYYY-MM-DD format
        const formatDateToString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        return createDateFilter(
          config.key,
          {
            type: "range",
            startDate: formatDateToString(today),
            endDate: formatDateToString(nextWeek),
          },
          isActive
        );
      } else {
        // Format default date to YYYY-MM-DD format
        const formatDateToString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        let defaultDate = new Date();
        if (
          config.defaultValue instanceof Date &&
          !isNaN(config.defaultValue.getTime())
        ) {
          defaultDate = new Date(config.defaultValue);
        }

        return createDateFilter(
          config.key,
          {
            type: "single",
            value: formatDateToString(defaultDate),
          },
          isActive
        );
      }

    case "select":
      if (config.inputType === "multiple") {
        return createSelectFilter(
          config.key,
          {
            type: "multiple",
            values: (config.defaultValue as (string | number)[]) || [],
          },
          isActive
        );
      } else {
        return createSelectFilter(
          config.key,
          { type: "single", value: config.defaultValue || "" },
          isActive
        );
      }

    default:
      throw new Error(`Unsupported filter type: ${config.type}`);
  }
};

// Create all default filters from configurations
export const createAllDefaultFilters = (): Filter[] => {
  return FILTER_CONFIGS.map((config) => createFilterFromConfig(config, false));
};

// Helper to toggle filter mode (single <-> range) if supported
export const toggleFilterMode = (filter: Filter): Filter => {
  const config = getFilterConfig(filter.key);
  if (!config?.ui?.allowModeToggle) return filter;

  switch (filter.filterType) {
    case "number":
      if (filter.value.type === "single") {
        const currentValue = filter.value.value;
        return createNumberFilter(
          filter.key,
          {
            type: "range",
            min: 0,
            max: currentValue || config.validation?.max || 1000,
          },
          filter.isActive
        );
      } else {
        return createNumberFilter(
          filter.key,
          { type: "single", value: filter.value.max },
          filter.isActive
        );
      }

    case "date":
      if (filter.value.type === "single") {
        const currentDate = filter.value.value;
        const currentDateObj = new Date(currentDate + "T00:00:00.000Z");
        const endDateObj = new Date(currentDateObj);
        endDateObj.setDate(endDateObj.getDate() + 7);

        const formatDateToString = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        return createDateFilter(
          filter.key,
          {
            type: "range",
            startDate: currentDate,
            endDate: formatDateToString(endDateObj),
          },
          filter.isActive
        );
      } else {
        return createDateFilter(
          filter.key,
          { type: "single", value: filter.value.startDate },
          filter.isActive
        );
      }

    default:
      return filter;
  }
};

// Get smart display value with config-aware formatting
export const getSmartDisplayValue = (filter: Filter): string => {
  const config = getFilterConfig(filter.key);

  switch (filter.filterType) {
    case "number":
      if (filter.value.type === "single") {
        const value = filter.value.value;
        if (value <= 0) return "";
        const formatted = config?.ui?.showCurrency
          ? `$${value}`
          : value.toString();
        return formatted;
      } else {
        const { min, max } = filter.value;
        if (min <= 0 && max >= (config?.validation?.max || 1000)) return "";
        const minFormatted = config?.ui?.showCurrency
          ? `$${min}`
          : min.toString();
        const maxFormatted = config?.ui?.showCurrency
          ? `$${max}`
          : max.toString();
        return `${minFormatted} - ${maxFormatted}`;
      }

    case "string":
      if (filter.value.type === "single") {
        return filter.value.value;
      } else {
        const values = filter.value.values;
        if (values.length === 0) return "";
        if (values.length <= 2) return values.join(", ");
        return `${values.slice(0, 2).join(", ")}, +${values.length - 2} more`;
      }

    case "date":
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString || typeof dateString !== "string") return "";

        // Parse YYYY-MM-DD format
        const date = new Date(dateString + "T00:00:00.000Z");
        if (isNaN(date.getTime())) return "";

        const format = config?.ui?.dateFormat || "MMM dd";
        return date
          .toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            ...(format.includes("yyyy") && { year: "numeric" }),
          })
          .replace(/(\w+) (\d+)/, "$2 $1");
      };

      if (filter.value.type === "single") {
        return formatDate(filter.value.value);
      } else {
        const startFormatted = formatDate(filter.value.startDate);
        const endFormatted = formatDate(filter.value.endDate);
        if (!startFormatted || !endFormatted) return "";
        return `${startFormatted} - ${endFormatted}`;
      }

    case "select":
      if (filter.value.type === "single") {
        const value = filter.value.value;
        if (!value) return "";

        // Find option label
        const option = config?.options?.find((opt) => opt.value === value);
        if (option) return option.label;

        // Special formatting for known types
        if (filter.key === "rating" && typeof value === "number") {
          return `${value}+ Stars`;
        }
        if (filter.key === "meetingDuration" && typeof value === "number") {
          return value >= 60
            ? `${Math.floor(value / 60)}h${value % 60 ? ` ${value % 60}m` : ""}`
            : `${value}m`;
        }

        return value.toString();
      } else {
        const values = filter.value.values;
        if (values.length === 0) return "";

        // Get labels for values
        const labels = values.map((value) => {
          const option = config?.options?.find((opt) => opt.value === value);
          return option?.label || value.toString();
        });

        if (labels.length <= 2) return labels.join(", ");
        return `${labels.slice(0, 2).join(", ")}, +${labels.length - 2} more`;
      }

    default:
      return "";
  }
};

// Validate filter value against config rules
export const validateFilterValue = (filter: Filter): boolean => {
  const config = getFilterConfig(filter.key);
  if (!config) return true;

  switch (filter.filterType) {
    case "number":
      if (filter.value.type === "single") {
        const value = filter.value.value;
        const min = config.validation?.min ?? -Infinity;
        const max = config.validation?.max ?? Infinity;
        return value >= min && value <= max;
      } else {
        const { min: filterMin, max: filterMax } = filter.value;
        const configMin = config.validation?.min ?? -Infinity;
        const configMax = config.validation?.max ?? Infinity;
        return (
          filterMin >= configMin &&
          filterMax <= configMax &&
          filterMin <= filterMax
        );
      }

    case "string":
      if (config.validation?.required) {
        return filter.value.type === "single"
          ? filter.value.value.length > 0
          : filter.value.values.length > 0;
      }
      return true;

    case "date":
      if (filter.value.type === "range") {
        return filter.value.startDate <= filter.value.endDate;
      }
      return true;

    case "select":
      if (config.validation?.required) {
        return filter.value.type === "single"
          ? filter.value.value !== null &&
              filter.value.value !== undefined &&
              filter.value.value !== ""
          : filter.value.values.length > 0;
      }
      return true;

    default:
      return true;
  }
};

// Format filter value for API/database queries
export const formatFilterForAPI = (filter: Filter) => {
  if (!filter.isActive) return null;

  switch (filter.filterType) {
    case "number":
      if (filter.value.type === "single") {
        return { [filter.key]: filter.value.value };
      } else {
        return {
          [`${filter.key}_min`]: filter.value.min,
          [`${filter.key}_max`]: filter.value.max,
        };
      }

    case "date":
      if (filter.value.type === "single") {
        // For single date, pass the YYYY-MM-DD format directly
        return { [filter.key]: filter.value.value };
      } else {
        // For date range, pass both start and end dates in YYYY-MM-DD format
        return {
          [`${filter.key}_start`]: filter.value.startDate,
          [`${filter.key}_end`]: filter.value.endDate,
        };
      }

    case "string":
      if (filter.value.type === "single") {
        return { [filter.key]: filter.value.value };
      } else {
        return { [filter.key]: filter.value.values };
      }

    case "select":
      if (filter.value.type === "single") {
        // Special handling for category filter - pass the category name
        if (filter.key === "category") {
          return { category: filter.value.value };
        }
        return { [filter.key]: filter.value.value };
      } else {
        return { [filter.key]: filter.value.values };
      }

    default:
      return null;
  }
};
