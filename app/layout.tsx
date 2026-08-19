import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SigmaIQ | Enterprise Engineering Platform",
  description:
    "SigmaIQ is an intelligent engineering platform featuring Token-Diet quality-constrained context optimization and explainable cross-source incident correlation.",
  keywords: [
    "SigmaIQ",
    "Token-Diet",
    "Dynamic Context Optimizer",
    "RAG Optimization",
    "Alert Fatigue Reducer",
    "Incident Correlation",
    "Safety Gate",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#0F172A] min-h-screen font-sans antialiased selection:bg-[#2563EB]/20">
        {children}
      </body>
    </html>
  );
}
