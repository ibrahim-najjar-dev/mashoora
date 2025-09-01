import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Dimensions, TextInput } from "react-native";
import {
  SharedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ANIMATED_TABS, type TabName } from "~/types/tab-animation";

// raycast-home-search-transition-animation 🔽

export const SEARCHBAR_HEIGHT = 40;
export const EDIT_HOME_CONTAINER_WIDTH = 85;
export const SETTINGS_CONTAINER_WIDTH = 65;
export const CANCEL_CONTAINER_WIDTH = 75;
const LEFT_PADDING = 16;

export const SEARCHBAR_FAVORITES_WIDTH =
  Dimensions.get("window").width -
  EDIT_HOME_CONTAINER_WIDTH -
  SETTINGS_CONTAINER_WIDTH;
export const SEARCHBAR_COMMANDS_WIDTH =
  Dimensions.get("window").width - CANCEL_CONTAINER_WIDTH - LEFT_PADDING;

export const TRIGGER_DRAG_DISTANCE = -100;
export const FULL_DRAG_DISTANCE = -200;

type ScreenView = "favorites" | "commands";

type ContextValue = {
  inputRef: RefObject<TextInput | null>;
  screenView: SharedValue<ScreenView>;
  isListDragging: SharedValue<boolean>;
  offsetY: SharedValue<number>;
  blurIntensity: SharedValue<number>;
  currentTab: SharedValue<TabName>;
  isAnimationEnabled: SharedValue<boolean>;
  onGoToCommands: () => void;
  onGoToFavorites: () => void;
  setCurrentTab: (tab: TabName) => void;
  resetAnimationState: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const HomeAnimationContext = createContext<ContextValue>({} as ContextValue);

export const HomeAnimationProvider: FC<PropsWithChildren> = ({ children }) => {
  const inputRef = useRef<TextInput>(null);

  const screenView = useSharedValue<ScreenView>("favorites");
  const offsetY = useSharedValue(0);
  const isListDragging = useSharedValue(false);
  const blurIntensity = useSharedValue(0);
  const currentTab = useSharedValue<TabName>("index");
  const isAnimationEnabled = useSharedValue(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const onGoToCommands = useCallback(() => {
    if (!isAnimationEnabled.value) return;

    screenView.value = "commands";
    blurIntensity.value = withTiming(100);
    inputRef.current?.focus();
  }, [screenView, blurIntensity, isAnimationEnabled]);

  const onGoToFavorites = useCallback(() => {
    if (!isAnimationEnabled.value) return;

    screenView.value = "favorites";
    blurIntensity.value = withTiming(0);
    inputRef.current?.blur();
  }, [screenView, blurIntensity, isAnimationEnabled]);

  const setCurrentTab = useCallback(
    (tab: TabName) => {
      const previousTab = currentTab.value;

      currentTab.value = tab;
      isAnimationEnabled.value = ANIMATED_TABS[tab];

      // Always reset animation state when switching tabs to ensure clean state
      // This closes blur and command list when switching between any tabs
      if (previousTab !== tab) {
        screenView.value = "favorites";
        blurIntensity.value = withTiming(0, { duration: 200 });
        offsetY.value = 0;
        isListDragging.value = false;
        inputRef.current?.blur();
      }
    },
    [
      currentTab,
      isAnimationEnabled,
      screenView,
      blurIntensity,
      offsetY,
      isListDragging,
    ]
  );

  const resetAnimationState = useCallback(() => {
    screenView.value = "favorites";
    blurIntensity.value = withTiming(0);
    offsetY.value = 0;
    isListDragging.value = false;
    inputRef.current?.blur();
  }, [screenView, blurIntensity, offsetY, isListDragging]);

  const value = {
    inputRef,
    screenView,
    isListDragging,
    offsetY,
    blurIntensity,
    searchQuery,
    setSearchQuery,
    currentTab,
    isAnimationEnabled,
    onGoToCommands,
    onGoToFavorites,
    setCurrentTab,
    resetAnimationState,
  };
  return (
    <HomeAnimationContext.Provider value={value}>
      {children}
    </HomeAnimationContext.Provider>
  );
};

export const useHomeAnimation = () => {
  const context = useContext(HomeAnimationContext);

  if (!context) {
    throw new Error(
      "useHomeAnimation must be used within an HomeAnimationProvider"
    );
  }

  return context;
};

// raycast-home-search-transition-animation 🔼
