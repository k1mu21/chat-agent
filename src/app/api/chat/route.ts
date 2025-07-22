import { mastra } from "@/mastra";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest } from "next/server";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const codeReviewAgent = mastra.getAgent("codeReviewAgent");
  const stream = await codeReviewAgent.stream([messages.at(-1)], {
    memory: {
      thread: "default", // 任意のスレッドID
      resource: "default-user", // 任意のユーザーID
    },
  });
  return stream.toDataStreamResponse();
}
