"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-black text-gray-200 tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 leading-none">Page Not Found</h2>
          <p className="text-gray-500 text-sm font-medium">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Afra Tech Point · Premium Electronics
          </p>
        </div>
      </div>
    </div>
  );
}
