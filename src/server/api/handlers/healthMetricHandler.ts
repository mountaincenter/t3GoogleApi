import { PrismaClient } from "@prisma/client";
import type { HealthMetric } from "@prisma/client";

const prisma = new PrismaClient();

export const healthMetricHandler = {
  // ヘルスデータの upsert
  upsertHealthMetric: async (userId: string, healthMetric: HealthMetric) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // 既存データの取得
        const existingMetric = await tx.healthMetric.findUnique({
          where: {
            userId_date: {
              userId,
              date: healthMetric.date,
            },
          },
        });

        // 更新条件をチェック
        let shouldUpdate = false;
        const updateData: Partial<HealthMetric> = {
          lastFetchedAt: new Date(),
        };

        // Weight: 既存データより新しい場合は更新しない
        if (
          healthMetric.weight !== undefined &&
          (!existingMetric?.weightStartTimeNanos ||
            healthMetric.weightStartTimeNanos! <
              existingMetric.weightStartTimeNanos)
        ) {
          updateData.weight = healthMetric.weight;
          updateData.weightStartTimeNanos = healthMetric.weightStartTimeNanos;
          shouldUpdate = true;
        }

        // Blood Pressure: 既存データより新しい場合は更新しない
        if (
          healthMetric.systolic !== undefined &&
          healthMetric.diastolic !== undefined &&
          (!existingMetric?.bloodPressureStartTimeNanos ||
            healthMetric.bloodPressureStartTimeNanos! <
              existingMetric.bloodPressureStartTimeNanos)
        ) {
          updateData.systolic = healthMetric.systolic;
          updateData.diastolic = healthMetric.diastolic;
          updateData.bloodPressureStartTimeNanos =
            healthMetric.bloodPressureStartTimeNanos;
          shouldUpdate = true;
        }

        // Nutrition: calories の値が異なる場合のみ更新
        if (
          healthMetric.calories !== undefined &&
          (!existingMetric?.nutritionStartTimeNanos ||
            healthMetric.nutritionStartTimeNanos! <
              existingMetric.nutritionStartTimeNanos ||
            healthMetric.calories !== existingMetric.calories)
        ) {
          updateData.calories = healthMetric.calories;
          updateData.sodium = healthMetric.sodium;
          updateData.protein = healthMetric.protein;
          updateData.fat = healthMetric.fat;
          updateData.nutritionStartTimeNanos =
            healthMetric.nutritionStartTimeNanos;
          shouldUpdate = true;
        }

        // 更新が必要な場合のみ upsert 実行
        if (shouldUpdate) {
          return tx.healthMetric.upsert({
            where: {
              userId_date: {
                userId,
                date: healthMetric.date,
              },
            },
            update: updateData,
            create: {
              userId,
              date: healthMetric.date,
              weight: healthMetric.weight,
              weightStartTimeNanos: healthMetric.weightStartTimeNanos,
              systolic: healthMetric.systolic,
              diastolic: healthMetric.diastolic,
              bloodPressureStartTimeNanos:
                healthMetric.bloodPressureStartTimeNanos,
              calories: healthMetric.calories,
              sodium: healthMetric.sodium,
              protein: healthMetric.protein,
              fat: healthMetric.fat,
              nutritionStartTimeNanos: healthMetric.nutritionStartTimeNanos,
              lastFetchedAt: new Date(),
            },
          });
        }

        // 変更なしの場合
        return existingMetric;
      });
    } catch (error) {
      console.error("Error upserting health metric:", error);
      throw new Error("Failed to upsert health metric");
    }
  },

  // ヘルスデータの取得
  getHealthMetrics: async (userId: string) => {
    try {
      return await prisma.healthMetric.findMany({
        where: { userId },
        orderBy: { date: "asc" },
      });
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      throw new Error("Failed to fetch health metrics");
    }
  },

  // ヘルスデータの削除
  deleteHealthMetric: async (userId: string, date: Date) => {
    try {
      return await prisma.healthMetric.deleteMany({
        where: {
          userId,
          date,
        },
      });
    } catch (error) {
      console.error("Error deleting health metric:", error);
      throw new Error("Failed to delete health metric");
    }
  },
};
