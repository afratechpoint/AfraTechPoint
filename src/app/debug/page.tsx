"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity, Layers, Server, Globe } from "lucide-react";

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/debug");
      if (!resp.ok) throw new Error("Failed to fetch diagnostic data");
      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              System Connectivity Check
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Diagnostic Mode (Temporary Tool)</p>
          </div>
          <button 
            onClick={runDiagnostic}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Re-run Diagnostic
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-bold">Error loading diagnostics</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-24" />
            ))}
          </div>
        ) : data && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <Globe className="text-gray-400 w-5 h-5" />
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Environment</span>
                    <p className="font-bold">{data.env || "unknown"}</p>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <Activity className="text-gray-400 w-5 h-5" />
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Timestamp</span>
                    <p className="font-bold">{new Date().toLocaleTimeString()}</p>
                  </div>
               </div>
            </div>

            {data.results.map((res: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      res.status === 'success' ? 'bg-green-50 text-green-600' : 
                      res.status === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {res.status === 'success' ? <CheckCircle className="w-6 h-6" /> : 
                       res.status === 'warning' ? <AlertTriangle className="w-6 h-6" /> : 
                       <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{res.name}</h3>
                      <p className={`text-sm mt-1 break-all ${
                        res.status === 'success' ? 'text-gray-600' : 
                        res.status === 'warning' ? 'text-yellow-700' :
                        'text-red-600'
                      }`}>
                        {res.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-gray-100 text-gray-500">
                    {res.status}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-sm">
              <p className="font-bold mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Wait, my website is still showing no products?
              </p>
              <p>
                If <strong>Firestore Connectivity</strong> shows a <strong>WARNING</strong> or <strong>QUOTA EXCEEDED</strong>, 
                this means your Firebase free tier limit has been hit. The website will automatically use local 
                fallback files in the <code>data/</code> folder until your quota resets.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
