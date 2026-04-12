
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { DynamoDBStore } from '@mastra/dynamodb';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { AgreementAgent } from './agents/agent';

export const mastra = new Mastra({
  agents: { AgreementAgent },
  deployer: new CloudflareDeployer({
    name: 'chat-agent',
    vars: {
      NODE_ENV: 'production',
    },
  }),
  storage: new DynamoDBStore({
    name: 'mastra-storage',
    config: {
      id: 'mastra-storage',
      region: process.env.AWS_REGION ?? 'ap-northeast-1',
      tableName: process.env.DYNAMODB_TABLE_NAME ?? 'mastra-single-table',
    },
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
