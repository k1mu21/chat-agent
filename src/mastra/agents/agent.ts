import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { DynamoDBStore } from '@mastra/dynamodb';

export const AgreementAgent: Agent = new Agent({
  id: 'AgreementAgent',
  name: '宿泊場所情報エージェント',
  instructions: `
  宿泊場所を提供するエージェントです。ユーザーからの質問に対して、以下のツールを使用して情報を検索し、回答してください。
  - rakuten-travel-hotel-search: 楽天トラベルから宿泊施設情報を取得するリモートMCPサーバーです。目的地や条件を指定して、ユーザーの好みにあった宿泊施設を検索することができます。
  ユーザーからの質問に対して、適切なツールを選択して情報を取得し、わかりやすく回答してください。
  URLもあれば提供してください。
  質問に対して直接回答できない場合は、ツールを使用して情報を検索し、その結果をもとに回答してください。
`,
  model: openai('gpt-5-nano'),
  memory: new Memory({
    storage: new DynamoDBStore({
      name: 'agent-memory',
      config: {
        id: 'agent-memory',
        region: process.env.AWS_REGION ?? 'ap-northeast-1',
        tableName: process.env.DYNAMODB_TABLE_NAME ?? 'mastra-single-table',
      },
    }),
  }),
});
