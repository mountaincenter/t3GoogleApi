"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GoogleDriveFile } from "../types/ProcessedData";
import { useUserMutation } from "../_components/hooks/useUserMutaion";

type ApiResponse = {
  success: boolean;
  files: GoogleDriveFile[];
  error?: string;
};

const GoogleApis = () => {
  const [data, setData] = useState<GoogleDriveFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useUserMutation();

  console.log(user);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/google");
      const result: unknown = await response.json(); // `unknown` に型付け

      // 型チェックを行い、安全にデータを扱う
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result &&
        typeof result.success === "boolean"
      ) {
        const apiResponse = result as ApiResponse;
        if (apiResponse.success && apiResponse.files) {
          setData(apiResponse.files);
          setError(null);
        } else {
          setError(apiResponse.error ?? "Failed to fetch data");
        }
      } else {
        setError("Invalid response format");
      }
    } catch (_err) {
      console.error("Error fetching data:", _err); // `_err` を利用してエラーを回避
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Google Drive Files</h1>

      <Button onClick={fetchData} disabled={loading} className="mb-4">
        {loading ? "Loading..." : "Fetch Google Drive Files"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {data ? (
        <pre className="overflow-auto p-4">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>No data fetched yet.</p>
      )}
    </div>
  );
};

export default GoogleApis;
