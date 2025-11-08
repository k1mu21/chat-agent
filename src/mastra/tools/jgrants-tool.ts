import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const JGRANTS_API_BASE_URL = "https://api.jgrants-portal.go.jp/exp/v1/public";

// 補助金一覧のレスポンス型定義
interface SubsidyListItem {
  id: string;
  title: string;
  subsidy_max_limit?: number;
  acceptance_start_datetime?: string;
  acceptance_end_datetime?: string;
  target_area_search?: string;
  target_industry?: string;
  target_number_of_employees?: string;
  use_purpose?: string;
  detail?: string;
}

interface SubsidyListResponse {
  result: SubsidyListItem[];
  total_count: number;
  page: number;
  limit: number;
}

// 補助金詳細のレスポンス型定義
interface ApplicationDocument {
  name: string;
  data: string; // BASE64文字列
}

interface SubsidyDetail {
  id: string;
  title: string;
  detail?: string;
  subsidy_max_limit?: number;
  subsidy_rate?: string;
  acceptance_start_datetime?: string;
  acceptance_end_datetime?: string;
  target_area_search?: string;
  target_industry?: string;
  target_number_of_employees?: string;
  inquiry_url?: string;
  update_datetime?: string;
  application_guidelines?: ApplicationDocument[];
  outline_of_grant?: ApplicationDocument[];
  application_form?: ApplicationDocument[];
}

interface SubsidyDetailResponse {
  result: SubsidyDetail;
}

