import React, { forwardRef } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
// import { useKeyboardContext } from "react-native-keyboard-controller";
import { useKeyboard } from "@react-native-community/hooks";
import { cn } from "~/lib/utils";
import { CustomMarkdown } from "../ui/markdown";
import WeatherCard from "./weather";
import { UIMessage } from "ai";
import Icons from "../ui/icons";
import { Button } from "../ui/button";

type ChatInterfaceProps = {
  messages: UIMessage[];
  scrollViewRef: React.RefObject<ScrollView>;
  isLoading?: boolean;
};

export const ChatInterface = forwardRef<ScrollView, ChatInterfaceProps>(
  ({ messages, scrollViewRef, isLoading }, ref) => {
    // const { keyboardShown, keyboardHeight } = useKeyboard();

    return (
      <View className="flex-1">
        <ScrollView ref={scrollViewRef} className="flex-1 gap-y-4 p-4">
          {!messages.length && (
            <View>
              <Text>Welcome to the chat! How can I assist you today?</Text>
            </View>
          )}
          {messages?.length > 0
            ? messages.map((m, index) => (
                <React.Fragment key={m.id}>
                  <View
                    className={`flex-row px-4 ${m.role === "user" ? "ml-auto max-w-[85%]" : "max-w-[95%] pl-0"} rounded-3xl ${m.role === "user" ? "bg-muted/50" : ""} `}
                  >
                    <View
                      className={
                        m.role === "user"
                          ? ""
                          : "mr-2 mt-1 h-7 w-7 items-center justify-center rounded-lg bg-rose-500"
                      }
                    >
                      {m.role === "user" ? (
                        ""
                      ) : (
                        <Icons.MageRobotHappyFill
                          width={18}
                          height={18}
                          color={"#fff"}
                        />
                      )}
                    </View>
                    {m.parts.length > 0 &&
                      m.parts.map((part, index) => (
                        <React.Fragment key={`${m.id}-part-${index}`}>
                          <CustomMarkdown content={part.text as string} />
                        </React.Fragment>
                      ))}
                  </View>
                  {/* actions */}
                  <View
                    className={`flex-row ${m.role === "user" ? "ml-auto " : "pl-0"}`}
                  >
                    <Button size={"icon"} variant="ghost" className="h-7 w-7">
                      <Icons.SolarCopyLineDuotone
                        width={16}
                        height={16}
                        color={"#fff"}
                      />
                    </Button>
                  </View>
                  {isLoading &&
                    messages[messages.length - 1].role === "user" &&
                    m === messages[messages.length - 1] && (
                      <View className="flex-row">
                        <View
                          className={
                            "mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200"
                          }
                        >
                          <Text className="text-base">{"🤖"}</Text>
                        </View>
                        <View className="-ml-2 -mt-[1px]">
                          {/* <LottieLoader width={40} height={40} /> */}
                        </View>
                      </View>
                    )}
                </React.Fragment>
              ))
            : null}
        </ScrollView>
      </View>
    );
  }
);

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;
