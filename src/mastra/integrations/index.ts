import { MemoryClient } from "mem0ai";
import { reinfoMcp } from "./reinfo-mcp";

if (!process.env.MEM0_API_KEY) {
  throw new Error("MEM0_API_KEY environment variable is required");
}

export const mem0Client = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY,
});

export { reinfoMcp };