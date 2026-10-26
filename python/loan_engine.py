"""Independent Python verification engine for LoanLens AI.

This module mirrors the public financial formulas used by the web application.
It is intentionally dependency-free so evaluators can run it with Python 3.
It is a verification/reference implementation; the deployed Next.js interface
continues to use the TypeScript engine in ``lib/finance.ts``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class LoanInputs:
    principal: float
    annual_rate: float
    tenure_months: int
    monthly_income: float
    existing_emi: float = 0.0
    age: int = 25
    work_experience_years: float = 1.0
    credit_score: Optional[int] = None


@dataclass(frozen=True)
class AmortizationRow:
    month: int
    opening_balance: float
    emi: float
    interest: float
    principal_paid: float
    closing_balance: float


@dataclass(frozen=True)
class LoanAnalysis:
    emi: float
    total_interest: float
    total_repayment: float
    debt_load_percent: float
    status: str
    reasons: List[str]


def _require_positive(name: str, value: float) -> None:
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """Return the monthly EMI for a reducing-balance loan."""
    _require_positive("principal", principal)
    _require_positive("tenure_months", tenure_months)
    if annual_rate < 0:
        raise ValueError("annual_rate cannot be negative")

    if annual_rate == 0:
        return principal / tenure_months

    monthly_rate = annual_rate / 1200
    growth = (1 + monthly_rate) ** tenure_months
    return principal * monthly_rate * growth / (growth - 1)


def calculate_debt_load(
    monthly_income: float,
    proposed_emi: float,
    existing_emi: float = 0.0,
) -> float:
    """Return total monthly debt as a percentage of monthly income."""
    _require_positive("monthly_income", monthly_income)
    if proposed_emi < 0 or existing_emi < 0:
        raise ValueError("EMI values cannot be negative")
    return ((proposed_emi + existing_emi) / monthly_income) * 100


def build_amortization_schedule(
    principal: float,
    annual_rate: float,
    tenure_months: int,
) -> List[AmortizationRow]:
    """Build a month-by-month repayment schedule."""
    emi = calculate_emi(principal, annual_rate, tenure_months)
    monthly_rate = annual_rate / 1200
    balance = principal
    schedule: List[AmortizationRow] = []

    for month in range(1, tenure_months + 1):
        opening = balance
        interest = opening * monthly_rate
        principal_paid = emi - interest

        # Remove the small floating-point remainder in the final month.
        if month == tenure_months:
            principal_paid = opening
            payment = principal_paid + interest
            balance = 0.0
        else:
            payment = emi
            balance = max(0.0, opening - principal_paid)

        schedule.append(
            AmortizationRow(
                month=month,
                opening_balance=round(opening, 2),
                emi=round(payment, 2),
                interest=round(interest, 2),
                principal_paid=round(principal_paid, 2),
                closing_balance=round(balance, 2),
            )
        )

    return schedule


def analyze_loan(inputs: LoanInputs) -> LoanAnalysis:
    """Calculate figures and apply transparent educational readiness rules."""
    if inputs.age < 18 or inputs.age > 70:
        raise ValueError("age must be between 18 and 70")
    if inputs.work_experience_years < 0:
        raise ValueError("work_experience_years cannot be negative")
    if inputs.credit_score is not None and not 300 <= inputs.credit_score <= 900:
        raise ValueError("credit_score must be between 300 and 900")

    emi = calculate_emi(
        inputs.principal,
        inputs.annual_rate,
        inputs.tenure_months,
    )
    debt_load = calculate_debt_load(
        inputs.monthly_income,
        emi,
        inputs.existing_emi,
    )
    total_repayment = emi * inputs.tenure_months
    total_interest = total_repayment - inputs.principal
    age_at_maturity = inputs.age + inputs.tenure_months / 12

    reasons: List[str] = []
    status = "Ready to explore"

    if debt_load > 50:
        status = "High monthly burden"
        reasons.append("Total monthly debt is above 50% of the entered income.")
    elif debt_load > 40:
        status = "Review carefully"
        reasons.append("Total monthly debt is above 40% of the entered income.")
    else:
        reasons.append("Total monthly debt is within the illustrative 40% marker.")

    if age_at_maturity > 65:
        status = "Review carefully"
        reasons.append("The illustrative age at loan maturity is above 65.")

    if inputs.work_experience_years < 1:
        status = "Review carefully"
        reasons.append("The entered work history is below one year.")

    if inputs.credit_score is not None:
        if inputs.credit_score < 700:
            status = "Review carefully"
            reasons.append("The user-provided score is below the illustrative 700 marker.")
        else:
            reasons.append("The user-provided score is at or above 700.")

    return LoanAnalysis(
        emi=round(emi, 2),
        total_interest=round(total_interest, 2),
        total_repayment=round(total_repayment, 2),
        debt_load_percent=round(debt_load, 2),
        status=status,
        reasons=reasons,
    )


if __name__ == "__main__":
    sample = LoanInputs(
        principal=500_000,
        annual_rate=12,
        tenure_months=36,
        monthly_income=75_000,
        existing_emi=5_000,
        age=28,
        work_experience_years=3,
        credit_score=742,
    )
    result = analyze_loan(sample)
    print(f"Monthly EMI: INR {result.emi:,.2f}")
    print(f"Debt load: {result.debt_load_percent:.2f}%")
    print(f"Status: {result.status}")
    for reason in result.reasons:
        print(f"- {reason}")
