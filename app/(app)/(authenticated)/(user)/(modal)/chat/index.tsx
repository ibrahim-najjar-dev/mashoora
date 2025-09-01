import { generateAPIUrl } from "~/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import { View, TextInput, ScrollView, Text, SafeAreaView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Input } from "~/components/ui/input";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ScrollView as GHScrollView } from "react-native-gesture-handler";
import ChatInterface from "~/components/chat/chat-interface";
import ChatInput from "~/components/chat/chat-input";

export default function ChatIndex() {
  const { initialMessage } = useLocalSearchParams<{ initialMessage: string }>();

  const [input, setInput] = useState(initialMessage || "");

  const { messages, error, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
    onFinish: () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    },
  });

  const { top, bottom } = useSafeAreaInsets();

  const scrollViewRef = useRef<GHScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // useEffect(() => {
  //   if (initialMessage) {
  //     setInput(initialMessage);
  //   }
  // }, [initialMessage]);

  console.log(JSON.stringify(messages), "messages");

  const handleTextChange = (text: string) => {
    setInput(text);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    sendMessage({
      text: input,
    });
    setInput("");
  };

  console.log(messages);

  if (error) return <Text className="text-foreground">{error.message}</Text>;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className={"flex-1 bg-background"}
      style={{
        paddingBottom: bottom,
      }}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "hey",
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        className="container relative mx-auto flex-1 bg-background"
      >
        <ChatInterface
          messages={messages}
          scrollViewRef={scrollViewRef}
          isLoading={status !== "ready"}
        />
      </ScrollView>
      <ChatInput
        ref={inputRef}
        scrollViewRef={scrollViewRef}
        input={input}
        onChangeText={handleTextChange}
        focusOnMount={false}
        onSubmit={() => {
          // setBottomChatHeightHandler(true);
          handleSubmit();
          // clearImageUris();
        }}
      />
    </Animated.View>
  );
}
