# LoanLens AI code guide

This guide points evaluators to the main source files and explains what each
part does. The project contains working application code, deterministic
financial logic, optional server routes, documentation and independent tests.

## Main implementation

| Path                                                            | Responsibility                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| [`app/page.jsx`](../app/page.jsx)                               | Main financial-planning workspace and user interactions      |
| [`lib/finance.js`](../lib/finance.js)                           | EMI, amortization, debt-load, validation and readiness logic |
| [`components/`](../components)                                  | Reusable interface components                                |
| [`app/api/insights/route.js`](../app/api/insights/route.js)     | Optional Claude explanation endpoint                         |
| [`app/api/sheet-sync/route.js`](../app/api/sheet-sync/route.js) | Optional Google Sheets export endpoint                       |
| [`app/api/status/route.js`](../app/api/status/route.js)         | Integration availability endpoint                            |
| [`lib/sheets.js`](../lib/sheets.js)                             | Google Sheets integration helper                             |

## Independent Python verification

| Path                                                          | Responsibility                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| [`python/loan_engine.py`](../python/loan_engine.py)           | Python reference implementation of the financial calculations   |
| [`python/test_loan_engine.py`](../python/test_loan_engine.py) | Automated tests for EMI, debt load, validation and amortization |
| [`python/README.md`](../python/README.md)                     | Commands for running the Python code and tests                  |

## How to run the web application

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How to verify the Python calculations

```bash
cd python
python loan_engine.py
python -m unittest -v
```

The Python implementation is deliberately dependency-free. It independently
checks the same published financial formulas while the deployed application
continues to use the JavaScript engine.

## Important technical note

JavaScript and JSX are the main application languages because LoanLens is built
with Next.js and React. Python is used for independent calculation verification.
C++ is not included because it has no genuine role in this web architecture.
