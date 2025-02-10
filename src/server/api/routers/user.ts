import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userHandler } from "@/server/api/handlers/userHandler";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  // 現在のユーザー情報を取得するクエリ
  getUserById: protectedProcedure.query(async ({ ctx }) => {
    const user = await userHandler.getUserById(ctx.session.user?.id ?? "");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  // refresh_tokenを更新
  updateRefreshToken: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { provider, refreshToken } = input;
      const userId = ctx.session.user?.id ?? "";

      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const updatedAccount = await userHandler.updateRefreshToken(
        userId,
        provider,
        refreshToken,
      );

      if (!updatedAccount) {
        throw new Error("Failed to update refresh token");
      }

      return { success: true, message: "Refresh token updated successfully" };
    }),
});
