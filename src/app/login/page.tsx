"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithToken, getFirebaseErrorMessage } from "@/lib/firebase/auth";
import PremiumSpinner from "@/components/PremiumSpinner";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { user, loading, googleSignIn } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/account");
    }
  }, [user, loading, router]);

  // Form states
  const [step, setStep]                       = useState<"form" | "otp">("form");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]                     = useState("");
  const [successMsg, setSuccessMsg]           = useState("");
  const [resetStatus, setResetStatus]         = useState<"idle" | "loading" | "sent">("idle");
  const [isForgotMode, setIsForgotMode]       = useState(false);

  // OTP states
  const [otp, setOtp]                         = useState<string[]>(["", "", "", "", "", ""]);
  const [isResending, setIsResending]         = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs                             = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCountdown]);

  // Step 1: Submit Credentials & Send OTP
  const handleInitiateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          type: "login",
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      setStep("otp");
      setResendCountdown(60);
      setSuccessMsg(`A 6-digit verification code has been sent to ${email}.`);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode,
          type: "login",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
        return;
      }

      if (data.customToken) {
        await signInWithToken(data.customToken);
        router.push("/");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setError("");
    setSuccessMsg("");
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          type: "login",
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }

      setResendCountdown(60);
      setSuccessMsg("A new verification code has been dispatched to your email.");
    } catch (err: any) {
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Handle individual OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split("");
      const next = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setOtp(next);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = clean;
    setOtp(next);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = [...otp];
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setOtp(next);
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResetPassword = async () => {
    if (!email) { 
      setError("Please enter your email address first."); 
      return; 
    }
    setResetStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetStatus("sent");
        setIsForgotMode(false);
      } else {
        setError(data.error || "Failed to send reset email.");
        setResetStatus("idle");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setResetStatus("idle");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await googleSignIn();
      router.push("/");
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (Hero / Branding) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} 
        />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <Link href="/">
            <img src="/logo.png" alt="Afra Tech Point" className="h-12 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
            Premium Tech,<br />
            <span className="text-gray-400">Delivered Fast.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs">
            Sign in securely with email OTP verification to track orders, manage your profile, and shop genuine products.
          </p>
          <div className="flex gap-6 pt-2">
            {[["10K+", "Happy Customers"], ["500+", "Products"], ["100%", "Secure Auth"]].map(([num, label]) => (
              <div key={label}>
                <p className="text-white font-black text-xl">{num}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-gray-600 text-xs">
          © 2026 Afra Tech Point. All rights reserved.
        </p>
      </div>

      {/* ── Right panel (Form / OTP) ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
        <div className="lg:hidden mb-10">
          <Link href="/">
            <img src="/logo.png" alt="Afra Tech Point" className="h-14 w-auto object-contain" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {step === "otp" ? (
            /* ══════════════════════════════════════════════════════════════ */
            /* ── STEP 2: OTP VERIFICATION SCREEN ────────────────────────── */
            /* ══════════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => { setStep("form"); setError(""); setSuccessMsg(""); }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-6 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to email and password
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-200">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Two-Step Verification</h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                  For your security, we&apos;ve sent a 6-digit login verification code to <span className="font-bold text-gray-900">{email}</span>.
                </p>
              </div>

              {/* Error / Success Notifications */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium overflow-hidden"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {successMsg && !error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 p-3.5 mb-5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium overflow-hidden"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-black focus:bg-white focus:outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full h-12 bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-gray-200"
                >
                  {isLoading ? (
                    <PremiumSpinner size="sm" light />
                  ) : (
                    <>
                      <span>Verify & Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Resend Action */}
                <div className="text-center pt-2">
                  {resendCountdown > 0 ? (
                    <p className="text-xs text-gray-400 font-medium">
                      Resend code in <span className="font-bold text-gray-700">{resendCountdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:underline disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isResending ? "animate-spin" : ""} />
                      {isResending ? "Sending..." : "Didn't receive the code? Resend"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          ) : (
            /* ══════════════════════════════════════════════════════════════ */
            /* ── STEP 1: INITIAL LOGIN FORM ─────────────────────────────── */
            /* ══════════════════════════════════════════════════════════════ */
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                  {isForgotMode ? "Reset Password" : "Welcome back"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {isForgotMode ? "Enter your email to receive a reset link" : "Sign in to your Afra Tech Point account"}
                </p>
              </div>

              {/* Status & Error alerts */}
              <AnimatePresence>
                {(error || resetStatus === "sent") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "flex flex-col gap-2 p-3.5 mb-5 border rounded-xl text-sm font-medium overflow-hidden",
                      resetStatus === "sent" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-600"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {resetStatus === "sent" ? (
                        <CheckCircle2 size={16} className="shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="shrink-0" />
                      )}
                      <span>{resetStatus === "sent" ? "Password reset email sent!" : error}</span>
                    </div>
                    {resetStatus === "sent" && (
                      <p className="text-[11px] font-bold opacity-80 pl-6.5">
                        Please check your inbox (and spam) to reset your password.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isForgotMode && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={isGoogleLoading}
                    className="w-full h-12 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 disabled:opacity-60 mb-5"
                  >
                    {isGoogleLoading ? <PremiumSpinner size="sm" /> : <GoogleIcon />}
                    Continue with Google
                  </button>

                  <div className="relative flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium shrink-0">or sign in with email</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                </>
              )}

              <form 
                onSubmit={isForgotMode ? (e) => { e.preventDefault(); handleResetPassword(); } : handleInitiateLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {!isForgotMode ? (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        <button
                          type="button"
                          onClick={() => { setIsForgotMode(true); setError(""); }}
                          className="text-xs text-gray-500 hover:text-black font-medium transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-11 pl-10 pr-11 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {isLoading ? (
                        <PremiumSpinner size="sm" light />
                      ) : (
                        <>
                          <span>Continue & Send OTP</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={resetStatus === "loading"}
                      className="w-full h-11 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {resetStatus === "loading" ? (
                        <PremiumSpinner size="sm" light />
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <Mail size={16} />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="w-full text-center text-xs text-gray-500 hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-black font-semibold hover:underline underline-offset-4">
                  Create one free
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
