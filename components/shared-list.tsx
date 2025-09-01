import { ReactNode } from "react";
import { View } from "react-native";

interface SharedListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ({ item, index }: { item: T; index: number }) => ReactNode;
  ListHeaderComponent?: ReactNode;
  contentContainerClassName?: string;
  className?: string;
}

export function SharedList<T>({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  contentContainerClassName,
  className,
}: SharedListProps<T>) {
  return (
    <View className={className}>
      {ListHeaderComponent}
      <View className={contentContainerClassName}>
        {data.map((item, index) => (
          <View key={keyExtractor(item, index)}>
            {renderItem({ item, index })}
          </View>
        ))}
      </View>
    </View>
  );
}
