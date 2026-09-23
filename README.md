# LoanLens AI

An educational BFSI capstone: loan readiness estimates, credit context for a score the user enters, EMI and amortization calculations, rule-based tips, and an interactive What-if Lab.

## Run locally

```bash
npm install
npm run dev
```

The calculator and comparisons work without an API key. Saved plans are stored in this browser's local storage and remain available on the same device. They are lost if site data is cleared and do not sync across devices.

## Optional integrations

Configure these as Vercel environment variables (secret values must never be committed):

- `ANTHROPIC_API_KEY` — enables the Claude financial explanation endpoint.
- `CLAUDE_MODEL` — optional override; default `claude-haiku-4-5-20251001`.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID` — enable user-selected Google Sheets export. Enable Sheets API, create a private sheet tab `Scenarios`, and grant Editor access to the service-account email.

The public AI and sheet endpoints should have account access controls and rate limiting before paid keys are enabled. The demo currently leaves them unconfigured.

## Calculation method

Monthly rate `r = annual rate / 1200`, tenure `n` months, principal `P`. EMI is `P × r × (1+r)^n / ((1+r)^n − 1)`, or `P/n` for a zero rate. Debt load is `(existing monthly EMIs + new EMI) / monthly income`.

The 40% and 50% debt-load markers, score marker of 700, age range 21–65 at maturity, and work-history marker are **illustrative demo assumptions**. They are not a bank's eligibility rules, approval probability, or a credit bureau score. The app does not collect a name, phone number, bank account, or identity document.

## Demo sequence

1. Edit the sample figures and see the EMI, total interest and explained readiness status.
2. Pin a baseline and change amount or tenure in the What-if Lab.
3. Explain why the Credit Context only analyzes a score provided by the user.
4. Review the year-by-year amortization table.
5. Save a fictional plan, reload it, and delete it on the same browser.
6. If configured, show Claude guidance and an opt-in Google Sheets export.

See `docs/CAPSTONE_REPORT.md` for the workflow and architecture diagrams.
