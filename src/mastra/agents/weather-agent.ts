import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { 
  getSubsidiesListTool, 
  getSubsidyDetailTool, 
  searchSubsidiesTool 
} from '../tools/jgrants-tool';

export const AgreementAgent: Agent = new Agent({
  name: '補助金検索エージェント',
  instructions: `
  あなたは補助金検索エージェントです。ユーザーからの補助金に関する質問に答えます。
  補助金情報はJ-Grants APIから取得します。ユーザーのニーズに最も適した補助金を提案してください。
  ユーザーの事業内容、業種、利用目的、従業員数、所在地などを考慮して、最適な補助金を見つけ出してください。
  補助金情報が見つからない場合は、その旨を丁寧に伝えてください。
  可能な限り具体的な補助金名、概要、申請期限、リンクなどの情報を提供してください。
  ユーザーが追加情報を求めた場合は、適切に対応してください。
`,
  model: openai('GPT-5-nano'),
  tools: {
    getSubsidiesListTool,
    getSubsidyDetailTool,
    searchSubsidiesTool
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
