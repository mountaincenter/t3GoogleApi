/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library"; // 型の追加
import { NextResponse } from "next/server";
import { userHandler } from "@/server/api/handlers/userHandler";
import { auth } from "@/server/auth";

// If modifying these scopes, delete token.json.
const SCOPES: string[] = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.body.read",
];

const credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  auth_uri: process.env.GOOGLE_AUTH_URI!,
  token_uri: process.env.GOOGLE_TOKEN_URI!,
  auth_provider_x509_cert_url: process.env.GOOGLE_CERT_URL!,
  redirect_uris: process.env.GOOGLE_REDIRECT_URIS!.split(","), // 複数URIを配列に変換
};

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(userId: string): Promise<OAuth2Client> {
  try {
    // Prisma から refresh_token を取得
    const refreshToken = await userHandler.getRefreshTokenFromPrisma(userId);

    if (refreshToken) {
      console.log("Using refresh token from Prisma.");

      return google.auth.fromJSON({
        type: "authorized_user",
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        refresh_token: refreshToken,
      }) as OAuth2Client;
    }

    console.log("No refresh token found, proceeding with authentication.");

    // 認証を実行
    const client = await authenticate({
      scopes: SCOPES,
    });

    if (client.credentials.refresh_token) {
      await userHandler.updateRefreshToken(
        userId,
        "google",
        client.credentials.refresh_token,
      );
      console.log("New refresh token saved in Prisma.");
    }

    return client;
  } catch (error) {
    console.error("Error in authorization process:", error);
    throw new Error("Authorization failed.");
  }
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient: OAuth2Client) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });
  return res.data.files ?? [];
}

export async function GET() {
  const session = await auth(); // await を追加してセッションを取得
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const userId = session.user.id; // session から userId を取得
    const authClient = await authorize(userId);
    const files = await listFiles(authClient);
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching Google Drive files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
