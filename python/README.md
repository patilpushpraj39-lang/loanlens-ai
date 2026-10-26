# Python verification engine

This directory contains a dependency-free Python reference implementation of
the core LoanLens calculations. It provides independent evidence for the EMI,
debt-load, amortization and illustrative readiness logic used by the deployed
web application.

The live Next.js application uses `lib/finance.js`. This Python module is kept
as an auditable verification implementation and is not a fake deployment file.

## Run the demonstration

```bash
cd python
python loan_engine.py
```

## Run the automated tests

```bash
cd python
python -m unittest -v
```

No third-party Python packages are required.
