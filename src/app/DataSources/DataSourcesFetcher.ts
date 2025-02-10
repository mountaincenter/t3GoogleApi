import type { GoogleFitDataSource } from "@/app/types/GoogleFitDataSource";
import type { ErrorResponse } from "@/app/types/ErrorResponse";

export const fetchGoogleFitDataSources = async (
  accessToken: string,
): Promise<GoogleFitDataSource> => {
  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataSources",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse; // 型を明示的にキャスト
    throw new Error(
      errorData.error?.message ?? "Failed to fetch data sources.",
    );
  }

  const data = (await response.json()) as GoogleFitDataSource; // 型を明示的にキャスト

  return data;
};
