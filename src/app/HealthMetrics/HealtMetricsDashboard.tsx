"use client";

import React, { useState } from "react";
import HealthMetricsFetcher from "./HealthMetricsFetcher";

import { Button } from "@/components/ui/button";
import type { GoogleFitResponse } from "@/app/types/GoogleFitResponse";
import type {
  Weight,
  BloodPressure,
  Nutrition,
} from "@/app/types/ProcessedData";

interface HealthMetricsProps {
  accessToken: string;
}

const HealthMetricsDashboard: React.FC<HealthMetricsProps> = ({
  accessToken,
}) => {
  const [weightData, setWeightData] = useState<Weight[] | null>(null);
  const [bloodPressureData, setBloodPressureData] = useState<
    BloodPressure[] | null
  >(null);
  const [nutritionData, setNutritionData] = useState<Nutrition[] | null>(null);
  const [rawData, setRawData] = useState<GoogleFitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    try {
      const {
        rawData,
        weightResponse,
        bloodPressureResponse,
        nutritionResponse,
      } = await HealthMetricsFetcher(accessToken);

      setWeightData(weightResponse);
      setBloodPressureData(bloodPressureResponse);
      setNutritionData(nutritionResponse);
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
      <Button onClick={handleFetchData} className="btn mb-4">
        Fetch HealthMetrics Data
      </Button>
      {error && <p className="text-red-500">{error}</p>}

      {rawData && (
        <>
          <h2 className="mt-4 text-lg">Raw Data</h2>
          <pre className="mt-4 overflow-x-auto rounded p-4">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </>
      )}

      {weightData && (
        <>
          <h2 className="mt-4 text-lg">Weight Data</h2>
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(weightData, null, 2)}
          </pre>
        </>
      )}

      {bloodPressureData && (
        <>
          <h2 className="mt-4 text-lg">Blood Pressure Data</h2>
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(bloodPressureData, null, 2)}
          </pre>
        </>
      )}

      {nutritionData && (
        <>
          <h2 className="mt-4 text-lg">Nutrition Data</h2>
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(nutritionData, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default HealthMetricsDashboard;
