# LoanLens AI: build, run and present

## 1. Understand your project
**Academic title:** AI Loan Eligibility Checker and Financial Planning Platform.
**Product name:** LoanLens AI.
**Course:** AI Specialist – BFSI (Banking, Financial Services and Insurance).

The project helps a user understand a proposed loan through four connected tools: an explained loan-readiness estimate, credit-score context, an EMI calculator and financial tips. The additional What-if Lab compares a pinned plan against changed loan terms. Its distinctive feature is explaining trade-offs, rather than displaying an unexplained approval percentage.

The interface uses a light theme as requested. The supplied brief mentions a dark theme; confirm with your evaluator that the visual change is acceptable. The implementation uses React/Next.js, TypeScript, CSS and accessible UI primitives, rather than a pure HTML/JavaScript-only stack. Explain that distinction if asked.

## 2. Get the code
Open the GitHub repository, choose **Code → Download ZIP**, and extract it. Open the extracted folder in VS Code. Alternatively:

```bash
git clone https://github.com/patilpushpraj39-lang/loanlens-ai.git
cd loanlens-ai
```

Use Node.js 22.13 or newer and the repository's pnpm version. In a terminal:

```bash
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost address printed by the terminal. Keep the terminal running while using the app.

## 3. Learn the code in this order
1. `lib/finance.ts`: inputs, validation, EMI formula, amortization and transparent demo rules.
2. `app/page.tsx`: form fields, tabs, What-if Lab, saved plans and integration requests.
3. `app/globals.css`: light palette, layouts, responsive behavior and reduced-motion support.
4. `app/api/insights/route.ts`: server-only Claude request and limited financial context.
5. `lib/sheets.ts` and `app/api/sheet-sync/route.ts`: optional opt-in spreadsheet export.
6. `docs/CAPSTONE_REPORT.md`: abstract, modules, diagrams and limitations.

## 4. Demonstrate the four required tools
Use fictional numbers, not someone's actual financial details.

**Loan planner:** enter monthly income ₹85,000, existing EMIs ₹8,500, loan amount ₹12,00,000, annual rate 11.5%, tenure 60 months, age 28, salaried employment, three years of experience and a self-reported score of 742. Read the monthly EMI and debt load. Open Financial Tips to explain the reasons behind the result.

**Credit context:** change the entered score to 620, then remove it. Explain how the text changes. This app analyzes an entered score; it does not fetch or create an official bureau score.

**EMI breakdown:** show principal, total interest, total repayment and the annual repayment table. Explain that early payments generally contain more interest because the outstanding principal is larger.

**Financial tips:** explain the rule-based reasons and suggested next steps. Claude adds a natural-language summary only when configured. Do not present the default rule-based text as a live AI response.

## 5. Show the unique What-if Lab
1. Pin the current plan as your baseline.
2. Reduce the loan amount and compare the monthly payments.
3. Increase tenure and compare total interest as well as the EMI.
4. Explain: a lower EMI can still mean a higher lifetime borrowing cost.
5. Save a fictional plan, reload it, then delete it. Saved plans stay in the same browser only.

## 6. Explain the mathematics
For principal P, monthly interest rate r = annual percentage / 1200, and n monthly payments:

`EMI = P × r × (1+r)^n / ((1+r)^n − 1)`

At zero interest: `EMI = P/n`.

`Debt load = (existing monthly EMIs + proposed EMI) / monthly income`.

The 40%/50% debt-load thresholds, credit markers, age-at-maturity range and work-history marker are educational assumptions. Employment categories requiring individual income-source review are flagged. These are not bank policies, approval probabilities or a trained machine-learning model.

## 7. Verify your work

```bash
node --experimental-strip-types docs/finance.test.mjs
pnpm typecheck
pnpm build
```

Manual checks: enter zero income; enter an invalid score; clear the optional score; switch employment; change the scenario sliders; save/reload/delete a fictional plan; view all tabs on a narrow phone screen. Verify that invalid inputs prevent a valid-looking result.

## 8. Hosting
**GitHub Pages:** pushes to main trigger the included workflow. It builds a static copy with the planner, credit context, EMI breakdown, deterministic tips and browser-local saved plans. It cannot run Claude or Sheets server endpoints.

**Vercel:** import this repository with the Next.js preset and deploy. Use the generated deployment URL. A connected project normally rebuilds after a push; inspect its deployment status rather than assuming success.

## 9. Optional Claude and Sheets setup
Do not put API keys in frontend code, commits, screenshots or chat messages.

For a private local demonstration, copy `.env.example` to `.env.local`. Set `ANTHROPIC_API_KEY` and, if needed, `CLAUDE_MODEL`. Restart the development server. The AI button becomes available when the status endpoint reports configuration. Availability does not prove a successful paid API call; test with fictional data and an active provider account.

For Google Sheets, enable Sheets API in your Google Cloud project, create a service account, and share a private spreadsheet with its email as Editor. Add a tab named `Scenarios`. Configure `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID` privately. Save a fictional plan with the sync checkbox selected and verify a row appears. Spreadsheet export is optional; browser-local records remain the app's history. Cross-device cloud retrieval is not implemented.

Before adding paid credentials to an internet-accessible deployment, implement authenticated endpoint access and durable rate limiting. The current prototype does not include those protections. Leave the public demo integrations unconfigured until then. Do not call this production-ready secure financial storage.

## 10. Two-minute presentation script
“LoanLens AI is my BFSI capstone prototype for understanding borrowing decisions. It combines loan readiness, credit context, EMI calculations and financial guidance in a light, responsive workspace. I will enter fictional financial details, show the calculation, and explain the assumptions behind its result. The What-if Lab compares two scenarios so we can see how a lower EMI may increase total interest. The calculation engine is deterministic; the optional Claude integration explains its output. Scores are user-provided, and estimates are not loan approvals. Future work includes authenticated cloud records, lender-approved policies and evaluated ML models.”

## 11. Common viva questions
**Where is AI used?** In the optional server-side Claude explanation route. The eligibility estimate itself uses transparent rules.

**Did you train a model?** No. There is no training dataset or measured prediction accuracy in this prototype.

**Why use server routes?** To keep provider credentials outside browser bundles and validate requests.

**Why Google Sheets?** It is a simple demonstration export destination; it is not a substitute for a production financial database with account access controls.

**What makes the project distinctive?** Connected tools, explained assumptions, baseline comparisons and explicit EMI-versus-total-cost trade-offs.

**What did you implement?** Explain code you have reviewed and changed. Describe any AI assistance honestly; a custom visual design does not establish manual authorship.
