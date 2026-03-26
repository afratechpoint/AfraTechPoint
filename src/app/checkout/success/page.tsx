"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Package, ArrowRight } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
  id: string;
  total?: number;
  totalAmount?: number;
  paymentStatus?: string;
  payment?: { method?: string; transactionId?: string; senderNumber?: string; };
  paymentDetails?: { method?: string; transactionId?: string; senderNumber?: string; };
  items: OrderItem[];
}

function CheckoutSuccessContent() {
  const params   = useSearchParams();
  const orderId  = params.get("orderId") ?? "";
  const settings = useSettings() as any;
  const currency = settings?.currencySymbol ?? "৳";

  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    fetch(`/api/orders/${orderId}`)
      .then(async r => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  // Get values handling both legacy and new field names
  const trxId  = order?.payment?.transactionId  ?? order?.paymentDetails?.transactionId  ?? "—";
  const pmtMethod = order?.payment?.method      ?? order?.paymentDetails?.method         ?? "—";
  const total  = order?.totalAmount ?? order?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-[2rem] border border-gray-100 shadow-xl w-full max-w-md p-6 my-auto">

        {/* Icon */}
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-green-600" />
        </div>
        <h1 className="text-xl font-black text-gray-900 text-center mb-1">Order Placed!</h1>
        <p className="text-gray-400 text-xs text-center mb-4">Thank you. We'll verify your payment shortly.</p>

        {/* Order ID */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-sm font-black text-gray-900 font-mono">#{orderId.slice(0, 12).toUpperCase()}</p>
        </div>

        {/* Verification notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2.5">
            <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 text-xs font-bold mb-1">Payment Verification Pending</p>
              <p className="text-amber-600 text-[11px] leading-snug">
                We'll confirm your order within <strong>30 minutes</strong> after verifying your {pmtMethod} transaction.
                Keep your TrxID <span className="font-mono font-bold">{trxId}</span> safe.
              </p>
            </div>
          </div>
        </div>

        {/* Items & total */}
        {order && order.items?.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate flex-1">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                <span className="font-bold text-gray-900 ml-2 shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-gray-900 text-sm pt-2 border-t border-gray-100 mt-2">
              <span>Total</span><span>{currency}{Number(total).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link href="/account?tab=orders"
            className="w-full h-10 bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors">
            <Package size={14} /> View My Orders <ArrowRight size={14} />
          </Link>
          <Link href="/shop"
            className="w-full h-10 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold text-xs flex items-center justify-center hover:bg-gray-100 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
