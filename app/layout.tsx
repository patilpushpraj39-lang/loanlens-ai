import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoanLens AI | Loan Readiness & EMI Planner",
  description: "Explore illustrative loan readiness, credit context, EMIs, and what-if scenarios in one private planning workspace.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
