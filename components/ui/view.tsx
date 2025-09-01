import * as Slot from "@rn-primitives/slot";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { View as RNView } from "react-native";
import { cn } from "~/lib/utils";

const ViewClassContext = React.createContext<string | undefined>(undefined);

function View({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNView> & {
  ref?: React.RefObject<RNView>;
  asChild?: boolean;
}) {
  const viewClass = React.useContext(ViewClassContext);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  // Only apply RTL reversal if the view has flex-row class
  const hasFlexRow =
    className?.includes("flex-row") || viewClass?.includes("flex-row");

  const Component = asChild ? Slot.View : RNView;

  return (
    <Component
      className={cn(viewClass, className, {
        "!flex-row-reverse": isRTL && hasFlexRow,
      })}
      {...props}
    />
  );
}

export { View, ViewClassContext };
