"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseErrorMessage } from "@/lib/firebase/auth";
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
  const { user, loading, signIn, googleSignIn } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/account");
    }
  }, [user, loading, router]);

  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]                     = useState("");
  const [resetStatus, setResetStatus]         = useState<"idle" | "loading" | "sent">("idle");
  const [isForgotMode, setIsForgotMode]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { setError("Please enter your email address first."); return; }
    setResetStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
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
            Sign in to track your orders, manage your profile, and enjoy exclusive member offers.
          </p>
          <div className="flex gap-6 pt-2">
            {[["10K+", "Happy Customers"], ["500+", "Products"], ["99%", "Satisfaction"]].map(([num, label]) => (
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

      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
        <div className="lg:hidden mb-12">
          <Link href="/"><img src="/logo.png" alt="Afra Tech Point" className="h-16 w-auto object-contain" /></Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
              {isForgotMode ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isForgotMode ? "Enter your email to receive a reset link" : "Sign in to your Afra Tech Point account"}
            </p>
          </div>

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
                    Please check your inbox (and spam) to set your manual password.
                  </p>
                )}
                {error.includes("Google") && !isForgotMode && resetStatus === "idle" && (
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-[11px] text-red-700 font-bold hover:underline mt-0.5 text-left pl-6.5 decoration-red-300"
                  >
                    Set a manual password for this email →
                  </button>
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
                {isGoogleLoading
                  ? <PremiumSpinner size="sm" />
                  : <GoogleIcon />
                }
                Continue with Google
              </button>

              <div className="relative flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium shrink-0">or sign in with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          <form onSubmit={isForgotMode ? (e) => { e.preventDefault(); handleResetPassword(); } : handleSubmit} className="space-y-4">
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
                  {isLoading
                    ? <PremiumSpinner size="sm" light />
                    : <><span>Sign In</span><ArrowRight size={16} /></>
                  }
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={resetStatus === "loading"}
                  className="w-full h-11 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {resetStatus === "loading"
                    ? <PremiumSpinner size="sm" light />
                    : <><span>Send Reset Link</span><Mail size={16} /></>
                  }
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
        </motion.div>
      </div>
    </div>
  );
}
