import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm", // ESM モジュール用の設定
  testEnvironment: "node", // Next.js の場合 "jsdom" も可
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true, // ESM（ECMAScript Module）対応
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // TypeScript の設定を適用
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // `@` を `src/` にマッピング
  },
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
};

export default config;
