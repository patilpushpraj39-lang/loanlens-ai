import { analyzeLoan, validateInputs } from "@/lib/finance";

export async function POST(request: Request) {
  try {
    const inputs = validateInputs(await request.json());
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: "Claude is not connected. The on-page guidance still works." }, { status: 503 });
    }
    const result = analyzeLoan(inputs);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 430,
        system: "You explain an educational Indian loan planning demo. Use only the provided numbers and result; do not recalculate, promise approval, invent lender policies or claim a verified score. Give three concise, practical points. Mention that rates, fees and criteria vary by lender. No investment or legal advice. Plain text only.",
        messages: [{ role: "user", content: JSON.stringify({
          inputs: { monthlyIncome: inputs.monthlyIncome, existingEmi: inputs.existingEmi, loanAmount: inputs.loanAmount,
            annualRate: inputs.annualRate, tenureMonths: inputs.tenureMonths, creditScore: inputs.creditScore },
          result: { emi: Math.round(result.emi), debtBurdenPercent: Math.round(result.burden * 100),
            totalInterest: Math.round(result.totalInterest), status: result.status, reasons: result.reasons },
        }) }],
      }),
    });
    if (!response.ok) return Response.json({ error: "Claude could not respond right now. Please try again." }, { status: 502 });
    const payload = await response.json() as { content?: Array<{ type: string; text?: string }> };
    const text = payload.content?.filter(item => item.type === "text").map(item => item.text ?? "").join("\n").trim();
    if (!text) throw new Error("Empty AI response");
    return Response.json({ text, source: "claude" }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate guidance.";
    return Response.json({ error: message }, { status: message.includes("must be") || message.includes("Choose") ? 400 : 500 });
  }
}
