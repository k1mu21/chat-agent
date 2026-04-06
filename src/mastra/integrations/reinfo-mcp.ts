import { MCPClient } from '@mastra/mcp';

export const reinfoMcp = new MCPClient({
  servers: {
    reinfo: {
      url: new URL('https://mcp.n-3.ai/mcp?tools=rakuten-travel-hotel-search'),
    },
  },
});
