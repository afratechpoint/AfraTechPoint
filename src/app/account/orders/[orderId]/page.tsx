"use client";
// app/account/orders/[orderId]/page.tsx — Professional order detail with full charge breakdown

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Package, MapPin, Receipt, CheckCircle2,
  XCircle, Truck, CreditCard, User, Phone, Home, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/components/SettingsProvider";
import PremiumLoader from "@/components/PremiumLoader";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
}

interface Order {
  id: string;
  createdAt: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  paymentStatus?: string;
  orderStatus?: string;
  status?: string;
  paymentMethod?: string;
  payment?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string };
  paymentDetails?: { method?: string; senderNumber?: string; transactionId?: string };
  shippingAddress?: { fullName?: string; phone?: string; address?: string; city?: string; postalCode?: string };
  customer?: { name?: string; phone?: string; address?: string; city?: string; email?: string };
  userEmail?: string;
  items: OrderItem[];
}

// Order progress steps
const ORDER_STEPS = [
  { key: "Processing", label: "Order Placed",  icon: Receipt },
  { key: "Shipped",    label: "Shipped",        icon: Truck },
  { key: "Delivered",  label: "Delivered",      icon: CheckCircle2 },
];

const STEP_ORDER = ["pending", "processing", "shipped", "delivered"];

