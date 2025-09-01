import React from "react";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import Svg from "react-native-svg";
import { PaginationDots } from "./paginated-dots";
import { RenderItem } from "./render-item";

export type CarouselItem = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

interface CardsCarouselProps {
  data: CarouselItem[];
}

const CardsCarousel: React.FC<CardsCarouselProps> = ({ data }) => {
  const { width } = useWindowDimensions();
  const { i18n } = useTranslation();
  const scrollOffset = useSharedValue(0);
  // const tabBarHeight = useBottomTabBarHeight();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.x;
  });
  return (
    <>
      <Animated.FlatList
        data={data}
        renderItem={({ item, index }) => (
          <RenderItem item={item} index={index} scrollOffset={scrollOffset} />
        )}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />
      <PaginationDots data={data} scrollOffset={scrollOffset} />
    </>
  );
};

export default CardsCarousel;
