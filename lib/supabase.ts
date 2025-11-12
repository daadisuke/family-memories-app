import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * クライアントサイド用Supabaseクライアント
 * ブラウザで使用するクライアント（Row Level Security適用）
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * サーバーサイド用Supabase Admin クライアント
 * サーバーコンポーネントやAPI Routeで使用（RLS バイパス）
 *
 * ⚠️ 注意: このクライアントはRLSをバイパスするため、
 * 適切な認証チェックと共に使用してください
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Server Component用のSupabaseクライアント
 * RLSポリシーを適用するため、ユーザー認証情報が必要
 *
 * Note: App Routerでは、Server ComponentでのSupabase認証は
 * NextAuthと組み合わせる場合、セッション情報からuser_idを取得して
 * RLSポリシーに渡す必要があります
 */
export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
