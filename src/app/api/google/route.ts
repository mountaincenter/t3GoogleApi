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

import fs from "fs/promises";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import type { OAuth2Client } from "google-auth-library"; // 型の追加
import { NextResponse } from "next/server";
import { oauth2 } from "googleapis/build/src/apis/oauth2";

// __dirname の代わりに import.meta.url を使用
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If modifying these scopes, delete token.json.
const SCOPES: string[] = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/fitness.nutrition.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.body.write",
  "https://www.googleapis.com/auth/userinfo.profile",
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH: string = path.join(__dirname, "token.json");
const CREDENTIALS_PATH: string = path.join(__dirname, "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client | null>}
 */
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content: Buffer = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: OAuth2Client): Promise<void> {
  const content: Buffer = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Deletes the stored token file to restart the OAuth flow.
 */
async function resetOAuthFlow(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
    console.log("OAuth token reset. Please reauthorize.");
  } catch (error) {
    console.error("Error resetting OAuth token:", error);
  }
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as OAuth2Client;
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
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

async function listProfile(authClient: OAuth2Client) {
  const peopleApi = google.people({ version: "v1", auth: authClient });
  const { data: name } = await peopleApi.people.get({
    resourceName: "people/me",
    personFields: "names",
  });
  return name ?? [];
}

export async function GET() {
  try {
    await resetOAuthFlow(); // OAuth フローをリセットする処理を追加
    console.log("OAuth flow has been reset. Initiating re-authentication...");

    const authClient = await authorize(); // 新しい認証フローを開始
    const files = await listProfile(authClient);
    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching Google Drive files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
