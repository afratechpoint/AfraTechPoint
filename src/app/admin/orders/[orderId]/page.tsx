"use client";
// app/admin/orders/[orderId]/page.tsx — redesigned premium admin order detail

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock,
  Package, MapPin, Receipt, User, AlertTriangle,
  Phone, Mail, Hash, Hash as TransactionIcon, Send, CreditCard, Truck, Trash2
} from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { cn } from "@/lib/utils";
import { getAuth } from "firebase/auth";

// Gets a fresh Firebase ID token for authenticated API requests
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
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
  userEmail?: string;
  payment?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string };
  paymentDetails?: { method?: string; senderNumber?: string; transactionId?: string; accountUsed?: string };
  shippingAddress?: { fullName?: string; phone?: string; address?: string; city?: string; postalCode?: string };
  customer?: { name?: string; phone?: string; address?: string; city?: string; email?: string };
  courier?: string;
  courierTrackingCode?: string;
  courierConsignmentId?: string | number;
  courierStatus?: string;
  items: { name: string; price: number; quantity: number; image?: string; variantName?: string }[];
}

const PMT_STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:   { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Pending" },
  pending_cod: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Cash on Delivery" },
  confirmed: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Confirmed" },
  failed:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Failed" },
  refunded:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Refunded" },
  cancelled: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400",   label: "Cancelled" },
};
const ORD_STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:    { bg: "bg-gray-100", text: "text-gray-600",   dot: "bg-gray-400",   label: "Pending" },
  processing: { bg: "bg-blue-50",  text: "text-blue-700",   dot: "bg-blue-500",   label: "Processing" },
  shipped:    { bg: "bg-violet-50",text: "text-violet-700", dot: "bg-violet-500", label: "Shipped" },
  delivered:  { bg: "bg-green-50", text: "text-green-700",  dot: "bg-green-500",  label: "Delivered" },
  cancelled:  { bg: "bg-red-50",   text: "text-red-700",    dot: "bg-red-500",    label: "Cancelled" },
};
const METHOD_COLOR: Record<string, string> = {
  bKash:  "bg-pink-100 text-pink-800",
  Nagad:  "bg-orange-100 text-orange-800",
  Rocket: "bg-purple-100 text-purple-800",
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams() as { orderId: string };
  const router      = useRouter();
  const settings    = useSettings() as any;
  const currency    = settings?.currencySymbol ?? "৳";

  const [order, setOrder]       = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting]               = useState(false);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const headers = await getAuthHeaders();
      fetch(`/api/orders/${orderId}`, { headers })
        .then(async r => { if (!r.ok) return null; return r.json(); })
        .then(data => { setOrder(data); setFetching(false); })
        .catch(() => { setOrder(null); setFetching(false); });
    })();
  }, [orderId]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const patch = async (fields: Record<string, string>) => {
    if (!order) return;
    setUpdating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrder(prev => prev ? { ...prev, ...updated } : prev);
      return true;
    } catch {
      showToast("Update failed. Please try again.", false);
      return false;
    } finally {
      setUpdating(false);
    }
  };


  const updatePaymentStatus = async (s: string) => {
    const updateObj: any = { paymentStatus: s };
    // If setting to confirmed and was pending, also push the order to processing
    if (s === "confirmed" && order?.paymentStatus === "pending") {
      updateObj.orderStatus = "processing";
      updateObj.status = "Processing";
    }
    const ok = await patch(updateObj);
    if (ok) {
      showToast(`Payment status updated to ${s}.`);
    }
  };
  const updateOrderStatus = async (s: string) => {
    const ok = await patch({ orderStatus: s, status: s.charAt(0).toUpperCase() + s.slice(1) });
    if (ok) {
      showToast(`Order status updated to ${s}.`);
    }
  };

  const shipWithSteadfast = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/courier/steadfast/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ orderId: order.id, deliveryType: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create parcel");
      
      showToast("Order shipped with Steadfast!");
      // Refresh local state
      const updatedOrder = await (await fetch(`/api/orders/${order.id}`, { headers })).json();
      setOrder(updatedOrder);
    } catch (err: any) {
      showToast(err.message || "Shipping failed", false);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      showToast("Order deleted successfully.");
      setIsDeleteModalOpen(false);
      setTimeout(() => router.push("/admin/orders"), 1500);
    } catch (err) {
      console.error(`[UI] Delete error:`, err);
      showToast("Failed to delete order.", false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );
  if (!order || !order.id) return (
    <div className="text-center py-28">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Package size={24} className="text-gray-400" />
      </div>
      <p className="text-gray-500 font-semibold mb-2">Order not found</p>
      <Link href="/admin/orders" className="text-sm text-black font-bold underline underline-offset-2">
        Back to All Orders
      </Link>
    </div>
  );

  const payStatus = order.paymentStatus ?? "pending";
  const ordStatus = order.orderStatus   ?? order.status?.toLowerCase() ?? "pending";
  const total     = order.totalAmount   ?? order.total ?? 0;
  const pmt       = order.payment       ?? order.paymentDetails        ?? {};
  const addr      = order.shippingAddress;
  const cust      = order.customer;
  const pmtInfo   = PMT_STATUS[payStatus] ?? PMT_STATUS.pending;
  const ordInfo   = ORD_STATUS[ordStatus] ?? ORD_STATUS.pending;

  return (
    <div className="max-w-4xl space-y-6 pb-10">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <Link href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={15} /> All Orders
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-[10px] font-mono font-semibold text-gray-500">
                #{order.id.slice(0, 12).toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={updating}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
            title="Delete Order"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Status strip ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: <CreditCard size={14} />, label: "Payment",
            node: (
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", pmtInfo.bg, pmtInfo.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", pmtInfo.dot)} />
                {pmtInfo.label}
              </span>
            ),
          },
          {
            icon: <Truck size={14} />, label: "Order Status",
            node: (
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", ordInfo.bg, ordInfo.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", ordInfo.dot)} />
                {ordInfo.label}
              </span>
            ),
          },
          {
            icon: <Package size={14} />, label: "Items",
            node: <span className="text-base font-black text-gray-900">{order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0}</span>,
          },
          {
            icon: <Hash size={14} />, label: "Total",
            node: <span className="text-base font-black text-gray-900">{currency}{Number(total).toFixed(2)}</span>,
          },
        ].map(({ icon, label, node }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {icon} {label}
            </div>
            {node}
          </div>
        ))}
      </div>


      {/* ── Info grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Payment */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Receipt size={13} className="text-gray-500" />
              </div>
              <h3 className="font-black text-gray-900 text-sm">Payment Info</h3>
            </div>
            {pmt.method && (
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold", METHOD_COLOR[pmt.method] ?? "bg-gray-100 text-gray-700")}>
                {pmt.method}
              </span>
            )}
          </div>
          <div className="space-y-3 divide-y divide-gray-50">
            {[
              { icon: <Phone size={12} />,  label: "Sender Number", val: pmt.senderNumber  ?? "—" },
              { icon: <Hash size={12} />,   label: "Transaction ID", val: pmt.transactionId ?? "—" },
              { icon: <Send size={12} />,   label: "Sent to Account",val: pmt.accountUsed   ?? "—" },
            ].filter(() => pmt.method !== "Cash on Delivery").map(({ icon, label, val }) => (
              <div key={label} className="flex items-start justify-between pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">
                  {icon} {label}
                </div>
                <p className="text-sm font-bold text-gray-900 font-mono text-right break-all ml-3">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
              <User size={13} className="text-gray-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">Customer</h3>
          </div>
          <div className="space-y-3 divide-y divide-gray-50">
            {[
              { icon: <User size={12} />,   label: "Name",    val: addr?.fullName ?? cust?.name  ?? "—" },
              { icon: <Phone size={12} />,  label: "Phone",   val: addr?.phone    ?? cust?.phone ?? "—" },
              { icon: <Mail size={12} />,   label: "Email",   val: order.userEmail ?? cust?.email ?? "—" },
              { icon: <MapPin size={12} />, label: "Address", val: [addr?.address ?? cust?.address, addr?.city ?? cust?.city, addr?.postalCode].filter(Boolean).join(", ") || "—" },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-start justify-between pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">
                  {icon} {label}
                </div>
                <p className="text-sm font-semibold text-gray-900 text-right ml-3 break-all">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Courier & Shipping */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Truck size={13} className="text-blue-600" />
              </div>
              <h3 className="font-black text-gray-900 text-sm">Shipping & Delivery</h3>
            </div>
            {order.courier && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 uppercase tracking-wider">
                {order.courier}
              </span>
            )}
          </div>

          {!order.courierTrackingCode ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                This order is ready to be shipped. You can send it to Steadfast Courier with one click.
              </p>
              <button
                onClick={shipWithSteadfast}
                disabled={updating || ordStatus === 'cancelled'}
                className="w-full flex items-center justify-center gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
              >
                <Send size={14} /> Send to Steadfast Courier
              </button>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-gray-50">
              {[
                { icon: <Hash size={12} />,  label: "Tracking Code", val: order.courierTrackingCode, copy: true },
                { icon: <Hash size={12} />,  label: "Consignment ID", val: order.courierConsignmentId?.toString() ?? "—" },
                { icon: <Clock size={12} />, label: "Courier Status", val: order.courierStatus?.replace(/_/g, ' ') ?? "pending" },
              ].map(({ icon, label, val, copy }) => (
                <div key={label} className="flex items-start justify-between pt-3 first:pt-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">
                    {icon} {label}
                  </div>
                  <div className="flex flex-col items-end gap-1 overflow-hidden">
                    <p className={cn("text-sm font-bold text-gray-900 font-mono text-right truncate max-w-full", label === 'Tracking Code' && 'text-blue-600')}>
                      {val}
                    </p>
                    {copy && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(val || ""); showToast("Tracking code copied!"); }}
                        className="text-[9px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest"
                      >
                        Copy Tracking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Order Items ──────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package size={13} className="text-gray-500" />
          </div>
          <h3 className="font-black text-gray-900 text-sm">Order Items</h3>
        </div>

        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-start md:items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              {item.image ? (
                <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center">
                  <Package size={18} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {currency}{item.price.toFixed(2)}</p>
              </div>
              <p className="text-sm font-black text-gray-900 shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold">{currency}{Number(order.subtotal ?? total).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Delivery Charge</span>
            <span className={cn("font-bold", order.deliveryCharge === 0 ? "text-green-600" : "")}>
              {order.deliveryCharge === 0 ? "Free" : `${currency}${Number(order.deliveryCharge ?? 0).toFixed(2)}`}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-500">Order Total {pmt.method === "Cash on Delivery" && <span className="text-[10px] text-blue-600">(COD)</span>}</span>
            <span className="text-xl font-black text-gray-900">{currency}{Number(total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Update Statuses ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Status Dropdown alternative */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard size={13} className="text-gray-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">Update Payment Status</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["pending", "confirmed", "failed", "refunded", "cancelled"].map(s => (
              <button key={s} onClick={() => updatePaymentStatus(s)} disabled={updating || payStatus === s}
                className={cn(
                  "px-4 h-9 rounded-xl text-xs font-bold border transition-all disabled:cursor-not-allowed",
                  payStatus === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-100 disabled:opacity-40"
                )}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
              <Truck size={13} className="text-gray-500" />
            </div>
            <h3 className="font-black text-gray-900 text-sm">Update Order Status</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
              <button key={s} onClick={() => updateOrderStatus(s)} disabled={updating || ordStatus === s}
                className={cn(
                  "px-4 h-9 rounded-xl text-xs font-bold border transition-all disabled:cursor-not-allowed",
                  ordStatus === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-100 disabled:opacity-40"
                )}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* ── Toast ─────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-semibold whitespace-nowrap",
              toast.ok ? "bg-gray-900 text-white" : "bg-red-600 text-white"
            )}>
            {toast.ok
              ? <CheckCircle2 size={15} className="text-green-400" />
              : <XCircle size={15} className="text-red-200" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
