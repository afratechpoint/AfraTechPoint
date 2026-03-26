"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { verifyResetCode, confirmNewPassword, getFirebaseErrorMessage } from "@/lib/firebase/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"verifying" | "idle" | "loading" | "success" | "error">("verifying");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or expired reset link. Please request a new one.");
      setStatus("error");
      return;
    }

    const verifyCode = async () => {
      try {
        const email = await verifyResetCode(oobCode);
        setUserEmail(email);
        setStatus("idle");
      } catch (err: any) {
        setError(getFirebaseErrorMessage(err.code));
        setStatus("error");
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await confirmNewPassword(oobCode!, password);
      setStatus("success");
      // Auto-redirect after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
      setStatus("loading"); // keep showing form but with error
      setStatus("idle");
    }
  };

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying your security code...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Password Updated!</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Your password has been changed successfully. You can now log in with your new password.
        </p>
        <Link 
          href="/login"
          className="inline-flex items-center justify-center h-11 px-8 bg-black text-white rounded-xl font-bold text-sm transition-transform active:scale-95"
        >
          Go to Login
        </Link>
        <p className="text-[10px] text-gray-400 mt-6 italic">Redirecting you in a few seconds...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Set New Password</h1>
        <p className="text-gray-400 text-sm">
          Resetting password for <span className="text-gray-900 font-semibold">{userEmail}</span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "error" ? (
        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 w-full h-11 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-11 bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Decorative Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 font-bold text-white text-xl">Afra Tech Point</div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">Secure your account with a fresh start.</h2>
          <p className="text-gray-500 max-w-xs">We use military-grade encryption to ensure your new password is safe and secure.</p>
        </div>
        <div className="text-gray-600 text-xs">© 2026 Afra Tech Point. All rights reserved.</div>
      </div>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="lg:hidden mb-8">
          <Link href="/"><img src="/logo.png" alt="Afra Tech Point" className="h-8 w-auto" /></Link>
        </div>
        <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
