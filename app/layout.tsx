import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "/loanlens-ai" : "";

export const metadata: Metadata = {
  title: "LoanLens AI | Loan Readiness & EMI Planner",
  description: "Explore illustrative loan readiness, credit context, EMIs, and what-if scenarios in one private planning workspace.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
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
