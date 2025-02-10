"use client";

import React, { useState } from "react";
import HealthMetricsFetcher from "./HealthMetricsFetcher";
import { Button } from "@/components/ui/button";
import { useHealthMetricSync } from "@/app/_components/hooks/useHealthMetricSync"; // 追加
import { useHealthMetrics } from "@/app/_components/hooks/useHealthMetricMutation"; // Prisma のデータ取得
import type { HealthMetric } from "@/app/types/ProcessedData";
import HealthMetricsTable from "./HealthMetricsTable";
import HealthMetricsGraph from "./HealthMetricsGraph";
import type { GoogleFitResponse } from "../types/GoogleFitResponse";

interface HealthMetricsProps {
  accessToken: string;
}

const HealthMetricsDashboard: React.FC<HealthMetricsProps> = ({
  accessToken,
}) => {
  const [rawData, setRawData] = useState<GoogleFitResponse | null>(null);
  const [bloodPressureRawData, setBloodPressureRawData] =
    useState<GoogleFitResponse | null>(null);
  const [HealthMetricData, setHealthMetricData] = useState<
    HealthMetric[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Prisma から取得するデータ
  const { data: prismaHealthMetrics, refetch } = useHealthMetrics();

  // Google Fit からデータ取得 & Prisma へ保存
  const { isSyncing, handleSync } = useHealthMetricSync({ accessToken });

  console.log("rawData", rawData);

  const handleFetchData = async () => {
    try {
      const { rawData, bloodPressureRawData, healthMetricResponse } =
        await HealthMetricsFetcher(accessToken);
      console.log("payload:", healthMetricResponse); // 🔍 ここでログ出力
      setHealthMetricData(healthMetricResponse);
      setBloodPressureRawData(bloodPressureRawData);
      setRawData(rawData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="mb-4 text-xl">HealthMetrics Dashboard</h1>

      {/* Fetchボタン */}
      <Button onClick={handleFetchData} className="mb-4">
        Fetch HealthMetrics Data
      </Button>

      {/* 同期ボタン */}
      <Button onClick={handleSync} className="mb-4" disabled={isSyncing}>
        {isSyncing ? "Syncing..." : "Sync with Prisma"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {/* Google Fit API の raw データ表示 */}
      {/* {rawData && (
        <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
          rawData:{JSON.stringify(rawData, null, 2)}
        </pre>
      )} */}
      {bloodPressureRawData && (
        <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
          bloodPressureRawData:{JSON.stringify(bloodPressureRawData, null, 2)}
        </pre>
      )}

      {/* Google Fit API から取得したデータ */}
      {/* {HealthMetricData && (
        <>
          <h2 className="mt-4 text-lg">HealthMetric Data (Google API)</h2>
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(
              HealthMetricData,
              (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
              2,
            )}
          </pre>
          <HealthMetricsTable data={HealthMetricData} />
          <HealthMetricsGraph data={HealthMetricData} />
        </>
      )} */}

      {/* Prisma から取得したデータ */}
      {prismaHealthMetrics && (
        <>
          <h2 className="mt-4 text-lg">HealthMetric Data (Prisma)</h2>
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(HealthMetricData, null, 2)}
          </pre>
          <HealthMetricsTable data={prismaHealthMetrics} />
          <HealthMetricsGraph data={prismaHealthMetrics} />
        </>
      )}
    </div>
  );
};

export default HealthMetricsDashboard;
