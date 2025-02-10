"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthMetric as HealthMetricPrisma } from "@prisma/client";
import type { HealthMetric } from "../types/ProcessedData";

interface HealthMetricGraphProps {
  data: HealthMetric[] | HealthMetricPrisma[];
}

interface TooltipPayload {
  date: string;
  weight?: number | null;
  movingAvgWeight?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: TooltipPayload }[];
}

interface ScatterShapeProps {
  cx?: number;
  cy?: number;
  size?: number;
}

// 数値をフォーマット
const formatValue = (value?: number | null): number | null =>
  value !== undefined && value !== null ? Math.round(value * 100) / 100 : null;

// **7日間移動平均を計算**
const calculateMovingAverage = (
  data: HealthMetric[] | HealthMetricPrisma[],
  windowSize = 7,
) => {
  return data.map((metric, index) => {
    const start = Math.max(0, index - (windowSize - 1));
    const subset = data.slice(start, index + 1);
    const validWeights = subset
      .map((item) => item.weight)
      .filter((w) => w !== undefined && w !== null);

    const sum = validWeights.reduce((acc, weight) => acc + (weight ?? 0), 0);
    const avg = validWeights.length > 0 ? sum / validWeights.length : null;

    return {
      ...metric,
      movingAvgWeight: avg !== null ? Math.round(avg * 100) / 100 : null,
    };
  });
};

// データを整形
const formatDataForGraph = (data: HealthMetric[] | HealthMetricPrisma[]) => {
  const averagedData = calculateMovingAverage(data);

  return averagedData.map((metric) => ({
    date: metric.date.toISOString().split("T")[0], // YYYY-MM-DD形式
    weight: formatValue(metric.weight),
    movingAvgWeight: formatValue(metric.movingAvgWeight), // 平均体重
    systolic: formatValue(metric.systolic),
    diastolic: formatValue(metric.diastolic),
    bloodPressure: [
      formatValue(metric.diastolic), // 最低血圧
      formatValue(metric.systolic), // 最高血圧
    ],
  }));
};
// **カスタムツールチップ**
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const tooltipPayload = payload?.[0]?.payload;

  if (active && tooltipPayload) {
    const { date, systolic, diastolic, weight, movingAvgWeight } =
      tooltipPayload;

    return (
      <div className="rounded bg-white p-2 shadow">
        <p>日付: {date}</p>
        <p>体重: {weight ?? "N/A"} kg</p>
        <p>7日間平均: {movingAvgWeight ?? "N/A"} kg</p>
        <p>最高血圧: {systolic ?? "N/A"}</p>
        <p>最低血圧: {diastolic ?? "N/A"}</p>
      </div>
    );
  }

  return null;
};

// **カスタムScatter Shape**
const CustomScatterShape = ({ cx, cy, size = 6 }: ScatterShapeProps) => {
  if (cx === undefined || cy === undefined) return null;

  return <circle cx={cx} cy={cy} r={size / 2} fill="currentColor" />;
};
// **グラフコンポーネント**
const HealthMetricGraph: React.FC<HealthMetricGraphProps> = ({ data }) => {
  const formattedData = formatDataForGraph(data);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>健康指標グラフ</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={formattedData}
            margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              yAxisId="left"
              domain={["auto", "auto"]}
              label={{ value: "体重 (kg)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              domain={[50, 200]}
              orientation="right"
              label={{ value: "血圧", angle: -90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* 体重 (LineChart) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="#8884d8"
              name="体重 (kg)"
              strokeWidth={2}
            />

            {/* 平均体重 (LineChart) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="movingAvgWeight"
              stroke="#ff0000"
              name="平均体重 (kg)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            {/* 血圧（BarChart + Scatter） */}
            <Bar
              yAxisId="right"
              dataKey="bloodPressure"
              fill="#8884d8"
              name="血圧 (最低〜最高)"
              barSize={10}
            />
            <Scatter
              yAxisId="right"
              dataKey="systolic"
              fill="#ff7300"
              name="最高血圧"
              shape={(props: ScatterShapeProps) => (
                <CustomScatterShape {...props} size={15} />
              )}
            />
            <Scatter
              yAxisId="right"
              dataKey="diastolic"
              fill="#387908"
              name="最低血圧"
              shape={(props: ScatterShapeProps) => (
                <CustomScatterShape {...props} size={15} />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default HealthMetricGraph;
