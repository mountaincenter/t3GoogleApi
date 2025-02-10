"use client";

import { useState } from "react";
import { useUpsertHealthMetric } from "./useHealthMetricMutation";
import HealthMetricsFetcher from "@/app/HealthMetrics/HealthMetricsFetcher";
/**
 * Google Fit API からヘルスデータを取得し、Prisma に upsert する
 */
interface useHealthMetricSyncProps {
  accessToken: string;
}
export const useHealthMetricSync = ({
  accessToken,
}: useHealthMetricSyncProps) => {
  const upsertMutation = useUpsertHealthMetric();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!accessToken) return;

    try {
      setIsSyncing(true);
      const { healthMetricResponse } = await HealthMetricsFetcher(accessToken);

      // 取得したデータを1件ずつ upsert
      for (const metric of healthMetricResponse) {
        await upsertMutation.mutateAsync({ healthMetric: metric });
      }
    } catch (error) {
      console.error("Failed to sync health metrics:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, handleSync };
};
