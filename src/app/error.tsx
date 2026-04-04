'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110">
            <AlertTriangle size={36} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Something went wrong!</h1>
          <p className="text-gray-500 text-sm font-medium">
            We apologize for the inconvenience. Our technical team has been notified. 
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>

        <div className="pt-8 border-t border-gray-200">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            Error ID: {error.digest || 'unknown'}
          </p>
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-1">
            Afra Tech Point · High Performance E-Commerce
          </p>
        </div>
      </div>
    </div>
  );
}
