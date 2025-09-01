import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList as RNFlatList, FlatListProps } from "react-native";

interface CustomFlatListProps<T> extends FlatListProps<T> {
  ref?: React.RefObject<RNFlatList<T>>;
}

function FlatList<T>({
  horizontal = false,
  inverted,
  ...props
}: CustomFlatListProps<T>) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Auto-invert horizontal lists for RTL, or use explicit inverted prop
  const shouldInvert = inverted !== undefined ? inverted : horizontal && isRTL;

  return (
    <RNFlatList horizontal={horizontal} inverted={shouldInvert} {...props} />
  );
}

export { FlatList };
