import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { healthMetricHandler } from "@/server/api/handlers/healthMetricHandler";

export const healthMetricRouter = createTRPCRouter({
  // ヘルスデータの取得（現在のユーザーのみ）
  getHealthMetrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    if (!userId) throw new Error("Unauthorized");

    return await healthMetricHandler.getHealthMetrics(userId);
  }),

  // ヘルスデータの追加または更新（現在のユーザーのみ）
  upsertHealthMetric: protectedProcedure
    .input(
      z.object({
        healthMetric: z.object({
          date: z.date(),
          weight: z.number().nullable().optional(),
          weightStartTimeNanos: z.bigint().nullable().optional(),
          systolic: z.number().nullable().optional(),
          diastolic: z.number().nullable().optional(),
          bloodPressureStartTimeNanos: z.bigint().nullable().optional(),
          calories: z.number().nullable().optional(),
          sodium: z.number().nullable().optional(),
          protein: z.number().nullable().optional(),
          fat: z.number().nullable().optional(),
          nutritionStartTimeNanos: z.bigint().nullable().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) throw new Error("Unauthorized");

      return await healthMetricHandler.upsertHealthMetric(userId, {
        id: "", // Prismaの@default(cuid()) により生成されるので空文字でOK
        userId: userId,
        lastFetchedAt: new Date(),
        date: input.healthMetric.date,
        weight: input.healthMetric.weight ?? null,
        weightStartTimeNanos: input.healthMetric.weightStartTimeNanos ?? null,
        systolic: input.healthMetric.systolic ?? null,
        diastolic: input.healthMetric.diastolic ?? null,
        bloodPressureStartTimeNanos:
          input.healthMetric.bloodPressureStartTimeNanos ?? null,
        calories: input.healthMetric.calories ?? null,
        sodium: input.healthMetric.sodium ?? null,
        protein: input.healthMetric.protein ?? null,
        fat: input.healthMetric.fat ?? null,
        nutritionStartTimeNanos:
          input.healthMetric.nutritionStartTimeNanos ?? null,
      });
    }),

  // ヘルスデータの削除（現在のユーザーのみ）
  deleteHealthMetric: protectedProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) throw new Error("Unauthorized");

      return await healthMetricHandler.deleteHealthMetric(userId, input.date);
    }),
});
