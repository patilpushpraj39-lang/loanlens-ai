# LoanLens AI

**AI Specialist - BFSI Capstone Project**

LoanLens AI is an educational financial-planning web application that helps users understand loan affordability before borrowing. It combines EMI calculations, debt-load analysis, user-provided credit-score context, financial guidance, scenario comparison, and browser-local saved plans in one responsive interface.

## Project links

- **Live application:** https://loanlens-ai-henna.vercel.app/
- **Source code:** https://github.com/patilpushpraj39-lang/loanlens-ai
- **Detailed report:** [docs/CAPSTONE_REPORT.md](docs/CAPSTONE_REPORT.md)
- **Delivery checklist:** [docs/TASKS.md](docs/TASKS.md)

## Core modules

| Module | What it does |
| --- | --- |
| Loan Planner | Calculates EMI, debt load, total interest and repayment, then explains an illustrative readiness result |
| Credit Context | Interprets a credit score entered by the user without pretending to fetch bureau data |
| EMI Breakdown | Shows the year-by-year split between principal, interest and outstanding balance |
| Financial Tips | Provides deterministic suggestions based on the current plan |
| What-if Lab | Compares the current scenario with a pinned baseline while the user changes amount, tenure or debt |
| Saved Plans | Saves, reloads and deletes fictional scenarios in the same browser |

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS
- Recharts
- Vercel deployment
- Optional Anthropic Claude and Google Sheets server routes

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/patilpushpraj39-lang/loanlens-ai.git
cd loanlens-ai
npm install
npm run dev
```

Open `http://localhost:3000`.

The calculator, comparison tools and local saved plans work without API credentials.

## Project structure

```text
app/                 Application pages and server routes
components/          Interface components
lib/finance.ts       EMI, amortization and readiness logic
lib/sheets.ts        Optional Google Sheets integration
docs/                Project report and delivery checklist
public/              Static assets
```

## Calculation method

For principal `P`, monthly rate `r = annual rate / 1200`, and tenure `n` months:

```text
EMI = P x r x (1+r)^n / ((1+r)^n - 1)
```

For a zero-interest loan, `EMI = P / n`.

Debt load is calculated as:

```text
(existing monthly EMIs + new EMI) / monthly income
```

The readiness markers are transparent educational assumptions defined in `lib/finance.ts`. They are not a lender's underwriting rules or an approval probability.

## Optional integrations

The core application is fully demonstrable without external credentials. The following integrations are optional and intentionally disabled on the public demo until account-owned secrets and suitable access controls are supplied:

- `ANTHROPIC_API_KEY` and optional `CLAUDE_MODEL`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`

Secrets must be configured in Vercel and must never be committed to GitHub.

## Verification

- Public Vercel deployment loads successfully
- EMI, zero-rate, amortization and invalid-input boundaries were checked
- TypeScript checks and the production build passed
- The sample fixture of Rs. 5,00,000 at 12% for 36 months produces an EMI of approximately Rs. 16,607.15

## Suggested demonstration

1. Change the loan amount, rate, tenure and income.
2. Explain the EMI, total interest and debt-load result.
3. Pin the current plan and compare changes in the What-if Lab.
4. Show the user-provided Credit Context.
5. Open the EMI breakdown and financial tips.
6. Save, reload and delete a fictional plan.

## Data and safety

The public demo does not request names, phone numbers, bank-account details or identity documents. Saved plans stay in the user's browser unless the optional export integration is explicitly configured and selected.

> **Educational disclaimer:** LoanLens AI is a capstone demonstration. Its results are estimates, not financial advice, a credit-bureau score, a loan offer or an approval decision.

## Author

Pushpraj Patil
