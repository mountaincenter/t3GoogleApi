export interface GoogleFitDataSource {
  dataStreamId: string; // データストリームの一意なID
  dataStreamName: string; // データストリームの名前
  type: string; // データの種類（e.g., "raw" または "derived"）
  application: {
    name: string; // データストリームを生成したアプリケーションの名前
    version?: string; // （任意）アプリケーションのバージョン
  };
  dataType: {
    name: string; // データ型名（e.g., "com.google.step_count.delta"）
    field: {
      name: string; // データフィールド名
      format: string; // データフォーマット（e.g., "integer", "floatPoint"）
    }[];
  };
  device?: {
    uid: string; // デバイスの一意なID
    type: string; // デバイスタイプ（e.g., "phone", "tablet"）
    version: string; // デバイスバージョン
    model: string; // デバイスモデル
    manufacturer: string; // デバイスメーカー
  };
  creationTimeMillis?: string; // データソースが作成された時刻（ミリ秒単位）
}
