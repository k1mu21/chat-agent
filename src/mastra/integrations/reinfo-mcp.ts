import { MCPClient } from '@mastra/mcp';

export const reinfoMcp = new MCPClient({
  servers: {
    reinfo: {
      url: new URL('https://mcp.n-3.ai/mcp?tools=get-time,reinfolib-real-estate-price,reinfolib-city-list'),
    },
  },
});
