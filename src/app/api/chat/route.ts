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
    const agentId = "friendAgent";
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

    // ユーザーメッセージをmem0に保存
    try {
      const memoryMessages = [
        {
          role: userMessage.role || "user",
          content: userMessage.content,
        },
      ];

      // 長期記憶として保存
      await mem0Client.add(memoryMessages, {
        user_id: userId,
        agent_id: agentId,
        metadata: {
          type: "long_term",
          date: today,
        },
        custom_instructions: `感情や認識は無視し、事実に注目して抽出して。特に
        ・ユーザーに直近起きたこと、現在の状態、これから先の予定
        ・ユーザーの嗜好、習慣
        ・ユーザーの過去の経験
        ・会話の中での特徴的な発言
        など、人間の長期記憶に残りそうなことをピックアップして記録して。`,
      });

      // 短期記憶（今日の会話）として保存
      await mem0Client.add(memoryMessages, {
        user_id: userId,
        agent_id: agentId,
        metadata: {
          type: "short_term",
          date: today,
        },
        custom_instructions: `今日の会話内容を記録して。`,
      });

      console.log("User message saved to mem0 (long-term and short-term)");
    } catch (error) {
      console.error("Failed to save user message to mem0:", error);
    }

    // 長期記憶から関連する記憶を検索
    const longTermResult = await mem0Client.search(userMessage.content, {
      user_id: userId,
      filters: { user_id: userId, agent_id: agentId },
      top_k: 30,
      threshold: 0.4,
      keyword_search: true,
      rerank: true,
    });

    // 短期記憶（今日の会話）を取得
    const shortTermResult = await mem0Client.getAll({
      user_id: userId,
      filters: {
        type: "short_term",
        date: today,
      },
      page: 1,
      page_size: 500,
    });
    console.log(longTermResult);
    console.log(shortTermResult);

    // 長期記憶を文字列に変換
    const longTermMemoryStr = (longTermResult || [])
      .map((memory) => memory.memory)
      .filter((memory): memory is string => memory !== undefined)
      .join("\n");

    // 短期記憶を文字列に変換
    // Handle paginated response format from getAll()
    const shortTermMemories = Array.isArray(shortTermResult)
      ? shortTermResult
      : (shortTermResult as any)?.results || [];

    const shortTermMemoryStr = shortTermMemories
      .map((memory: any) => memory.memory)
      .filter((memory: string) => memory !== undefined)
      .join("\n");

    // エージェントからレスポンスを取得
    const stream = await agreementAgent.stream([userMessage], {
      memory: {
        thread: "default",
        resource: userId,
      },
      context: [
        { role: "system", content: longTermMemoryStr },
        { role: "system", content: shortTermMemoryStr },
      ],
    });

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
