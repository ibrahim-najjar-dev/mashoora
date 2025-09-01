import * as Slot from "@rn-primitives/slot";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable as RNPressable } from "react-native";
import { cn } from "~/lib/utils";

const PressableClassContext = React.createContext<string | undefined>(
  undefined
);

function Pressable({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNPressable> & {
  ref?: React.RefObject<React.ComponentRef<typeof RNPressable>>;
  asChild?: boolean;
}) {
  const pressableClass = React.useContext(PressableClassContext);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  // Only apply RTL reversal if the pressable has flex-row class
  const hasFlexRow =
    className?.includes("flex-row") || pressableClass?.includes("flex-row");

  const Component = asChild ? Slot.Pressable : RNPressable;

  return (
    <Component
      className={cn(pressableClass, className, {
        "!flex-row-reverse": isRTL && hasFlexRow,
      })}
      {...props}
    />
  );
}

export { Pressable, PressableClassContext };
