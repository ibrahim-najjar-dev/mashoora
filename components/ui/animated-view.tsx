import * as React from "react";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { cn } from "~/lib/utils";
import { ViewClassContext } from "./view";

interface AnimatedViewProps extends React.ComponentProps<typeof Animated.View> {
  ref?: React.RefObject<Animated.View>;
}

function AnimatedView({ className, ...props }: AnimatedViewProps) {
  const viewClass = React.useContext(ViewClassContext);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  // Only apply RTL reversal if the view has flex-row class
  // Handle both string and SharedValue types for className
  const classNameStr = typeof className === "string" ? className : "";
  const hasFlexRow =
    classNameStr?.includes("flex-row") || viewClass?.includes("flex-row");

  return (
    <Animated.View
      className={cn(viewClass, className, {
        "flex-row-reverse": isRTL && hasFlexRow,
      })}
      {...props}
    />
  );
}

export { AnimatedView };