function getStepIndex(status: string) {
  return STEP_ORDER.indexOf(status.toLowerCase());
}

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
      .then(async r => { if (!r.ok) return null; return r.json(); })
      .then(data  => { setOrder(data); setFetching(false); })
      .catch(()   => { setOrder(null); setFetching(false); });
  }, [orderId]);

  if (loading || fetching) return <PremiumLoader />;

  if (!order?.id) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Package size={28} className="text-gray-300" />
      </div>
      <p className="text-gray-600 font-bold">Order not found</p>
      <Link href="/account?tab=orders" className="text-sm text-black font-bold underline">← Back to My Orders</Link>
    </div>
  );

  // ── Normalise field names ──────────────────────────────────────────
  const payStatus = order.paymentStatus ?? "pending";
  const ordStatus = (order.orderStatus ?? order.status ?? "pending").toLowerCase();
  const total     = order.totalAmount ?? order.total ?? 0;
  const subtotal  = order.subtotal ?? total;
  const delivery  = order.deliveryCharge ?? 0;
  const pmt       = order.payment ?? order.paymentDetails ?? {};
  const pmtMethod = pmt.method ?? order.paymentMethod ?? "—";
  const addr      = order.shippingAddress;
  const cust      = order.customer;
  const isCOD     = pmtMethod === "Cash on Delivery";
  const isCancelled = ordStatus === "cancelled";

  const stepIdx = isCancelled ? -1 : getStepIndex(ordStatus);

  // ── Status badge helpers ──────────────────────────────────────────
  const ordBadge: Record<string, string> = {
    pending:    "bg-amber-50  text-amber-600  border-amber-200",
    processing: "bg-blue-50   text-blue-600   border-blue-200",
    shipped:    "bg-purple-50 text-purple-600 border-purple-200",
    delivered:  "bg-green-50  text-green-600  border-green-200",
    cancelled:  "bg-red-50    text-red-500    border-red-200",
  };
  const payBadge: Record<string, string> = {
    pending:     "bg-amber-50  text-amber-600  border-amber-200",
    pending_cod: "bg-blue-50   text-blue-700   border-blue-200",
    confirmed:   "bg-green-50  text-green-600  border-green-200",
    failed:      "bg-red-50    text-red-500    border-red-200",
    cancelled:   "bg-red-50    text-red-500    border-red-200",
  };

  const payLabel: Record<string, string> = {
    pending:     "Awaiting Payment Verification",
    pending_cod: "Pay on Delivery",
    confirmed:   "Payment Confirmed",
    failed:      "Payment Failed",
    cancelled:   "Cancelled",
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6f8]">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8">
        <Navbar searchEnabled={false} />
      </div>

      <main className="flex-1 py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-bold transition-colors">
              <ArrowLeft size={16} /> My Orders
            </Link>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* ── Order Progress Tracker ── */}
          {!isCancelled && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-900 mb-5">Order Progress</h3>
              <div className="flex items-center">
                {ORDER_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done    = stepIdx >= i + 1;
                  const active  = stepIdx === i || (i === 0 && stepIdx === 0);
                  const current = stepIdx === i;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          done    ? "bg-green-500 border-green-500 text-white" :
                          current ? "bg-black border-black text-white" :
                          "bg-gray-50 border-gray-200 text-gray-300"
                        }`}>
                          <Icon size={16} />
                        </div>
                        <p className={`text-[9px] font-bold mt-2 text-center ${
                          done || current ? "text-gray-900" : "text-gray-400"
                        }`}>{step.label}</p>
                      </div>
                      {i < ORDER_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 -mt-5 rounded-full ${stepIdx > i ? "bg-green-400" : "bg-gray-100"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Cancelled Banner ── */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <XCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-bold">This order has been cancelled.</p>
            </div>
          )}

          {/* ── Status Cards ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${ordBadge[ordStatus] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                <Package size={10} />
                {ordStatus.charAt(0).toUpperCase() + ordStatus.slice(1)}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${payBadge[payStatus] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                {payStatus === "confirmed" ? <CheckCircle2 size={10} /> : payStatus === "pending_cod" ? <Truck size={10} /> : <Clock size={10} />}
                {payLabel[payStatus] ?? payStatus}
              </span>
            </div>
          </div>

          {/* ── Pending Payment Banner ── */}
          {payStatus === "pending" && !isCOD && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-bold">Waiting for payment verification</p>
                <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                  This usually takes a few minutes to an hour. Keep your Transaction ID <span className="font-mono font-bold">{pmt.transactionId ?? "—"}</span> safe.
                </p>
              </div>
            </div>
          )}

          {/* ── COD Banner ── */}
          {isCOD && !isCancelled && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
              <Truck size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 text-sm font-bold">Cash on Delivery Order</p>
                <p className="text-blue-700 text-xs mt-0.5">
                  Please prepare <span className="font-black">{currency}{total.toFixed(2)}</span> when the delivery arrives at your address.
                </p>
              </div>
            </div>
          )}

          {/* ── Order Items + Price Breakdown ── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package size={15} className="text-gray-400" />
              <h3 className="font-black text-gray-900 text-sm">Order Items</h3>
            </div>

            <div className="space-y-3 mb-5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  {item.image ? (
                    <div className="w-14 h-14 bg-white rounded-xl shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    {item.variantName && <p className="text-[10px] text-gray-400 mt-0.5">{item.variantName}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currency}{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-gray-900 shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium flex items-center gap-1.5"><Truck size={13} /> Delivery Charge</span>
                <span className={`font-bold ${delivery === 0 ? "text-green-600" : ""}`}>
                  {delivery === 0 ? "Free" : `${currency}${delivery.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total {isCOD && <span className="text-[10px] font-medium text-blue-600">(Pay on delivery)</span>}</span>
                <span>{currency}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Payment Details ── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={15} className="text-gray-400" />
              <h3 className="font-black text-gray-900 text-sm">Payment Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Method</p>
                <p className="text-sm font-bold text-gray-900">{pmtMethod}</p>
              </div>
              {!isCOD && pmt.senderNumber && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sender Number</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{pmt.senderNumber}</p>
                </div>
              )}
              {!isCOD && pmt.transactionId && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="text-sm font-bold text-gray-900 font-mono break-all">{pmt.transactionId}</p>
                </div>
              )}
              {isCOD && (
                <div className="sm:col-span-2 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Payment Due</p>
                  <p className="text-lg font-black text-blue-700">{currency}{total.toFixed(2)}</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Collected at the time of delivery</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Shipping Address ── */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={15} className="text-gray-400" />
              <h3 className="font-black text-gray-900 text-sm">Delivery Address</h3>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                <Home size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">{addr?.fullName ?? cust?.name ?? "—"}</p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5"><Phone size={12} />{addr?.phone ?? cust?.phone ?? "—"}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {[addr?.address ?? cust?.address, addr?.city ?? cust?.city, addr?.postalCode].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="flex items-center justify-between pb-4">
            <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black font-bold transition-colors">
              <ArrowLeft size={14} /> All Orders
            </Link>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black font-bold hover:underline">
              Continue Shopping <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
