"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, sendPasswordReset } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ShieldCheck, Mail, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import SigmaFooter from "@/components/SigmaFooter";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && document.cookie.includes("session=")) {
        router.replace("/app");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground showRadialGradient={true}>
      {/* Top Header */}
      <header className="w-full border-b border-white/10 bg-[#050816]/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#22D3EE] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-[#3B82F6]/20">
            Σ
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl leading-none text-white tracking-tight">SigmaIQ</span>
            <span className="text-[10px] text-[#22D3EE] font-mono tracking-widest uppercase">TOKEN-DIET</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 bg-[rgba(8,12,24,0.72)] border border-white/10 hover:border-[#3B82F6] text-xs font-semibold text-white rounded-lg transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Password Reset Area */}
      <main className="max-w-md mx-auto px-6 py-16 flex-1 w-full flex flex-col justify-center relative z-10">
        <div className="bg-[rgba(8,12,24,0.72)] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] p-8 space-y-6 backdrop-blur-[18px]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto text-[#3B82F6]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset your password</h1>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Enter the email associated with your SigmaIQ account and we'll send you a secure password-reset link.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-xl text-xs space-y-3">
              <div className="font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> Check your inbox
              </div>
              <p className="leading-relaxed text-[#F8FAFC]">
                If an account exists for <strong className="text-white">{email}</strong>, a password-reset link has been sent.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#22D3EE] font-bold hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs flex items-center gap-2 text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-[#F8FAFC]">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    placeholder="engineer@sigmaiq.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <SigmaFooter />
    </AuroraBackground>
  );
}
