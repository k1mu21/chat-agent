import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { reinfoMcp } from '../integrations';

// 不動産価格情報ツール
export const reinfolibRealEstatePriceTool = createTool({
  id: 'reinfolib-real-estate-price',
  description: '指定された地域の不動産価格情報を取得します。地域コード、物件タイプなどで検索できます。',
  inputSchema: z.object({
    areaCode: z.string().describe('地域コード'),
    propertyType: z.string().optional().describe('物件タイプ（マンション、一戸建てなど）'),
  }),
  execute: async (params) => {
    const result = await reinfoMcp.callTool('reinfolib-real-estate-price', params);
    return result;
  },
});

// 都市リストツール
export const reinfolibCityListTool = createTool({
  id: 'reinfolib-city-list',
  description: '日本全国の都市リストと地域コードを取得します。',
  inputSchema: z.object({
    prefecture: z.string().optional().describe('都道府県名'),
  }),
  execute: async (params) => {
    const result = await reinfoMcp.callTool('reinfolib-city-list', params);
    return result;
  },
});

// 時間取得ツール
export const getTimeTool = createTool({
  id: 'get-time',
  description: '現在の時刻を取得します。',
  inputSchema: z.object({
    timezone: z.string().optional().describe('タイムゾーン（例：Asia/Tokyo）'),
  }),
  execute: async (params) => {
    const result = await reinfoMcp.callTool('get-time', params);
    return result;
  },
});
