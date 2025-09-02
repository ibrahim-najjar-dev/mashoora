import React, { useState, useEffect } from "react";
import { TextInput, View, Pressable } from "react-native";
import { getFilterConfig } from "~/constants/filter-config";
import { Filter } from "~/store/filters";
import { Text } from "../ui/text";
import { cn } from "~/lib/utils";
import { Check } from "lucide-react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/constants/Colors";
// ADD-BACK
// import { DateTimePicker, Slider } from "@expo/ui/swift-ui";

interface DynamicInputProps {
  filter: Filter;
  value: any;
  onValueChange: (value: any) => void;
}

export const DynamicInput: React.FC<DynamicInputProps> = ({
  filter,
  value,
  onValueChange,
}) => {
  const config = getFilterConfig(filter.key);
  const { colorScheme } = useColorScheme();

  if (!config) return null;

  // Render number input
  if (config.type === "number") {
    return (
      <NumberInput
        filter={filter}
        value={value}
        onValueChange={onValueChange}
      />
    );
  }

  if (config.type === "date") {
    return (
      <DateInput filter={filter} value={value} onValueChange={onValueChange} />
    );
  }

  // Render string input
  if (config.type === "string") {
    return (
      <StringInput
        filter={filter}
        value={value}
        onValueChange={onValueChange}
      />
    );
  }

  // Render select input
  if (config.type === "select") {
    return (
      <SelectInput
        filter={filter}
        value={value}
        onValueChange={onValueChange}
      />
    );
  }

  return null;
};

const DateInput: React.FC<DynamicInputProps> = ({
  filter,
  value,
  onValueChange,
}) => {
  // Ensure we have a valid date for the DateTimePicker
  const getInitialDate = () => {
    if (filter.filterType === "date" && filter.value.type === "single") {
      const dateValue = filter.value.value;

      // Handle date strings in YYYY-MM-DD format
      if (typeof dateValue === "string" && dateValue.length > 0) {
        // Parse YYYY-MM-DD format
        const parsedDate = new Date(dateValue + "T00:00:00.000Z");
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      }
    }
    // Return current date as fallback
    return new Date().toISOString();
  };
  const handleDateChange = (date: Date) => {
    // Format date to YYYY-MM-DD format to match schema
    const formatDateToString = (dateObj: Date) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formattedDateString = formatDateToString(date);

    // Ensure we're passing the correct structure for date filters
    if (filter.filterType === "date" && filter.value.type === "single") {
      onValueChange({ type: "single", value: formattedDateString });
    } else {
      // Fallback to just passing the formatted date string
      onValueChange(formattedDateString);
    }
  };

  return (
    <View className="p-4 justify-center items-center">
      {/* <DateTimePicker
        onDateSelected={handleDateChange}
        displayedComponents="date"
        initialDate={getInitialDate()}
        variant="wheel"
      /> */}
    </View>
  );
};

// String Input Component
const StringInput: React.FC<DynamicInputProps> = ({
  filter,
  value,
  onValueChange,
}) => {
  const config = getFilterConfig(filter.key);
  const [inputValue, setInputValue] = useState("");
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (filter.filterType === "string") {
      if (filter.value.type === "single") {
        setInputValue(filter.value.value.toString() || "");
      } else if (filter.value.type === "multiple") {
        setInputValue(filter.value.values.join(", ") || "");
      }
    }
  }, [filter.value, filter.filterType]);

  const handleSubmit = () => {
    if (filter.value.type === "single") {
      onValueChange({ type: "single", value: inputValue });
    } else {
      // For multiple values, split by comma
      const values = inputValue
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      onValueChange({ type: "multiple", values });
    }
  };

  return (
    <View className="p-4 gap-3">
      <Text className="font-Geist_Medium text-sm">{config?.label}</Text>

      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={
          config?.ui?.placeholder || `Enter ${config?.label.toLowerCase()}`
        }
        placeholderTextColor={NAV_THEME[colorScheme].muted}
        className="border border-border rounded-lg px-3 py-2 text-foreground bg-background"
        style={{ color: NAV_THEME[colorScheme].text }}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        multiline={filter.value.type === "multiple"}
        numberOfLines={filter.value.type === "multiple" ? 3 : 1}
      />

      {filter.value.type === "multiple" && (
        <Text className="text-xs text-muted-foreground">
          Separate multiple values with commas
        </Text>
      )}

      <Pressable
        onPress={handleSubmit}
        className="bg-primary rounded-lg py-2 px-4 items-center"
      >
        <Text className="text-primary-foreground font-Geist_Medium">Apply</Text>
      </Pressable>
    </View>
  );
};

