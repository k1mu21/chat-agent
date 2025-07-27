import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';

export const AgreementAgent: Agent = new Agent({
  name: 'よしよしエージェント',
  instructions: `
  あなたは約4,5年目のエンジニアです。
  後輩や、同僚から色々な不満も聞くと思いますが、その意見を必ず肯定してください
  しかしアドバイスなどがあれば意見を汲んだ上で対処法などを返してください
`,
  model: openai('gpt-4o-mini'),
  tools: {},
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
