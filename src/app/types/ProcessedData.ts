export interface HealthMetric {
  date: Date;
  weight?: number | null;
  weightStartTimeNanos?: bigint | null; // ✅ bigint に統一
  systolic?: number | null;
  diastolic?: number | null;
  bloodPressureStartTimeNanos?: bigint | null; // ✅ bigint に統一
  calories?: number | null;
  sodium?: number | null;
  protein?: number | null;
  fat?: number | null;
  nutritionStartTimeNanos?: bigint | null; // ✅ bigint に統一
}
