"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseErrorMessage } from "@/lib/firebase/auth";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function RegisterPage() {
  const { signUp, googleSignIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName]             = useState("");
  const [lastName, setLastName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]                     = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();
      await signUp(displayName, email, password);
      
      // 2. Call our branded verification API
      await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      });

      setIsVerificationSent(true);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsLoading(false);
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
      {/* ── Left panel (decorative) ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <img src="/logo.png" alt="Afra Tech Point" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* Perks list */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Join the<br />
              <span className="text-gray-400">Community.</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Create your free account and get access to exclusive deals, order tracking, and personalized recommendations.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: "Fast Delivery", sub: "Dhaka & nationwide" },
              { title: "100% Secure", sub: "SSL encrypted checkout" },
              { title: "24/7 Support", sub: "Always here to help" },
            ].map(({ title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        <p className="relative z-10 text-gray-600 text-xs">© 2026 Afra Tech Point. All rights reserved.</p>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/"><img src="/logo.png" alt="Afra Tech Point" className="h-8 w-auto object-contain" /></Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {isVerificationSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Check your email</h1>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                We&apos;ve sent a branded verification link to <span className="text-black font-bold">{email}</span>. 
                Please click the link in your inbox to activate your account.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  Go to Login
                </button>
                <p className="text-xs text-gray-400">
                  Didn&apos;t receive it? Check your spam folder or contact support.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
          <div className="mb-7">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Create account</h1>
            <p className="text-gray-400 text-sm">Join Afra Tech Point — it&apos;s free forever</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 p-3.5 mb-5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium overflow-hidden"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes("Google") && (
                  <Link
                    href="/login"
                    className="text-[11px] text-red-700 font-bold hover:underline mt-0.5 text-left pl-6.5"
                  >
                    Go to Login to reset password or use Google →
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google CTA */}
          <button
            onClick={handleGoogle}
            disabled={isGoogleLoading}
            className="w-full h-12 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 disabled:opacity-60 mb-5"
          >
            {isGoogleLoading
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              : <GoogleIcon />
            }
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium shrink-0">or register with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                <input
                  required
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:bg-white outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Terms note */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-gray-700 hover:text-black font-medium underline underline-offset-2">Terms of Service</Link>
              {" "}and{" "}
              <span className="text-gray-700 font-medium">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Create Account"
              }
            </button>
          </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
      </div>
    </div>
  );
}
