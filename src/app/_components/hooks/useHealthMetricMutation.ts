"use client";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import type { HealthMetric } from "@prisma/client";

/**
 * クエリキーの統一
 */
const HEALTH_METRICS_QUERY_KEY = ["healthMetric.getHealthMetrics"];

/**
 * 現在のユーザーのヘルスデータを取得
 */
export const useHealthMetrics = () => {
  return api.healthMetric.getHealthMetrics.useQuery(undefined, {
    enabled: true, // 自動で取得
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ保持
  });
};

/**
 * ヘルスデータの追加・更新
 */
export const useUpsertHealthMetric = () => {
  const queryClient = useQueryClient();

  return api.healthMetric.upsertHealthMetric.useMutation({
    onMutate: async (newMetric) => {
      await queryClient.cancelQueries({ queryKey: HEALTH_METRICS_QUERY_KEY });

      // 現在のキャッシュデータを取得し型を指定
      const previousData = queryClient.getQueryData<HealthMetric[]>(
        HEALTH_METRICS_QUERY_KEY,
      );

      queryClient.setQueryData(
        HEALTH_METRICS_QUERY_KEY,
        (oldData?: HealthMetric[]) => {
          if (!oldData) return [newMetric.healthMetric];

          return oldData.map((metric) =>
            metric.date?.toISOString() ===
            newMetric.healthMetric.date?.toISOString()
              ? { ...metric, ...newMetric.healthMetric }
              : metric,
          );
        },
      );

      return { previousData };
    },

    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          HEALTH_METRICS_QUERY_KEY,
          context.previousData,
        );
      }
      console.error("Failed to upsert health metric:", error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: HEALTH_METRICS_QUERY_KEY,
      });
    },
  });
};

/**
 * ヘルスデータの削除
 */
export const useDeleteHealthMetric = () => {
  const queryClient = useQueryClient();

  return api.healthMetric.deleteHealthMetric.useMutation({
    onMutate: async (deletedMetric) => {
      await queryClient.cancelQueries({ queryKey: HEALTH_METRICS_QUERY_KEY });

      const previousData = queryClient.getQueryData<HealthMetric[]>(
        HEALTH_METRICS_QUERY_KEY,
      );

      queryClient.setQueryData(
        HEALTH_METRICS_QUERY_KEY,
        (oldData?: HealthMetric[]) => {
          if (!oldData) return [];
          return oldData.filter(
            (metric) =>
              metric.date?.toISOString() !== deletedMetric.date?.toISOString(),
          );
        },
      );

      return { previousData };
    },

    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          HEALTH_METRICS_QUERY_KEY,
          context.previousData,
        );
      }
      console.error("Failed to delete health metric:", error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: HEALTH_METRICS_QUERY_KEY,
      });
    },
  });
};
