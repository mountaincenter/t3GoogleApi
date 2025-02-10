import type { GoogleFitResponse } from "@/app/types/GoogleFitResponse";
import type { ErrorResponse } from "@/app/types/ErrorResponse";

interface Weight {
  dateUTC: Date;
  midnightUTC: Date;
  dateJST: Date;
  midnightJST: Date;
  weight?: number;
}

const WeightFetcher = async (
  accessToken: string,
): Promise<{
  rawWeightData: GoogleFitResponse;
  weightResponse: Weight[];
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
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: Date.now() - 7 * 24 * 60 * 60 * 1000,
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

  const rawWeightData = (await response.json()) as GoogleFitResponse;

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

  // UTC に変換する関数
  const convertToUTC = (utcMillis?: number | null): Date | null => {
    if (utcMillis === undefined || utcMillis === null || isNaN(utcMillis)) {
      return null;
    }
    return new Date(utcMillis);
  };

  // UTC の 00:00:00 にリセットする関数
  const getUTCMidnight = (date: Date | null): Date | null => {
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    const midnight = new Date(date);
    midnight.setUTCHours(0, 0, 0, 0);
    return midnight;
  };

  const weightResponse: Weight[] = [];

  // 体重データの処理
  rawWeightData.bucket.forEach((bucket) => {
    bucket.dataset.forEach((dataset) => {
      dataset.point
        .filter((point) => point.dataTypeName === "com.google.weight.summary")
        .forEach((point) => {
          const utcMillis = Number(point.startTimeNanos) / 1e6;
          const dateUTC = convertToUTC(utcMillis);
          const midnightUTC = getUTCMidnight(dateUTC);
          const dateJST = convertToJST(utcMillis);
          const midnightJST = getJSTMidnight(dateJST);

          if (dateUTC && dateJST && midnightUTC && midnightJST) {
            weightResponse.push({
              dateUTC,
              midnightUTC,
              dateJST,
              midnightJST,
              weight: point.value?.[0]?.fpVal ?? 0,
            });
          }
        });
    });
  });

  return { rawWeightData, weightResponse };
};

export default WeightFetcher;
