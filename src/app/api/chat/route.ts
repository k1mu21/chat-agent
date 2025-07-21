import { mastra } from "@/mastra";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, threadId } = await req.json();

    // 固定のthreadIdを使用（リロードしても同じスレッドを維持）
    const fixedThreadId = threadId || "default-chat-thread";

    // Mastraエージェントを取得
    const agent = mastra.getAgent("codeReviewAgent");

    if (!agent) {
      throw new Error("Agent not found");
    }

    // 最新のメッセージを取得
    const lastMessage = messages[messages.length - 1];

    // エージェントでストリーミングレスポンスを生成
    const result = streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: agent.instructions,
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
