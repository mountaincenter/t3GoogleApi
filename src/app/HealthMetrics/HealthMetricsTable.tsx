import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HealthMetric as HealthMetricPrisma } from "@prisma/client";
import type { HealthMetric } from "../types/ProcessedData";

interface HealthMetricTableProps {
  data: HealthMetric[] | HealthMetricPrisma[];
}

// 体重を小数点第2位まで0埋めする
const formatWeight = (value: number | "-"): string =>
  value !== "-" ? value.toFixed(2) : "-";

// 数値をカンマ区切りで表示する（カロリー用）
const formatNumberWithCommas = (value: number | "-"): string =>
  value !== "-" ? value.toLocaleString() : "-";

// 小数点第1位まで0埋めする（タンパク質・脂質用）
const formatOneDecimal = (value: number | "-"): string =>
  value !== "-" ? value.toFixed(1) : "-";

// ナトリウム(mg) から 食塩相当量(g) へ変換（小数点第1位まで）
const convertSodiumToSalt = (sodium: number | "-"): string =>
  sodium !== "-" ? (Math.round((sodium * 2.54) / 10) / 100).toFixed(1) : "-";

// 7日間移動平均を計算 (nullをスキップして計算)
const calculateMovingAverage = (
  data: HealthMetric[] | HealthMetricPrisma[],
  windowSize = 7,
) => {
  return data.map((metric, index) => {
    const start = Math.max(0, index - (windowSize - 1));
    const subset = data.slice(start, index + 1);
    const validWeights = subset
      .map((item) => item.weight)
      .filter((w) => w !== null && w !== undefined);
    const sum = validWeights.reduce((acc, weight) => acc + (weight ?? 0), 0);
    const avg = validWeights.length > 0 ? sum / validWeights.length : null;

    return {
      ...metric,
      movingAvgWeight: avg !== null ? avg.toFixed(2) : "-",
    };
  });
};

const HealthMetricsTable: React.FC<HealthMetricTableProps> = ({ data }) => {
  const formattedData = calculateMovingAverage(data).map((metric) => ({
    ...metric,
    weight: formatWeight(metric.weight ?? "-"),
    movingAvgWeight: metric.movingAvgWeight,
    systolic: metric.systolic ?? "-",
    diastolic: metric.diastolic ?? "-",
    calories: formatNumberWithCommas(metric.calories ?? "-"),
    salt: convertSodiumToSalt(metric.sodium ?? "-"),
    protein: formatOneDecimal(metric.protein ?? "-"),
    fat: formatOneDecimal(metric.fat ?? "-"),
  }));

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">日付</TableHead>
            <TableHead className="text-right">体重 (kg)</TableHead>
            <TableHead className="text-right">7日間移動平均</TableHead>
            <TableHead className="text-right">最高血圧</TableHead>
            <TableHead className="text-right">最低血圧</TableHead>
            <TableHead className="text-right">カロリー (kcal)</TableHead>
            <TableHead className="text-right">塩分 (g)</TableHead>
            <TableHead className="text-right">タンパク質 (g)</TableHead>
            <TableHead className="text-right">脂質 (g)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedData.map((metric, index) => (
            <TableRow key={index}>
              <TableCell>{metric.date.toISOString().split("T")[0]}</TableCell>
              <TableCell className="text-right">{metric.weight}</TableCell>
              <TableCell className="text-right">
                {metric.movingAvgWeight}
              </TableCell>
              <TableCell className="text-right">{metric.systolic}</TableCell>
              <TableCell className="text-right">{metric.diastolic}</TableCell>
              <TableCell className="text-right">{metric.calories}</TableCell>
              <TableCell className="text-right">{metric.salt}</TableCell>
              <TableCell className="text-right">{metric.protein}</TableCell>
              <TableCell className="text-right">{metric.fat}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HealthMetricsTable;
