import { mastra } from "@/mastra";

export async function DELETE() {
  try {
    const agreementAgent = mastra.getAgent("AgreementAgent");

    if (!agreementAgent) {
      throw new Error("Agent not found");
    }

    // route.tsと同じthread/resourceIDを使用してメモリをクリア
    const memory = agreementAgent.getMemory();
    await memory?.deleteThread("default");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Chat clear API error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
