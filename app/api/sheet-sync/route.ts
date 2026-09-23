import { appendScenarioToSheet, sheetsConfigured } from "@/lib/sheets";
import { validateInputs } from "@/lib/finance";

export async function POST(request: Request) {
  const sheetEnv = { GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID };
  if (!sheetsConfigured(sheetEnv)) return Response.json({ error: "Sheet connection is unavailable." }, { status: 503 });
  try {
    const payload = await request.json() as { id?: unknown; inputs?: unknown; createdAt?: unknown };
    if (typeof payload.id !== "string" || !/^[0-9a-f-]{36}$/.test(payload.id)) throw new Error("Invalid plan ID");
    if (typeof payload.createdAt !== "number" || !Number.isFinite(payload.createdAt)) throw new Error("Invalid date");
    const inputs = validateInputs(payload.inputs);
    await appendScenarioToSheet(sheetEnv, payload.id, inputs, payload.createdAt);
    return Response.json({ synced: true });
  } catch {
    return Response.json({ error: "Could not sync this plan." }, { status: 400 });
  }
}
