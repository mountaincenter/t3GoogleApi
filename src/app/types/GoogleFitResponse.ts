interface Value {
  fpVal?: number; // `fpVal`はオプショナルに設定
  mapVal: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface Point {
  value: Value[];
  startTimeNanos: string;
  dataTypeName: string;
}

interface Dataset {
  point: Point[];
}

interface Bucket {
  dataset: Dataset[];
}

export interface GoogleFitResponse {
  bucket: Bucket[];
}
