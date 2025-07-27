import { MemoryClient } from "mem0ai";

if (!process.env.MEM0_API_KEY) {
  throw new Error("MEM0_API_KEY environment variable is required");
}

export const mem0Client = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY,
});