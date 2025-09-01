// Tab Animation Configuration Types
export type AnimatedTabName = "index" | "explore";
export type TabName = "index" | "explore" | "bookings" | "chat";

export const ANIMATED_TABS: Record<TabName, boolean> = {
  index: true, // Home tab uses animations
  explore: true, // Explore tab can use animations
  bookings: false, // Bookings stays simple
  chat: false, // Chat doesn't need animations
} as const;

export type TabAnimationConfig = {
  hasAnimatedHeader: boolean;
  hasSearchFunctionality: boolean;
  hasBlurEffect: boolean;
  hasCommandsList: boolean;
  hasFilter: boolean;
};

export const TAB_ANIMATION_CONFIGS: Record<
  AnimatedTabName,
  TabAnimationConfig
> = {
  index: {
    hasAnimatedHeader: true,
    hasSearchFunctionality: true,
    hasBlurEffect: true,
    hasCommandsList: true,
    hasFilter: false,
  },
  explore: {
    hasAnimatedHeader: true,
    hasSearchFunctionality: true,
    hasBlurEffect: true,
    hasCommandsList: true, // Explore might not need commands list
    hasFilter: true,
  },
} as const;
