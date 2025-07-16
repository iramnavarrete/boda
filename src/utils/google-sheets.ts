// utils/google-sheets.js
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_SERVICE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_SERVICE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SERVICE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    client_id: process.env.GOOGLE_SERVICE_CLIENT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function getSheetsClient() {
  return google.sheets({ version: "v4", auth });
}
