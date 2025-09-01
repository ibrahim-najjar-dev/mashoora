import * as Slot from "@rn-primitives/slot";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Text as RNText } from "react-native";
import { cn } from "~/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
}) {
  const textClass = React.useContext(TextClassContext);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Function to swap Geist fonts with Cairo fonts
  const swapFonts = (classes: string) => {
    if (!isRTL) return classes;

    return classes
      .split(" ")
      .map((cls) => {
        // Only swap Geist fonts, keep Mono fonts unchanged
        if (cls.includes("font-Geist_")) {
          return cls.replace("font-Geist_", "font-Cairo_");
        }
        return cls;
      })
      .join(" ");
  };

  const finalClassName = cn(
    "text-base text-foreground web:select-text",
    {
      "text-right": isRTL,
    },
    swapFonts(textClass || ""),
    swapFonts(className || "")
  );

  console.log("finalClassName:", finalClassName);

  const Component = asChild ? Slot.Text : RNText;

  return <Component className={finalClassName} {...props} />;
}

export { Text, TextClassContext };
