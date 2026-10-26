"""Unit tests for the independent LoanLens Python verification engine."""

import unittest

from loan_engine import (
    LoanInputs,
    analyze_loan,
    build_amortization_schedule,
    calculate_debt_load,
    calculate_emi,
)


class LoanEngineTests(unittest.TestCase):
    def test_standard_emi_fixture(self):
        emi = calculate_emi(500_000, 12, 36)
        self.assertAlmostEqual(emi, 16_607.15, places=2)

    def test_zero_interest_emi(self):
        self.assertAlmostEqual(calculate_emi(120_000, 0, 12), 10_000.00)

    def test_debt_load(self):
        result = calculate_debt_load(80_000, 20_000, 4_000)
        self.assertAlmostEqual(result, 30.0)

    def test_invalid_principal_is_rejected(self):
        with self.assertRaises(ValueError):
            calculate_emi(0, 10, 12)

    def test_invalid_credit_score_is_rejected(self):
        with self.assertRaises(ValueError):
            analyze_loan(
                LoanInputs(
                    principal=500_000,
                    annual_rate=10,
                    tenure_months=36,
                    monthly_income=80_000,
                    credit_score=950,
                )
            )

    def test_high_debt_load_changes_status(self):
        result = analyze_loan(
            LoanInputs(
                principal=1_500_000,
                annual_rate=14,
                tenure_months=36,
                monthly_income=45_000,
                existing_emi=8_000,
                age=30,
                work_experience_years=4,
            )
        )
        self.assertEqual(result.status, "High monthly burden")
        self.assertGreater(result.debt_load_percent, 50)

    def test_amortization_ends_at_zero(self):
        schedule = build_amortization_schedule(500_000, 12, 36)
        self.assertEqual(len(schedule), 36)
        self.assertEqual(schedule[-1].closing_balance, 0.0)
        self.assertAlmostEqual(
            sum(row.principal_paid for row in schedule),
            500_000,
            delta=0.10,
        )


if __name__ == "__main__":
    unittest.main()
