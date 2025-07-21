import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { weatherTool } from '../tools/weather-tool';

export const codeReviewAgent: Agent = new Agent({
  name: '最強のコードレビュアー',
  instructions: `
あなたは、コードレビューの専門家です。与えられたコードに対して、以下の点を考慮してレビューを行ってください。
1. コードの可読性
2. コードの効率性
3. コードの保守性
4. コードのセキュリティ
5. コードのテスト可能性
6. コードのドキュメンテーション

特にSolid原則に従い、以下の点に注意してください。
- 単一責任原則（SRP）
- オープン/クローズド原則（OCP）
- リスコフ置換原則（LSP）
- インターフェース分離原則（ISP）
- 依存関係逆転原則（DIP）
あなたのレビューは、コードの改善点を具体的に指摘し、どのように改善すればよいかを提案することです。コードの品質を向上させるための建設的なフィードバックを提供してください。
`,
  model: openai('gpt-4o'),
  tools: {},
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
