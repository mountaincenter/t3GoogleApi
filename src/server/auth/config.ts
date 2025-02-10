import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/server/db";

const refreshAccessToken = async (token: any) => {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refreshToken, // ここで refreshToken を利用
        grant_type: "refresh_token",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 有効期限を更新
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // 可能なら refreshToken も更新
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
};

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/fitness.nutrition.read",
            "https://www.googleapis.com/auth/fitness.sleep.read",
            "https://www.googleapis.com/auth/fitness.blood_pressure.read",
            "https://www.googleapis.com/auth/fitness.body.read",
            "https://www.googleapis.com/auth/fitness.body.write",
            "https://www.googleapis.com/auth/userinfo.profile",
          ].join(" "),
        },
      },
    }),
  ],
  adapter: PrismaAdapter(db),

  callbacks: {
    async jwt({ token, user, account }) {
      // 初回サインイン時、トークンを設定
      if (account) {
        return {
          id: user?.id, // ユーザー ID
          name: user?.name, // ユーザー名
          email: user?.email, // メールアドレス
          picture: user?.image, // プロフィール画像
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at * 1000, // Unix time をミリ秒に変換
          refreshToken: account.refresh_token,
        };
      }

      // 期限が切れていない場合、そのまま返す
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // 期限が切れた場合、アクセストークンを更新
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string, // id を追加
        name: token.name as string, // name を追加
        email: token.email as string, // email を追加
        image: token.picture as string, // image (プロフィール画像) を追加
        accessToken: token.accessToken, // アクセストークン
        error: token.error || null, // エラー情報
      };
      return session;
    },
  },

  session: {
    strategy: "jwt", // JWT ストラテジーを使用
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
