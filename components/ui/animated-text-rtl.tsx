import * as React from "react";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { cn } from "~/lib/utils";

interface AnimatedTextProps extends React.ComponentProps<typeof Animated.Text> {
  ref?: React.RefObject<Animated.Text>;
}

function AnimatedTextRTL({ className, style, ...props }: AnimatedTextProps) {
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  return (
    <Animated.Text
      className={cn(className)}
      style={[
        style,
        {
          // Apply RTL text alignment
          textAlign: isRTL ? "right" : "left",
          writingDirection: isRTL ? "rtl" : "ltr",
        },
      ]}
      {...props}
    />
  );
}

export { AnimatedTextRTL };
