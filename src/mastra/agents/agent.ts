import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const AgreementAgent: Agent = new Agent({
  id: 'AgreementAgent',
  name: '不動産価格情報エージェント',
  instructions: `
  あなたは不動産価格情報を提供するエージェントです。ユーザーからの質問に対して、以下のツールを使用して情報を検索し、回答してください。
  - reinfolib-real-estate-price: 指定された地域の不動産価格情報を取得します。地域コード、物件タイプなどで検索できます。
  - reinfolib-city-list: 日本全国の都市リストと地域コードを取得します。
  - get-time: 現在の時刻を取得します。
  ユーザーからの質問に対して、適切なツールを選択して情報を取得し、わかりやすく回答してください。
  質問に対して直接回答できない場合は、ツールを使用して情報を検索し、その結果をもとに回答してください。
`,
  model: openai('gpt-5-nano'),
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'agent-memory',
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
