export type Employment = "salaried" | "self-employed" | "student" | "other";

export type LoanInputs = {
  monthlyIncome: number;
  existingEmi: number;
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  age: number;
  employment: Employment;
  experienceYears: number;
  creditScore: number | null;
};

export const sampleInputs: LoanInputs = {
  monthlyIncome: 85000,
  existingEmi: 8500,
  loanAmount: 1200000,
  annualRate: 11.5,
  tenureMonths: 60,
  age: 28,
  employment: "salaried",
  experienceYears: 3,
  creditScore: 742,
};

export const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function validateInputs(value: unknown): LoanInputs {
  if (!value || typeof value !== "object") throw new Error("Enter your loan details first.");
  const data = value as Record<string, unknown>;
  const required = (key: string, min: number, max: number) => {
    const number = data[key];
    if (typeof number !== "number" || !Number.isFinite(number) || number < min || number > max) {
      throw new Error(`${key} must be between ${min} and ${max}.`);
    }
    return number;
  };
  const employment = data.employment;
  if (!["salaried", "self-employed", "student", "other"].includes(String(employment))) {
    throw new Error("Choose a valid employment type.");
  }
  const score = data.creditScore;
  if (score !== null && (typeof score !== "number" || !Number.isInteger(score) || score < 300 || score > 900)) {
    throw new Error("A supplied credit score must be between 300 and 900.");
  }
  const tenureMonths = required("tenureMonths", 1, 360);
  if (!Number.isInteger(tenureMonths)) throw new Error("Tenure must be a whole number of months.");
  return {
    monthlyIncome: required("monthlyIncome", 1, 100000000),
    existingEmi: required("existingEmi", 0, 100000000),
    loanAmount: required("loanAmount", 1000, 100000000),
    annualRate: required("annualRate", 0, 40),
    tenureMonths,
    age: required("age", 18, 80),
    employment: employment as Employment,
    experienceYears: required("experienceYears", 0, 60),
    creditScore: score as number | null,
  };
}

export function monthlyPayment(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0 || annualRate < 0) return 0;
  const r = annualRate / 1200;
  if (r === 0) return principal / months;
  const compound = Math.pow(1 + r, months);
  return principal * r * compound / (compound - 1);
}

export function amortization(inputs: LoanInputs) {
  const payment = monthlyPayment(inputs.loanAmount, inputs.annualRate, inputs.tenureMonths);
  let balance = inputs.loanAmount;
  const years: { year: number; principal: number; interest: number; balance: number }[] = [];
  for (let month = 1; month <= inputs.tenureMonths; month++) {
    const interest = balance * inputs.annualRate / 1200;
    const principal = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principal);
    const year = Math.ceil(month / 12);
    const row = years[year - 1] ?? { year, principal: 0, interest: 0, balance: 0 };
    row.principal += principal;
    row.interest += interest;
    row.balance = balance;
    years[year - 1] = row;
  }
  return years;
}

export function analyzeLoan(inputs: LoanInputs) {
  const emi = monthlyPayment(inputs.loanAmount, inputs.annualRate, inputs.tenureMonths);
  const totalRepayment = emi * inputs.tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - inputs.loanAmount);
  const burden = (inputs.existingEmi + emi) / inputs.monthlyIncome;
  const reasons: string[] = [];
  const actions: string[] = [];

  if (burden > 0.5) {
    reasons.push("The new EMI would take total monthly debt payments above 50% of the income entered.");
    actions.push("Try a smaller loan or a longer tenure, then compare the extra total interest.");
  } else if (burden > 0.4) {
    reasons.push("Total monthly debt payments would use over 40% of the income entered.");
    actions.push("Check whether a lower loan amount creates more monthly breathing room.");
  } else {
    reasons.push("The illustrative monthly debt burden stays within 40% of the income entered.");
  }
  if (inputs.creditScore === null) {
    reasons.push("No verified credit report was supplied; credit readiness is unknown.");
    actions.push("Check your actual credit report before making a loan decision.");
  } else if (inputs.creditScore < 700) {
    reasons.push("The self-reported credit score is below this demo's 700 review marker.");
    actions.push("Review your credit report and payment history for errors or missed payments.");
  } else {
    reasons.push("The self-reported credit score meets this demo's 700 marker.");
  }
  if (inputs.age < 21 || inputs.age + inputs.tenureMonths / 12 > 65) {
    reasons.push("The age or age at the end of the loan falls outside this demo's 21–65 range.");
    actions.push("Check the actual lender's age and tenure criteria.");
  }
  if (inputs.experienceYears < 1) {
    reasons.push("Less than one year of work history was entered.");
    actions.push("Check the lender's work-history requirements or consider applying later.");
  }
  const blockers = burden > 0.5 || (inputs.creditScore !== null && inputs.creditScore < 650) ||
    inputs.age < 21 || inputs.age + inputs.tenureMonths / 12 > 65;
  const cautions = burden > 0.4 || inputs.creditScore === null ||
    (inputs.creditScore !== null && inputs.creditScore < 700) || inputs.experienceYears < 1;
  const status = blockers ? "Adjust the plan" : cautions ? "Review carefully" : "Looks manageable";
  if (!actions.length) actions.push("Compare offers and read the lender's actual eligibility and fee terms.");
  return { emi, totalRepayment, totalInterest, burden, status, reasons, actions };
}

export function creditBand(score: number | null) {
  if (score === null) return { title: "No score entered", detail: "Enter a score from your own report to see educational context." };
  if (score >= 750) return { title: "Higher range", detail: "Your entered score is in the upper part of the 300–900 scale. A lender also considers other details." };
  if (score >= 700) return { title: "Mid to higher range", detail: "Your entered score meets this demo's review marker, but approval is never guaranteed." };
  if (score >= 650) return { title: "Review range", detail: "Review the underlying report and lender criteria before applying." };
  return { title: "Needs attention", detail: "Check the actual report for errors and focus on repayment habits over time." };
}
