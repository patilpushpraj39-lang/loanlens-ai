import { sheetsConfigured } from "@/lib/sheets";

export async function GET() {
  const sheetEnv = { GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID };
  return Response.json({ claude: Boolean(process.env.ANTHROPIC_API_KEY), sheets: sheetsConfigured(sheetEnv) }, {
    headers: { "cache-control": "no-store" },
  });
}
