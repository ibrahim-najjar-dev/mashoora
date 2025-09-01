import { z } from "zod";

// Enhanced filter configuration schema
export const filterConfigSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["number", "string", "date", "select"]),
  inputType: z.enum(["single", "range", "multiple"]).optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
      })
    )
    .optional(),
  defaultValue: z.any().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      required: z.boolean().optional(),
    })
    .optional(),
  ui: z
    .object({
      icon: z.string(),
      placeholder: z.string().optional(),
      allowModeToggle: z.boolean().optional(), // For price/date range toggle
      multiSelect: z.boolean().optional(),
      showCurrency: z.boolean().optional(),
      dateFormat: z.string().optional(),
    })
    .optional(),
});

export type FilterConfig = z.infer<typeof filterConfigSchema>;

// Filter configurations with complete metadata
export const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: "price",
    label: "Price",
    type: "number",
    inputType: "single", // Can be toggled to "range"
    defaultValue: 0,
    validation: {
      min: 0,
      max: 10000,
    },
    ui: {
      icon: "CircleDollarSign",
      placeholder: "Enter price",
      allowModeToggle: true,
      showCurrency: true,
    },
  },
  {
    key: "availableDates",
    label: "Available Dates",
    type: "date",
    inputType: "single", // Can be toggled to "range"
    defaultValue: new Date(),
    ui: {
      icon: "CalendarDays",
      placeholder: "Select date",
      allowModeToggle: true,
      dateFormat: "MMM dd, yyyy",
    },
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    inputType: "single",
    options: [
      { label: "Business Consulting", value: "business" },
      { label: "Life Coaching", value: "life" },
      { label: "Career Guidance", value: "career" },
      { label: "Health & Wellness", value: "health" },
      { label: "Financial Planning", value: "financial" },
      { label: "Legal Advice", value: "legal" },
      { label: "Technology", value: "technology" },
      { label: "Education", value: "education" },
    ],
    defaultValue: "",
    validation: {
      required: false,
    },
    ui: {
      icon: "Tag",
      placeholder: "Select category",
    },
  },
  {
    key: "meetingDuration",
    label: "Meeting Duration",
    type: "select",
    inputType: "single",
    options: [
      { label: "15 minutes", value: 15 },
      { label: "30 minutes", value: 30 },
      { label: "45 minutes", value: 45 },
      { label: "1 hour", value: 60 },
      { label: "1.5 hours", value: 90 },
      { label: "2 hours", value: 120 },
    ],
    defaultValue: 30,
    ui: {
      icon: "Clock9",
      placeholder: "Select duration",
    },
  },
  {
    key: "rating",
    label: "Rating",
    type: "select",
    inputType: "single",
    options: [
      { label: "5 Stars", value: 5 },
      { label: "4+ Stars", value: 4 },
      { label: "3+ Stars", value: 3 },
      { label: "2+ Stars", value: 2 },
      { label: "1+ Stars", value: 1 },
    ],
    defaultValue: 0,
    ui: {
      icon: "Star",
      placeholder: "Select minimum rating",
    },
  },
  {
    key: "spokenLanguages",
    label: "Spoken Languages",
    type: "select",
    inputType: "multiple",
    options: [
      { label: "English", value: "en" },
      { label: "Arabic", value: "ar" },
      { label: "French", value: "fr" },
      { label: "Spanish", value: "es" },
      { label: "German", value: "de" },
      { label: "Italian", value: "it" },
      { label: "Portuguese", value: "pt" },
      { label: "Russian", value: "ru" },
      { label: "Chinese", value: "zh" },
      { label: "Japanese", value: "ja" },
      { label: "Korean", value: "ko" },
      { label: "Hindi", value: "hi" },
    ],
    defaultValue: [],
    ui: {
      icon: "Globe",
      placeholder: "Select languages",
      multiSelect: true,
    },
  },
  {
    key: "location",
    label: "Location",
    type: "string",
    inputType: "single",
    defaultValue: "",
    ui: {
      icon: "MapPin",
      placeholder: "Enter location",
    },
  },
  {
    key: "experience",
    label: "Years of Experience",
    type: "number",
    inputType: "range",
    defaultValue: { min: 0, max: 20 },
    validation: {
      min: 0,
      max: 50,
    },
    ui: {
      icon: "Award",
      placeholder: "Years of experience",
    },
  },
];

// Helper to get filter config by key
export const getFilterConfig = (key: string): FilterConfig | undefined => {
  return FILTER_CONFIGS.find((config) => config.key === key);
};

// Helper to get all filter keys
export const getAllFilterKeys = (): string[] => {
  return FILTER_CONFIGS.map((config) => config.key);
};

// Helper to validate a filter config
export const validateFilterConfig = (
  config: unknown
): config is FilterConfig => {
  try {
    filterConfigSchema.parse(config);
    return true;
  } catch {
    return false;
  }
};
