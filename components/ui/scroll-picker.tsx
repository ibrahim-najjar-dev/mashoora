import React, { useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5; // Odd number recommended for center alignment

type DigitPickerProps = {
  data?: number[];
  onValueChange?: (value: number) => void;
};

const ScrollPicker: React.FC<DigitPickerProps> = ({
  data = [...Array(10).keys()],
  onValueChange,
}) => {
  const flatListRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedIndex(index);
    onValueChange?.(data[index]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
        }}
        renderItem={({ item, index }) => (
          <View
            style={[styles.item, index === selectedIndex && styles.selected]}
          >
            <Text style={styles.text}>{item}</Text>
          </View>
        )}
      />
      {/* Ticker Line */}
      <View style={styles.tick} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: "relative",
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    // Optional styling for selected item
  },
  text: {
    fontSize: 24,
  },
  tick: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#000",
    marginTop: -1, // Half of height to center
  },
});

export default ScrollPicker;
