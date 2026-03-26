"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getFirebaseErrorMessage } from "@/lib/firebase/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid verification link. Please request a new one.");
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus("success");
      } catch (err: any) {
        setError(getFirebaseErrorMessage(err.code));
        setStatus("error");
      }
    };

    verify();
  }, [oobCode]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Verifying your account</h2>
        <p className="text-gray-500 font-medium">Please wait while we activate your Afra Tech Point account...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0.5, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 max-w-sm mx-auto"
      >
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Email Verified!</h2>
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          Your account is now fully active. Welcome to the premium electronics shopping experience.
        </p>
        <Link 
          href="/login"
          className="group w-full h-12 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-95 transition-all"
        >
          Continue to Login
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0.5, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-8 max-w-sm mx-auto"
    >
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Activation Failed</h2>
      <p className="text-gray-500 mb-6 font-medium leading-relaxed">
        {error || "The verification link is invalid or has already been used."}
      </p>
      <div className="space-y-3">
        <Link 
          href="/register"
          className="w-full h-12 border border-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
        >
          Try Registering Again
        </Link>
        <Link 
          href="/login"
          className="w-full h-12 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all"
        >
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Premium Header */}
      <header className="p-8 flex justify-center border-b border-gray-50">
        <Link href="/">
          <img src="/logo.png" alt="Afra Tech Point" className="h-10 w-auto" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 pb-24 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        
        <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-black" />}>
          <VerifyEmailContent />
        </Suspense>
      </main>

      {/* Footer Branding */}
      <footer className="p-8 text-center text-gray-300 text-[10px] font-bold tracking-widest uppercase">
        © 2026 Afra Tech Point • Secure Account Activation
      </footer>
    </div>
  );
}
