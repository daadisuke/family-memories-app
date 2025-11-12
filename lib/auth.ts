import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client（サーバーサイドのみ使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // ユーザーがSupabaseに存在するか確認
        const { data: existingUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id, email, family_id, role')
          .eq('email', user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = not found以外のエラー
          console.error('Error fetching user:', fetchError);
          return false;
        }

        if (!existingUser) {
          // 新規ユーザー作成
          const { data: newUser, error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              email_verified: new Date().toISOString(),
              role: 'member',
              // family_id は後で家族グループ作成時に設定
            })
            .select('id, email, family_id, role')
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            return false;
          }

          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }

        // アカウント情報をaccountsテーブルに保存
        if (account) {
          const { error: accountError } = await supabaseAdmin
            .from('accounts')
            .upsert({
              user_id: user.id,
              type: account.type,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            });

          if (accountError) {
            console.error('Error saving account:', accountError);
          }
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      // 初回サインイン時
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // ユーザー情報をSupabaseから取得してfamily_idを追加
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('family_id, role')
          .eq('id', user.id)
          .single();

        if (userData) {
          token.familyId = userData.family_id;
          token.role = userData.role;
        }
      }

      // セッション更新時（例: family作成後）
      if (trigger === 'update' && session) {
        if (session.familyId) {
          token.familyId = session.familyId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.familyId = token.familyId as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
