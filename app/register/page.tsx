"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithEmailPassword, checkUserEmailVerified, resendVerificationEmail } from "@/lib/firebase";
import { ShieldCheck, AlertCircle, Loader2, Mail, Lock, User as UserIcon, CheckCircle2, Eye, EyeOff, RefreshCw } from "lucide-react";
import SigmaFooter from "@/components/SigmaFooter";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registeredPendingVerification, setRegisteredPendingVerification] = useState(false);
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  // Password strength assessment
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { score: 0, label: "None", color: "bg-[#243043]" };
    if (pass.length < 8) return { score: 1, label: "Weak (Min 8 chars)", color: "bg-[#EF4444]" };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasDigits = /\d/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 10 && hasLetters && hasDigits && hasSpecial) {
      return { score: 3, label: "Strong", color: "bg-[#22C55E]" };
    }
    if (pass.length >= 8 && (hasLetters && hasDigits)) {
      return { score: 2, label: "Medium", color: "bg-[#F59E0B]" };
    }
    return { score: 1, label: "Weak", color: "bg-[#EF4444]" };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match. Please verify your entry.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailPassword(email.trim(), password, name.trim());
      setRegisteredPendingVerification(true);
    } catch (err: any) {
      console.error("Registration Error:", err);
      setAuthError(err.message || "Failed to create account. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    const isVerified = await checkUserEmailVerified();
    if (isVerified) {
      router.replace("/app");
    } else {
      setResentNotice("Verification email is not confirmed yet. Please check your inbox and click the verification link.");
    }
  };

  const handleResendEmail = async () => {
    setResentNotice(null);
    try {
      await resendVerificationEmail();
      setResentNotice("A new verification link has been sent to your email address.");
    } catch (e: any) {
      setResentNotice("Resend failed: " + e.message);
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
            className="px-4 py-2 bg-[rgba(8,12,24,0.72)] border border-white/10 hover:border-[#3B82F6] text-xs font-semibold text-white rounded-lg backdrop-blur-md transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Area */}
      <main className="max-w-xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center relative z-10">
        <div className="bg-[rgba(8,12,24,0.72)] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] p-8 space-y-6 backdrop-blur-[18px]">
          {registeredPendingVerification ? (
            /* Email Verification Needed Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-14 h-14 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Verify your email address</h2>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                  We sent a secure verification link to <strong className="text-white">{email}</strong>. Please check your inbox and confirm your email.
                </p>
              </div>

              {resentNotice && (
                <div className="p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#22D3EE] rounded-xl text-xs font-semibold">
                  {resentNotice}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckVerification}
                  className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> I've Verified My Email
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleResendEmail}
                    className="flex-1 py-2.5 px-3 bg-[#050816] border border-white/10 hover:border-[#3B82F6] text-xs font-semibold text-white rounded-xl transition-all"
                  >
                    Resend Verification Email
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 py-2.5 px-3 bg-[#050816] border border-white/10 hover:border-[#3B82F6] text-xs font-semibold text-center text-[#94A3B8] hover:text-white rounded-xl transition-all"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <>
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto text-[#3B82F6]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your SigmaIQ Account</h1>
                <p className="text-xs text-[#94A3B8]">
                  Register for quality-constrained RAG dynamic context optimization.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs space-y-1 text-[#EF4444]">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Registration Error
                  </div>
                  <p>{authError}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#F8FAFC]">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#F8FAFC]">Email Address</label>
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

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#F8FAFC]">Password (Min 8 Chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#94A3B8]">
                        <span>Password Strength</span>
                        <span className="font-bold text-white">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#050816] rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : "bg-[#243043]"}`} />
                        <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : "bg-[#243043]"}`} />
                        <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : "bg-[#243043]"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#F8FAFC]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-all"
                    />
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <div className="text-[10px] text-[#EF4444] font-semibold">Passwords do not match</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <span>Create Account & Send Verification</span>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-[#94A3B8]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#22D3EE] font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <SigmaFooter />
    </AuroraBackground>
  );
}
