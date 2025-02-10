"use client";

import React, { useState } from "react";
import { fetchGoogleFitDataSources } from "./DataSourcesFetcher";
import { Button } from "@/components/ui/button";

import BloodPressureFetcher from "./WeightFetcher";

interface DataSourcesDashboardProps {
  accessToken: string;
}

const DataSourcesDashboard: React.FC<DataSourcesDashboardProps> = ({
  accessToken,
}) => {
  const [dataSources, setDataSources] = useState<any | null>(null);
  const [bloodPressure, setBloodPressure] = useState<any | null>(null);
  const [weightResponse, setWeightResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(dataSources);

  const handleFetchDataSources = async () => {
    try {
      const data = await fetchGoogleFitDataSources(accessToken);
      const { rawWeightData, weightResponse } =
        await BloodPressureFetcher(accessToken);
      setBloodPressure(rawWeightData);
      setWeightResponse(weightResponse);
      setDataSources(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-xl">Google Fit Data Sources</h1>
      <Button onClick={handleFetchDataSources} className="mb-4">
        Fetch Data Sources
      </Button>
      {error && <p className="text-red-500">{error}</p>}
      {weightResponse && (
        <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
          {JSON.stringify(weightResponse, null, 2)}
        </pre>
      )}
      {dataSources && (
        <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
          {JSON.stringify(dataSources, null, 2)}
        </pre>
      )}
      {bloodPressure && (
        <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-4">
          {JSON.stringify(bloodPressure, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DataSourcesDashboard;
