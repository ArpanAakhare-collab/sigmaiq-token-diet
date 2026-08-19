"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, signInWithGoogle, checkRedirectAuth, loginWithEmailPassword } from "@/lib/firebase";
import { isFirebaseConfigured } from "@/lib/config";
import { onAuthStateChanged } from "firebase/auth";
import { Cpu, AlertCircle, Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import SigmaFooter from "@/components/SigmaFooter";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const firebaseIsReady = isFirebaseConfigured();

  useEffect(() => {
    // 1. Complete redirect-based Google OAuth if returning from redirect
    checkRedirectAuth().then((user) => {
      if (user) {
        router.replace("/app");
      }
    });

    // 2. Listen for authenticated user session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && document.cookie.includes("session=")) {
        router.replace("/app");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/app");
    } catch (err: any) {
      console.error("Google Authentication Error:", err);
      setAuthError(err.message || "Google sign-in was cancelled.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError("Invalid email or password.");
      return;
    }

    setLoading(true);
    try {
      await loginWithEmailPassword(email.trim(), password);
      router.replace("/app");
    } catch (err: any) {
      console.error("Email Login Error:", err);
      setAuthError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground showRadialGradient={true}>
      {/* Top Header Navigation */}
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
            href="/register"
            className="px-4 py-2 bg-[rgba(8,12,24,0.72)] border border-white/10 hover:border-[#3B82F6] text-xs font-semibold text-white rounded-lg backdrop-blur-md transition-all shadow-sm"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Split-Panel Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        {/* LEFT COLUMN: Premium Translucent Glass Card (Section 8 Spec) */}
        <div className="w-full lg:max-w-md bg-[rgba(8,12,24,0.72)] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] p-8 space-y-6 backdrop-blur-[18px] relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3B82F6]/10 text-[#22D3EE] text-xs font-semibold rounded-full border border-[#22D3EE]/20">
              <Cpu className="w-3.5 h-3.5" /> Authentication Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back to SigmaIQ</h1>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Quality-Constrained Dynamic Context Optimization for RAG.
            </p>
          </div>

          {!firebaseIsReady && (
            <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs space-y-1 text-[#EF4444]">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> Configuration Error
              </div>
              <p>Firebase authentication configuration missing in environment variables.</p>
            </div>
          )}

          {authError && (
            <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-xs space-y-1 text-[#EF4444]">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> Authentication Error
              </div>
              <p>{authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#F8FAFC]">Email Address</label>
              <div className="relative group">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="engineer@sigmaiq.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#F8FAFC]">Password</label>
                <Link href="/forgot-password" className="text-[#22D3EE] hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#3B82F6] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#050816]/90 border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono text-[#94A3B8] uppercase">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 bg-[#080C18]/90 border border-white/10 hover:border-[#3B82F6] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-[#94A3B8]">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#22D3EE] font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: RAG Architecture Card */}
        <div className="flex-1 w-full hidden lg:flex flex-col justify-center space-y-8 pl-6">
          <div className="p-8 bg-[rgba(8,12,24,0.72)] border border-white/10 rounded-2xl relative overflow-hidden backdrop-blur-[18px] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-[#22D3EE] uppercase tracking-widest font-bold">
                RAG Context Optimization Architecture
              </span>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#22D3EE] border border-[#3B82F6]/20 px-2.5 py-0.5 rounded font-mono">
                Quality Floor &ge; 0.90
              </span>
            </div>

            {/* Nodes */}
            <div className="space-y-3.5">
              <div className="p-3 bg-[#050816]/80 border border-[#3B82F6]/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-mono font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-white">Retrieved Evidence</div>
                    <div className="text-[10px] text-[#94A3B8]">Raw document chunks & similarity scores</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#3B82F6]">Retrieval</span>
              </div>

              <div className="p-3 bg-[#050816]/80 border border-[#22D3EE]/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center font-mono font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-white">Token-Diet Optimization</div>
                    <div className="text-[10px] text-[#94A3B8]">Prunes redundant tokens & evaluates minimum evidence</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#22D3EE]">Optimizer</span>
              </div>

              <div className="p-3 bg-[#050816]/80 border border-[#6366F1]/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-mono font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-white">Quality Evaluation & Dynamic Relaxation</div>
                    <div className="text-[10px] text-[#94A3B8]">Iterative evidence restoration if quality &lt; floor</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#6366F1]">Quality</span>
              </div>

              <div className="p-3 bg-[#050816]/80 border border-[#22C55E]/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-mono font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-semibold text-white">Optimal LLM Answer</div>
                    <div className="text-[10px] text-[#94A3B8]">High accuracy output with 68.4% lower token cost</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#22C55E]">Verified</span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                <div className="text-[10px] text-[#94A3B8] uppercase">Token Savings</div>
                <div className="text-xl font-extrabold text-[#22C55E]">68.4% Avg</div>
              </div>
              <div className="p-3 bg-[#050816]/80 rounded-xl border border-white/10">
                <div className="text-[10px] text-[#94A3B8] uppercase">Quality Compliance</div>
                <div className="text-xl font-extrabold text-[#3B82F6]">100.0%</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <SigmaFooter />
    </AuroraBackground>
  );
}
