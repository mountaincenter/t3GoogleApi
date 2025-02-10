"use client";

import React, { useState } from "react";
import HealtMetricsDashboard from "../HealthMetrics/HealthMetricsDashboard";
import DataSourcesDashboard from "../DataSources/DataSourcesDashboard";
import HealthMetricsGraph from "../HealthMetrics/HealthMetricsGraph";
import HealthMetricsTable from "../HealthMetrics/HealthMetricsTable";
import { useHealthMetrics } from "../_components/hooks/useHealthMetricMutation";
import { Button } from "@/components/ui/button";

const GoogleFitPage = () => {
  const [pageAccessToken, setPageAccessToken] = useState<string | null>(null);
  const { data } = useHealthMetrics();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID ?? "";
  const redirectUri =
    process.env.NEXT_PUBLIC_GOOGLE_FIT_REDIRECT_URI ?? "http://localhost:3000";
  const scopes = [
    "https://www.googleapis.com/auth/fitness.nutrition.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.blood_pressure.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.body.write",
  ].join(" ");

  const generateAuthUrl = () => {
    const baseUrl = "https://accounts.google.com/o/oauth2/auth";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: scopes,
      include_granted_scopes: "true",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const extractAccessTokenFromUrl = () => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    const token = hashParams.get("access_token");
    if (token) {
      setPageAccessToken(token);
      window.history.replaceState({}, document.title, "/");
    }
  };

  React.useEffect(() => {
    extractAccessTokenFromUrl();
  }, []);

  return (
    <div className="flex-col items-center justify-center">
      {!pageAccessToken ? (
        <div className="flex flex-col justify-center">
          <Button
            onClick={() => (window.location.href = generateAuthUrl())}
            className="mb-4"
          >
            Authenticate with Google
          </Button>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center gap-2">
          <DataSourcesDashboard accessToken={pageAccessToken} />
          <HealtMetricsDashboard accessToken={pageAccessToken} />
        </div>
      )}
      {data && (
        <div className="fle w-full flex-col items-center">
          <HealthMetricsTable data={data} />
          <div className="mt-8">
            <HealthMetricsGraph data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleFitPage;
