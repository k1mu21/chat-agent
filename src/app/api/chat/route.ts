import { mastra } from "@/mastra";
import { mem0Client } from "@/mastra/integrations";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const agreementAgent = mastra.getAgent("AgreementAgent");

    if (!agreementAgent) {
      throw new Error("Agent not found");
    }

    const userMessage = messages.at(-1);
    const userId = "default-user";

    // ユーザーメッセージをmem0に保存
    try {
      const memoryMessages = [
        {
          role: userMessage.role || "user",
          content: userMessage.content
        }
      ];
      
      await mem0Client.add(memoryMessages, {
        user_id: userId,
        agent_id: 'friendAgent',
        custom_instructions: `感情や認識は無視し、事実に注目して抽出して。特に
        ・ユーザーに直近起きたこと、現在の状態、これから先の予定
        ・ユーザーの嗜好、習慣
        ・ユーザーの過去の経験
        ・会話の中での特徴的な発言
        など、人間の長期記憶に残りそうなことをピックアップして記録して。`,
      });
      console.log("User message saved to mem0");
    } catch (error) {
      console.error("Failed to save user message to mem0:", error);
    }

    // エージェントからレスポンスを取得
    const stream = await agreementAgent.stream([userMessage], {
      memory: {
        thread: "default",
        resource: userId,
      },
    });

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
