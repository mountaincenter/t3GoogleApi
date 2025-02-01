import type { GoogleFitResponse } from "@/app/types/GoogleFitResponse";
import type { ErrorResponse } from "@/app/types/ErrorResponse";
import type {
  Weight,
  BloodPressure,
  Nutrition,
} from "@/app/types/ProcessedData";

interface Entry {
  key: string; // 栄養素の種類 (calories, sodium, protein, fat.totalなど)
  value: {
    fpVal: number; // 数値データ
  };
}

const HealthMetricsFetcher = async (
  accessToken: string,
): Promise<{
  rawData: GoogleFitResponse;
  weightResponse: Weight[];
  bloodPressureResponse: BloodPressure[];
  nutritionResponse: Nutrition[];
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
        startTimeMillis: Date.now() - 2 * 24 * 60 * 60 * 1000,
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

  // JST (日本時間) に変換し、Date オブジェクトとして取得
  const convertToJST = (utcMillis: number): Date =>
    new Date(utcMillis + 9 * 60 * 60 * 1000);

  // 各データごとの配列
  const weightResponse: Weight[] = [];
  const bloodPressureResponse: BloodPressure[] = [];
  const nutritionResponse: Nutrition[] = [];

  // 体重データの処理
  rawData.bucket.forEach((bucket) => {
    bucket.dataset.forEach((dataset) => {
      dataset.point
        .filter((point) => point.dataTypeName === "com.google.weight.summary")
        .forEach((point) => {
          const date = convertToJST(Number(point.startTimeNanos) / 1e6);
          weightResponse.push({ date, weight: point.value?.[0]?.fpVal ?? 0 });
        });
    });
  });

  // 血圧データの処理
  rawData.bucket.forEach((bucket) => {
    bucket.dataset.forEach((dataset) => {
      dataset.point
        .filter(
          (point) => point.dataTypeName === "com.google.blood_pressure.summary",
        )
        .forEach((point) => {
          const date = convertToJST(Number(point.startTimeNanos) / 1e6);
          bloodPressureResponse.push({
            date,
            systolic: point.value?.[0]?.fpVal ?? 0,
            diastolic: point.value?.[3]?.fpVal ?? 0,
          });
        });
    });
  });

  // 栄養データの処理
  rawData.bucket.forEach((bucket) => {
    bucket.dataset.forEach((dataset) => {
      dataset.point
        .filter(
          (point) => point.dataTypeName === "com.google.nutrition.summary",
        )
        .forEach((point) => {
          const date = convertToJST(Number(point.startTimeNanos) / 1e6);

          const nutritionData: Nutrition = {
            date,
            calories: 0,
            salt: 0,
            protein: 0,
            fat: 0,
          };

          point.value?.[0]?.mapVal?.forEach((entry: Entry) => {
            switch (entry.key) {
              case "calories":
                nutritionData.calories = entry.value?.fpVal ?? 0;
                break;
              case "sodium":
                nutritionData.salt = entry.value?.fpVal ?? 0;
                break;
              case "protein":
                nutritionData.protein = entry.value?.fpVal ?? 0;
                break;
              case "fat.total":
                nutritionData.fat = entry.value?.fpVal ?? 0;
                break;
            }
          });

          nutritionResponse.push(nutritionData);
        });
    });
  });

  return { rawData, weightResponse, bloodPressureResponse, nutritionResponse };
};

export default HealthMetricsFetcher;
