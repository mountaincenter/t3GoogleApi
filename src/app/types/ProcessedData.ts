export interface Weight {
  date: Date; // `Date`型に変更
  weight: number; // 体重
}
export interface BloodPressure {
  date: Date;
  systolic: number;
  diastolic: number;
}

export interface Nutrition {
  date: Date;
  calories: number;
  salt: number;
  protein: number;
  fat: number;
}

export interface HealthMetrics {
  weight: Weight[];
  bloodPressure: BloodPressure[];
  nutrition: Nutrition[];
}
