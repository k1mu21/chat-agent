import { mastra } from "@/mastra";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const agreementAgent = mastra.getAgent("AgreementAgent");

    if (!agreementAgent) {
      throw new Error("Agent not found");
    }

    const stream = await agreementAgent.stream([messages.at(-1)], {
      memory: {
        thread: "default", // 任意のスレッドID
        resource: "default-user", // 任意のユーザーID
      },
    });

    return stream.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