// Select Input Component
const SelectInput: React.FC<DynamicInputProps> = ({
  filter,
  value,
  onValueChange,
}) => {
  const config = getFilterConfig(filter.key);
  const { colorScheme } = useColorScheme();

  if (!config?.options) return null;

  const handleSingleSelect = (selectedValue: string | number) => {
    onValueChange({ type: "single", value: selectedValue });
  };

  const handleMultipleSelect = (selectedValue: string | number) => {
    if (filter.filterType === "select" && filter.value.type === "multiple") {
      const currentValues = filter.value.values;
      const isSelected = currentValues.includes(selectedValue as any);

      const newValues = isSelected
        ? currentValues.filter((v) => v !== selectedValue)
        : [...currentValues, selectedValue];

      onValueChange({ type: "multiple", values: newValues });
    }
  };

  const isSelected = (optionValue: string | number): boolean => {
    if (filter.filterType === "select") {
      if (filter.value.type === "single") {
        return filter.value.value === optionValue;
      } else if (filter.value.type === "multiple") {
        return filter.value.values.includes(optionValue as any);
      }
    }
    return false;
  };

  const renderOption = (
    item: { label: string; value: string | number },
    index: number
  ) => {
    const selected = isSelected(item.value);

    return (
      <View key={item.value.toString()}>
        {index > 0 && <View className="h-2" />}
        <Pressable
          onPress={() =>
            filter.value.type === "single"
              ? handleSingleSelect(item.value)
              : handleMultipleSelect(item.value)
          }
          className={cn(
            "flex-row items-center justify-between p-3 rounded-lg border",
            selected
              ? "border-primary bg-primary/10"
              : "border-border bg-background"
          )}
        >
          <Text
            className={cn(
              "font-Geist_Medium",
              selected ? "text-primary" : "text-foreground"
            )}
          >
            {item.label}
          </Text>

          {selected && (
            <Check
              size={16}
              color={NAV_THEME[colorScheme].primary}
              strokeWidth={2}
            />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View className="p-4 gap-3">
      <Text className="font-Geist_Medium text-sm">
        {config.label}
        {filter.value.type === "multiple" && " (Multiple selection)"}
      </Text>

      <View>
        {config.options.map((item, index) => renderOption(item, index))}
      </View>

      {filter.value.type === "multiple" && (
        <View className="mt-2">
          <Text className="text-xs text-muted-foreground">
            Selected: {filter.value.values.length} item(s)
          </Text>
        </View>
      )}
    </View>
  );
};

// Number Input Component
const NumberInput: React.FC<DynamicInputProps> = ({
  filter,
  value,
  onValueChange,
}) => {
  const config = getFilterConfig(filter.key);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (filter.filterType === "number") {
      if (filter.value.type === "single") {
        setSliderValue(Number(filter.value.value) || 0);
      } else if (filter.value.type === "range") {
        // For range, use the minimum value as initial
        setSliderValue(Number(filter.value.min) || 0);
      }
    }
  }, [filter.value, filter.filterType]);

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);

    // Apply the value change immediately
    if (filter.value.type === "single") {
      onValueChange({ type: "single", value: newValue });
    } else if (filter.value.type === "range") {
      // Type guard to ensure we're dealing with a number range, not date range
      if (filter.filterType === "number") {
        const existingMax =
          "max" in filter.value ? filter.value.max : newValue + 100;
        onValueChange({
          type: "range",
          min: newValue,
          max: existingMax,
        });
      }
    }
  };

  const getSliderConfig = () => {
    // Get min/max from validation config or use sensible defaults
    const minValue = config?.validation?.min || 0;
    const maxValue = config?.validation?.max || 100;
    return { min: minValue, max: maxValue };
  };

  const { min, max } = getSliderConfig();

  return (
    <View className="p-4 gap-3">
      <Text className="font-Geist_Medium text-sm">{config?.label}</Text>

      <View className="gap-2">
        <Text className="text-muted-foreground text-sm">
          Value: {sliderValue}
          {config?.ui?.showCurrency && " SAR"}
        </Text>

        {/* <Slider
          steps={9}
          min={0}
          max={10}
          style={{ minHeight: 60 }}
          value={sliderValue}
          onValueChange={(value) => {
            handleSliderChange(value);
          }}
        /> */}

        <View className="flex-row justify-between">
          <Text className="text-xs text-muted-foreground">
            {min}
            {config?.ui?.showCurrency && " SAR"}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {max}
            {config?.ui?.showCurrency && " SAR"}
          </Text>
        </View>
      </View>
    </View>
  );
};
