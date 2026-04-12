import { MemoryClient } from "mem0ai";
export { reinfoMcp } from "./reinfo-mcp";

export const mem0Client = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY ?? "",
});