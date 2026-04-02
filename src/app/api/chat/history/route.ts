import { mastra } from "@/mastra";

export async function GET() {
  try {
    const agreementAgent = mastra.getAgent("AgreementAgent");

    if (!agreementAgent) {
      throw new Error("Agent not found");
    }

    // route.tsと同じthread/resourceIDを使用
    const memory = await agreementAgent.getMemory();
    if (!memory) {
      throw new Error("Memory not found");
    }

    // スレッドが存在するか確認してから取得
      const result = await memory.recall({
        threadId: "default",
        resourceId: "default-user",
      });

      // MastraDBMessage → UIMessage 形式に変換（parts をトップレベルに）
      const messages = (result?.messages || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: msg.content?.parts ?? [],
        createdAt: msg.createdAt,
      }));

      return Response.json({ messages });
  } catch (error) {
    console.error("Chat history API error:", error);
    return Response.json({ messages: [] });
  }
}
