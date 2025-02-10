import type { GoogleFitResponse } from "@/app/types/GoogleFitResponse";
import type { ErrorResponse } from "@/app/types/ErrorResponse";
import type { HealthMetric } from "@prisma/client";

interface Entry {
  key: string; // 栄養素の種類 (calories, sodium, protein, fat.total など)
  value: {
    fpVal: number; // 数値データ
  };
}

const HealthMetricsFetcher = async (
  accessToken: string,
): Promise<{
  rawData: GoogleFitResponse;
  healthMetricResponse: HealthMetric[];
}> => {
  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [
          {
            dataSourceId:
              "derived:com.google.weight:com.google.android.gms:merge_weight",
          },
          {
            dataSourceId:
              "derived:com.google.blood_pressure:com.google.android.gms:merged",
          },
          {
            dataSourceId:
              "derived:com.google.nutrition:com.google.android.gms:merged",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: Date.now() - 14 * 24 * 60 * 60 * 1000,
        endTimeMillis: Date.now(),
      }),
    },
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(
      errorData.error?.message ?? "Failed to fetch data sources.",
    );
  }

  const rawData = (await response.json()) as GoogleFitResponse;

  const healthMetricResponse: HealthMetric[] = [];

  // JST (日本時間) に変換する関数
  const convertToJST = (utcMillis?: number | null): Date | null => {
    if (utcMillis === undefined || utcMillis === null || isNaN(utcMillis)) {
      return null;
    }
    return new Date(utcMillis + 9 * 60 * 60 * 1000);
  };

  // JST の 00:00:00 にリセットする関数
  const getJSTMidnight = (date: Date | null): Date | null => {
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    const midnight = new Date(date);
    midnight.setUTCHours(0, 0, 0, 0);
    return midnight;
  };

  const metricMap = new Map<string, HealthMetric>();

  rawData.bucket.forEach((bucket) => {
    bucket.dataset.forEach((dataset) => {
      dataset.point.forEach((point) => {
        if (!point.startTimeNanos) {
          console.warn("Invalid data: startTimeNanos is missing", point);
          return; // ここでスキップ
        }

        const measurementDate = convertToJST(
          Number(point.startTimeNanos) / 1e6,
        );
        if (!measurementDate || isNaN(measurementDate.getTime())) {
          console.warn("Invalid date conversion", point);
          return; // 日付が無効ならスキップ
        }

        const midnightDate = getJSTMidnight(measurementDate);
        if (!midnightDate || isNaN(midnightDate.getTime())) {
          console.warn("Invalid midnight conversion", point);
          return; // 日付が無効ならスキップ
        }

        const dateKey = midnightDate.toISOString();

        if (!metricMap.has(dateKey)) {
          metricMap.set(dateKey, {
            id: "", // Prismaの型に適合させるため仮のID
            userId: "", // ユーザー情報が取得できないため仮の値
            date: midnightDate, // null の場合はスキップしているので、ここでは問題なし
            weight: null,
            weightStartTimeNanos: null,
            systolic: null,
            diastolic: null,
            bloodPressureStartTimeNanos: null,
            calories: null,
            sodium: null,
            protein: null,
            fat: null,
            nutritionStartTimeNanos: null,
            lastFetchedAt: new Date(), // フェッチ日時
          });
        }

        const metric = metricMap.get(dateKey)!;

        switch (point.dataTypeName) {
          case "com.google.weight.summary":
            metric.weight = point.value?.[0]?.fpVal ?? null;
            metric.weightStartTimeNanos =
              point.startTimeNanos !== undefined
                ? BigInt(point.startTimeNanos)
                : null;
            break;

          case "com.google.blood_pressure.summary":
            metric.systolic = point.value?.[0]?.fpVal ?? null;
            metric.diastolic = point.value?.[3]?.fpVal ?? null;
            metric.bloodPressureStartTimeNanos =
              point.startTimeNanos !== undefined
                ? BigInt(point.startTimeNanos)
                : null;
            break;

          case "com.google.nutrition.summary":
            metric.nutritionStartTimeNanos =
              point.startTimeNanos !== undefined
                ? BigInt(point.startTimeNanos)
                : null;

            point.value?.[0]?.mapVal?.forEach((entry: Entry) => {
              switch (entry.key) {
                case "calories":
                  metric.calories = entry.value?.fpVal ?? null;
                  break;
                case "sodium":
                  metric.sodium = entry.value?.fpVal ?? null;
                  break;
                case "protein":
                  metric.protein = entry.value?.fpVal ?? null;
                  break;
                case "fat.total":
                  metric.fat = entry.value?.fpVal ?? null;
                  break;
              }
            });
            break;
        }
      });
    });
  });

  healthMetricResponse.push(...metricMap.values());

  return {
    rawData,
    healthMetricResponse,
  };
};

export default HealthMetricsFetcher;