// 補助金一覧取得ツール
export const getSubsidiesListTool = createTool({
  id: "jgrants-get-subsidies",
  description: "J-Grantsから補助金一覧を取得します",
  inputSchema: z.object({
    keyword: z.string()
      .min(2, "検索キーワードは2文字以上で入力してください")
      .max(255, "検索キーワードは255文字以内で入力してください")
      .describe("検索キーワード（2-255文字）"),
    sort: z.enum(["created_date", "acceptance_start_datetime", "acceptance_end_datetime"])
      .describe("ソート基準（作成日、受付開始日時、受付終了日時）"),
    order: z.enum(["ASC", "DESC"])
      .describe("ソート順序（昇順、降順）"),
    acceptance: z.enum(["0", "1"])
      .describe("受付状況（0：全て、1：受付中のみ）"),
    use_purpose: z.string()
      .max(255, "利用目的は255文字以内で入力してください")
      .optional()
      .describe("利用目的（最大255文字）"),
    industry: z.string()
      .max(255, "業種は255文字以内で入力してください")
      .optional()
      .describe("業種（最大255文字）"),
    target_number_of_employees: z.string()
      .optional()
      .describe("従業員数制約"),
    target_area_search: z.string()
      .optional()
      .describe("補助対象地域")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    total_count: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    subsidies: z.array(z.object({
      id: z.string(),
      title: z.string(),
      subsidy_max_limit: z.number().optional(),
      acceptance_start_datetime: z.string().optional(),
      acceptance_end_datetime: z.string().optional(),
      target_area_search: z.string().optional(),
      target_industry: z.string().optional(),
      target_number_of_employees: z.string().optional(),
      use_purpose: z.string().optional(),
      detail: z.string().optional()
    })).optional(),
    error: z.string().optional(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    try {
      // デフォルト値を設定
      const keyword = context.keyword || "事業";
      const sort = context.sort || "created_date";
      const order = context.order || "DESC";
      const acceptance = context.acceptance || "1";
      
      // URLパラメータを構築
      const searchParams = new URLSearchParams();
      
      // 必須パラメータ
      searchParams.append("keyword", keyword);
      searchParams.append("sort", sort);
      searchParams.append("order", order);
      searchParams.append("acceptance", acceptance);
      
      // オプションパラメータ（値が存在する場合のみ追加）
      if (context.use_purpose) {
        searchParams.append("use_purpose", context.use_purpose);
      }
      if (context.industry) {
        searchParams.append("industry", context.industry);
      }
      if (context.target_number_of_employees) {
        searchParams.append("target_number_of_employees", context.target_number_of_employees);
      }
      if (context.target_area_search) {
        searchParams.append("target_area_search", context.target_area_search);
      }

      const url = `${JGRANTS_API_BASE_URL}/subsidies?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`J-Grants API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as SubsidyListResponse;
      return {
        success: true,
        total_count: data.total_count ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? 10,
        subsidies: data.result ?? [],
        message: `${data.total_count ?? 0}件中${(data.result ?? []).length}件の補助金情報を取得しました（ページ${data.page ?? 1}/${Math.ceil((data.total_count ?? 0) / (data.limit ?? 10))}）`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "補助金一覧の取得に失敗しました"
      };
    }
  }
});

// 補助金詳細取得ツール
export const getSubsidyDetailTool = createTool({
  id: "jgrants-get-subsidy-detail",
  description: "指定されたIDの補助金詳細情報を取得します",
  inputSchema: z.object({
    id: z.string().max(18).describe("補助金ID（18文字以下）")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    subsidy: z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string().optional(),
      subsidy_max_limit: z.number().optional(),
      subsidy_rate: z.string().optional(),
      acceptance_start_datetime: z.string().optional(),
      acceptance_end_datetime: z.string().optional(),
      target_area_search: z.string().optional(),
      target_industry: z.string().optional(),
      target_number_of_employees: z.string().optional(),
      inquiry_url: z.string().optional(),
      update_datetime: z.string().optional(),
      has_application_guidelines: z.boolean().optional(),
      has_outline_of_grant: z.boolean().optional(),
      has_application_form: z.boolean().optional()
    }).optional(),
    error: z.string().optional(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    try {
      const url = `${JGRANTS_API_BASE_URL}/subsidies/id/${context.id}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`J-Grants API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as SubsidyDetailResponse;
      const subsidy = data.result;
      
      return {
        success: true,
        subsidy: {
          id: subsidy.id,
          title: subsidy.title,
          detail: subsidy.detail,
          subsidy_max_limit: subsidy.subsidy_max_limit,
          subsidy_rate: subsidy.subsidy_rate,
          acceptance_start_datetime: subsidy.acceptance_start_datetime,
          acceptance_end_datetime: subsidy.acceptance_end_datetime,
          target_area_search: subsidy.target_area_search,
          target_industry: subsidy.target_industry,
          target_number_of_employees: subsidy.target_number_of_employees,
          inquiry_url: subsidy.inquiry_url,
          update_datetime: subsidy.update_datetime,
          has_application_guidelines: !!(subsidy.application_guidelines?.length),
          has_outline_of_grant: !!(subsidy.outline_of_grant?.length),
          has_application_form: !!(subsidy.application_form?.length)
        },
        message: `補助金「${subsidy.title}」の詳細情報を取得しました`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "補助金詳細の取得に失敗しました"
      };
    }
  }
});

// 補助金検索用のヘルパーツール（ユーザーフレンドリーなインターフェース）
export const searchSubsidiesTool = createTool({
  id: "jgrants-search-subsidies",
  description: "条件を指定して補助金を検索します（簡単インターフェース）",
  inputSchema: z.object({
    searchQuery: z.string().describe("検索したい内容やキーワード"),
    onlyActive: z.boolean().describe("受付中の補助金のみを検索するか"),
    industry: z.string().optional().describe("対象業種"),
    area: z.string().optional().describe("対象地域")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    total_count: z.number().optional(),
    subsidies: z.array(z.object({
      id: z.string(),
      title: z.string(),
      subsidy_max_limit: z.number().optional(),
      acceptance_start_datetime: z.string().optional(),
      acceptance_end_datetime: z.string().optional(),
      target_area_search: z.string().optional(),
      target_industry: z.string().optional(),
      target_number_of_employees: z.string().optional(),
      use_purpose: z.string().optional(),
      detail: z.string().optional()
    })).optional(),
    error: z.string().optional(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    // デフォルト値を設定
    const searchQuery = context.searchQuery || "事業";
    const onlyActive = context.onlyActive ?? true;
    
    // ヘルパーツールから基本の検索関数を呼び出し
    const searchParams = new URLSearchParams();
    
    searchParams.append("keyword", searchQuery);
    searchParams.append("sort", "acceptance_start_datetime");
    searchParams.append("order", "DESC");
    searchParams.append("acceptance", onlyActive ? "1" : "0");
    
    if (context.industry) {
      searchParams.append("industry", context.industry);
    }
    if (context.area) {
      searchParams.append("target_area_search", context.area);
    }

    try {
      const url = `${JGRANTS_API_BASE_URL}/subsidies?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`J-Grants API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json() as SubsidyListResponse;
      return {
        success: true,
        total_count: data.total_count ?? 0,
        subsidies: data.result ?? [],
        message: `「${searchQuery}」で${data.total_count ?? 0}件の補助金が見つかりました（表示: ${(data.result ?? []).length}件）`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "補助金検索に失敗しました"
      };
    }
  }
});