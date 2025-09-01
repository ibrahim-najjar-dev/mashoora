import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "~/lib/utils";

interface SelectableCardProps {
  /** Unique identifier for the card */
  id: string;
  /** Icon component to display on the left */
  icon: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Whether the card is currently selected */
  isSelected: boolean;
  /** Callback function when card is pressed */
  onPress: (id: string) => void;
  /** Border color when active/selected */
  activeBorderColor?: string;
  /** Border color when not selected */
  defaultBorderColor?: string;
  /** Background color when active/selected */
  activeBackgroundColor?: string;
  /** Additional className for styling */
  className?: string;
}

/**
 * A generic selectable card component with customizable colors and layout.
 * Features:
 * - Icon on the left
 * - Title and description in the middle
 * - Selection indicator on the right
 * - Customizable active/default colors
 * - Uses semantic color classes for foreground and background
 *
 * Example usage:
 * ```tsx
 * <SelectableCard
 *   id="option1"
 *   icon={<Icon size={24} />}
 *   title="Option 1"
 *   description="Description for option 1"
 *   isSelected={selectedId === "option1"}
 *   onPress={handleSelect}
 *   activeBorderColor="border-blue-500"
 *   activeBackgroundColor="bg-blue-50"
 * />
 * ```
 */
export function SelectableCard({
  id,
  icon,
  title,
  description,
  isSelected,
  onPress,
  activeBorderColor = "border-primary",
  defaultBorderColor = "border-border",
  activeBackgroundColor = "bg-secondary",
  className,
}: SelectableCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      className={cn(
        "rounded-xl border-2 bg-background p-4 transition-all duration-200",
        isSelected ? activeBorderColor : defaultBorderColor,
        isSelected && activeBackgroundColor,
        className
      )}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-x-4">
        {/* Icon on the left */}
        <View className="flex-shrink-0">{icon}</View>

        {/* Title and description in the middle */}
        <View className="flex-1">
          <Text className="text-lg font-Geist_SemiBold text-foreground mb-1">
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground">{description}</Text>
        </View>

        {/* Check indicator on the right */}
        <View className="flex-shrink-0">
          {isSelected ? (
            <View className="h-6 w-6 rounded-full bg-primary items-center justify-center">
              <Check size={16} color="white" />
            </View>
          ) : (
            <View className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
