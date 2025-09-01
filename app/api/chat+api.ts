import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, ToolSet } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { instructions } from "~/lib/ai/instructions";

const openrouter = createOpenRouter({
  apiKey:
    "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",
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log("API ROUTER");

  const result = streamText({
    model: openrouter.chat("deepseek/deepseek-chat-v3-0324:free"),
    system: instructions,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
