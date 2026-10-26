function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
async function accessToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: email,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3000,
      }),
    ),
  );
  const keyBytes = Uint8Array.from(
    atob(
      privateKey
        .replace(/\\n/g, "\n")
        .replace(/-----[^-]+-----/g, "")
        .replace(/\s/g, ""),
    ),
    (c) => c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(`${header}.${payload}`),
    ),
  );
  const assertion = `${header}.${payload}.${base64url(signature)}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error("Google authorization failed");
  const data = await response.json();
  if (!data.access_token)
    throw new Error("Google authorization returned no token");
  return data.access_token;
}
export function sheetsConfigured(env) {
  return Boolean(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      env.GOOGLE_PRIVATE_KEY &&
      env.GOOGLE_SHEET_ID,
  );
}
export async function appendScenarioToSheet(env, id, inputs, createdAt) {
  if (!sheetsConfigured(env)) return false;
  const token = await accessToken(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    env.GOOGLE_PRIVATE_KEY,
  );
  const range = encodeURIComponent("Scenarios!A:N");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.GOOGLE_SHEET_ID)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      values: [
        [
          new Date(createdAt).toISOString(),
          id,
          inputs.monthlyIncome,
          inputs.existingEmi,
          inputs.loanAmount,
          inputs.annualRate,
          inputs.tenureMonths,
          inputs.age,
          inputs.employment,
          inputs.experienceYears,
          inputs.creditScore ?? "not provided",
        ],
      ],
    }),
  });
  if (!response.ok) throw new Error("Google Sheets write failed");
  return true;
}
