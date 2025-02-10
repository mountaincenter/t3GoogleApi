import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const userHandler = {
  // ユーザーIDでユーザー情報を取得
  getUserById: async (userId: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          accounts: {
            select: {
              provider: true,
              refresh_token: true,
              access_token: true, // 追加: access_token を取得
            },
          },
        },
      });

      if (!user) return null;

      // Google の access_token を取得
      const accessToken =
        user.accounts.find((account) => account.provider === "google")
          ?.access_token ?? null;

      return {
        ...user,
        accessToken, // 追加: accessToken をレスポンスに含める
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Could not fetch user");
    }
  },

  // refresh_tokenを取得
  getRefreshTokenFromPrisma: async (userId: string) => {
    try {
      const account = await prisma.account.findFirst({
        where: { userId },
        select: { refresh_token: true },
      });

      return account?.refresh_token ?? null;
    } catch (error) {
      console.error("Error fetching refresh token from Prisma:", error);
      throw new Error("Could not fetch refresh token");
    }
  },

  // refresh_tokenを更新
  updateRefreshToken: async (
    userId: string,
    provider: string,
    refreshToken: string,
  ) => {
    try {
      return await prisma.account.updateMany({
        where: {
          userId,
          provider, // 特定のプロバイダー(Googleなど)のリフレッシュトークンを更新
        },
        data: {
          refresh_token: refreshToken,
        },
      });
    } catch (error) {
      console.error("Error updating refresh token:", error);
      throw new Error("Could not update refresh token");
    }
  },
};
