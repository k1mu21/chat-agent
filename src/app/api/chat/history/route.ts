import { mastra } from "@/mastra";

export async function GET() {
  try {
    const agreementAgent = mastra.getAgent("AgreementAgent");

    if (!agreementAgent) {
      throw new Error("Agent not found");
    }

    // route.tsと同じthread/resourceIDを使用
    const memory = agreementAgent.getMemory();
    const result = await memory?.query({
      threadId: "default",
      resourceId: "default-user",
    });

    // UIMessagesを使用してチャット履歴を取得
    const messages = result?.uiMessages || [];

    return Response.json({ messages });
  } catch (error) {
    console.error("Chat history API error:", error);
    return Response.json({ messages: [] });
  }
}
