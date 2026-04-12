import { MemoryClient } from "mem0ai";
export { reinfoMcp } from "./reinfo-mcp";

let _mem0Client: MemoryClient | null = null;

export function getMem0Client(): MemoryClient {
  if (!_mem0Client) {
    _mem0Client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! });
  }
  return _mem0Client;
}