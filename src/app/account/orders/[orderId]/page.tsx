"use client";
// app/account/orders/[orderId]/page.tsx
// Full order detail for logged-in users — fetches from /api/orders/[id] (JSON DB).

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Package, MapPin, Receipt, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/components/SettingsProvider";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  createdAt: string;
  total?: number;
  totalAmount?: number;
  paymentStatus?: string;
  orderStatus?: string;
  status?: string;
  payment?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string; };
  paymentDetails?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string; };
  shippingAddress?: { fullName?: string; phone?: string; address?: string; city?: string; postalCode?: string; };
  customer?: { name?: string; phone?: string; address?: string; city?: string; email?: string; };
  userEmail?: string;
  items: { name: string; price: number; quantity: number; image?: string; variantName?: string }[];
}

const PMT_BADGE: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-green-50 text-green-600 border-green-200",
  failed:    "bg-red-50 text-red-500 border-red-200",
};
const ORD_BADGE: Record<string, string> = {
  pending:    "bg-gray-50 text-gray-600 border-gray-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped:    "bg-purple-50 text-purple-600 border-purple-200",
  delivered:  "bg-green-50 text-green-600 border-green-200",
  cancelled:  "bg-red-50 text-red-500 border-red-200",
};

export default function UserOrderDetailPage() {
  const { orderId }       = useParams() as { orderId: string };
  const { user, loading } = useAuth();
  const router            = useRouter();
  const settings          = useSettings() as any;
  const currency          = settings?.currencySymbol ?? "৳";

  const [order, setOrder]     = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then(async r => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => {
        setOrder(data);
        setFetching(false);
      })
      .catch(() => {
        setOrder(null);
        setFetching(false);
      });
  }, [orderId]);

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (!order || !order.id) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400 font-bold">Order not found.</p>
      <Link href="/account?tab=orders" className="text-sm text-black font-bold underline">Back to My Orders</Link>
    </div>
  );

  // Normalise across old/new field names
  const payStatus = order.paymentStatus ?? "pending";
  const ordStatus = order.orderStatus   ?? order.status?.toLowerCase() ?? "pending";
  const total     = order.totalAmount   ?? order.total ?? 0;
  const pmt       = order.payment       ?? order.paymentDetails        ?? {};
  const addr      = order.shippingAddress;
  const cust      = order.customer;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> My Orders
          </Link>
          <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 12).toUpperCase()}</span>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Payment", badge: <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border", PMT_BADGE[payStatus] ?? "bg-gray-50 text-gray-500 border-gray-200")}>
              {payStatus === "pending" && <Clock size={9} />}{payStatus === "confirmed" && <CheckCircle2 size={9} />}{payStatus === "failed" && <XCircle size={9} />}
              {payStatus}
            </span> },
            { label: "Order", badge: <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border", ORD_BADGE[ordStatus] ?? "bg-gray-50 text-gray-500 border-gray-200")}>
              <Package size={9} />{ordStatus.charAt(0).toUpperCase() + ordStatus.slice(1)}
            </span> },
          ].map(({ label, badge }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
              {badge}
            </div>
          ))}
        </div>

        {/* Pending banner */}
        {payStatus === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm leading-relaxed">
              <strong>Waiting for payment verification.</strong> This usually takes a few minutes to an hour.
              Keep TrxID <span className="font-mono font-bold">{pmt.transactionId ?? "—"}</span> safe.
            </p>
          </div>
        )}

        {/* Payment details */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1"><Receipt size={15} className="text-gray-400" /><h3 className="font-black text-gray-900 text-sm">Payment Details</h3></div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Method", val: pmt.method ?? "—" },
              { label: "Sender", val: pmt.senderNumber ?? "—" },
              { label: "TrxID",  val: pmt.transactionId ?? "—" },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-bold text-gray-900 font-mono break-all">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-2">
          <div className="flex items-center gap-2 mb-1"><MapPin size={15} className="text-gray-400" /><h3 className="font-black text-gray-900 text-sm">Shipping Address</h3></div>
          <p className="text-sm font-bold text-gray-900">{addr?.fullName ?? cust?.name ?? "—"}</p>
          <p className="text-sm text-gray-500">{addr?.phone     ?? cust?.phone ?? "—"}</p>
          <p className="text-sm text-gray-500">
            {[addr?.address ?? cust?.address, addr?.city ?? cust?.city, addr?.postalCode].filter(Boolean).join(", ")}
          </p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Package size={15} className="text-gray-400" /><h3 className="font-black text-gray-900 text-sm">Items</h3></div>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                {item.image && (
                  <div className="w-11 h-11 bg-white rounded-xl shrink-0 overflow-hidden border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                  {item.variantName && <p className="text-[10px] text-gray-400">{item.variantName}</p>}
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-gray-900 shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-black text-gray-900 pt-4 mt-2 border-t border-gray-100">
            <span>Total</span><span>{currency}{Number(total).toFixed(2)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Ordered on {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
