"use client";
// app/admin/orders/page.tsx
// Admin orders list — inline clickable status dropdowns for payment & order.

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import {
  Search, Filter, ChevronRight, Clock, CheckCircle2,
  XCircle, Package, ChevronDown, RefreshCcw, Truck,
  Ban, CreditCard, Trash2, Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  createdAt: string;
  total?: number;
  totalAmount?: number;
  paymentStatus?: string;
  orderStatus?: string;
  status?: string;
  userEmail?: string;
  payment?: { method?: string };
  paymentDetails?: { method?: string };
  shippingAddress?: { fullName?: string; phone?: string };
  customer?: { name?: string; phone?: string };
  items: { quantity?: number }[];
}

// ── Status config ──────────────────────────────────────────────────────────
const PMT_OPTIONS = [
  { value: "pending",   label: "Pending",   color: "text-amber-600",  bg: "bg-amber-50",  dot: "bg-amber-400" },
  { value: "pending_cod", label: "Cash on Delivery", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  { value: "confirmed", label: "Confirmed", color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-500" },
  { value: "failed",    label: "Failed",    color: "text-red-600",    bg: "bg-red-50",    dot: "bg-red-500" },
  { value: "refunded",  label: "Refunded",  color: "text-blue-600",   bg: "bg-blue-50",   dot: "bg-blue-400" },
  { value: "cancelled", label: "Cancelled", color: "text-gray-500",   bg: "bg-gray-100",  dot: "bg-gray-400" },
];

const ORD_OPTIONS = [
  { value: "pending",    label: "Pending",    color: "text-gray-500",   bg: "bg-gray-100",   dot: "bg-gray-400" },
  { value: "processing", label: "Processing", color: "text-blue-700",   bg: "bg-blue-50",    dot: "bg-blue-500" },
  { value: "shipped",    label: "Shipped",    color: "text-violet-700", bg: "bg-violet-50",  dot: "bg-violet-500" },
  { value: "delivered",  label: "Delivered",  color: "text-green-700",  bg: "bg-green-50",   dot: "bg-green-500" },
  { value: "cancelled",  label: "Cancelled",  color: "text-red-500",    bg: "bg-red-50",     dot: "bg-red-400" },
];

const pmtMap = Object.fromEntries(PMT_OPTIONS.map(o => [o.value, o]));
const ordMap = Object.fromEntries(ORD_OPTIONS.map(o => [o.value, o]));

// ── Inline Status Badge ──────────────────────────────────────────────────
// ── Inline Status Dropdown ──────────────────────────────────────────────────
function StatusDropdown({
  value,
  options,
  onSelect,
  disabled,
}: {
  value: string;
  options: typeof PMT_OPTIONS;
  onSelect: (v: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const ref = useRef<HTMLDivElement>(null);
  const cfg = options.find(o => o.value === value) ?? options[0];

  // Smart positioning
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDirection(spaceBelow < 220 ? "up" : "down");
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !disabled && setOpen(p => !p)}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
          cfg.bg, cfg.color,
          disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
        {cfg.label}
        <ChevronDown size={10} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "absolute left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden min-w-[140px]",
          direction === "down" ? "top-full mt-1" : "bottom-full mb-1"
        )}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-bold text-left transition-colors hover:bg-gray-50",
                opt.value === value && "bg-gray-50 opacity-60 cursor-default pointer-events-none"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
              <span className={opt.color}>{opt.label}</span>
              {opt.value === value && <CheckCircle2 size={10} className="ml-auto text-gray-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Orders Page ───────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const settings = useSettings() as any;
  const currency = settings?.currencySymbol ?? "৳";

  const [orders, setOrders]               = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updating, setUpdating]           = useState<string | null>(null); // orderId being updated
  const [toast, setToast]                 = useState("");

  const [deleteModal, setDeleteModal]     = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: "" });
  const [deleting, setDeleting]           = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then((data: Order[]) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const patchOrder = useCallback(async (orderId: string, fields: Record<string, string>) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      showToast("Status updated.");
    } catch {
      showToast("Failed to update. Please try again.");
    } finally {
      setUpdating(null);
    }
  }, []);

  const handlePaymentStatus = (orderId: string, value: string) => {
    patchOrder(orderId, { paymentStatus: value, status: value === "confirmed" ? "Processing" : value.charAt(0).toUpperCase() + value.slice(1) });
  };

  const handleOrderStatus = (orderId: string, value: string) => {
    patchOrder(orderId, { orderStatus: value, status: value.charAt(0).toUpperCase() + value.slice(1) });
  };

  const handleDelete = async (orderId: string) => {
    setDeleteModal({ isOpen: true, orderId });
  };

  const confirmDelete = async () => {
    const orderId = deleteModal.orderId;
    if (!orderId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast("Order deleted successfully.");
      setDeleteModal({ isOpen: false, orderId: "" });
    } catch (err) {
      console.error(`[UI] Delete error:`, err);
      showToast("Failed to delete order.");
    } finally {
      setDeleting(false);
    }
  };



  const filtered = orders.filter(o => {
    const name    = o.shippingAddress?.fullName ?? o.customer?.name ?? o.userEmail ?? "";
    const phone   = o.shippingAddress?.phone   ?? o.customer?.phone ?? "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.userEmail ?? "").toLowerCase().includes(search.toLowerCase());
    const payStatus    = o.paymentStatus ?? "pending";
    const matchPayment = paymentFilter === "all" || payStatus === paymentFilter;
    return matchSearch && matchPayment;
  });

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, order ID…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none bg-white text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 h-10 rounded-xl ring-1 ring-gray-100">
          <Filter size={14} className="text-gray-400" />
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-700 font-medium outline-none">
            <option value="all">All Payments</option>
            {PMT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} orders</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-visible">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {["Order", "Customer", "Date", "Total", "Payment Status", "Order Status", ""].map((h, i) => (
                <th key={h} className={cn(
                  "px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap",
                  i === 0 && "rounded-tl-[2rem]",
                  i === 6 && "rounded-tr-[2rem]"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center">
                <div className="w-6 h-6 border-4 border-gray-100 border-t-gray-700 rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm italic">No orders found.</td></tr>
            ) : filtered.map((order, orderIdx) => {
              const payStatus = order.paymentStatus ?? "pending";
              const ordStatus = order.orderStatus   ?? order.status?.toLowerCase() ?? "pending";
              const total     = order.totalAmount   ?? order.total ?? 0;
              const pmtMethod = order.payment?.method ?? order.paymentDetails?.method ?? "—";
              const custName  = order.shippingAddress?.fullName ?? order.customer?.name  ?? order.userEmail ?? "—";
              const custPhone = order.shippingAddress?.phone   ?? order.customer?.phone ?? "—";
              const isUpdating = updating === order.id;
              const isLast = orderIdx === filtered.length - 1;

              return (
                <tr key={order.id} className="hover:bg-gray-50/40 transition-colors group">
                  <td className={cn("px-5 py-4", isLast && "rounded-bl-[2rem]")}>
                    <p className="font-black text-xs text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    {pmtMethod === "Cash on Delivery" ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5 mt-0.5">
                        <Banknote size={10} /> COD
                      </span>
                    ) : (
                      <p className="text-[10px] text-gray-400 mt-0.5">{pmtMethod}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-gray-900">{custName}</p>
                    <p className="text-[10px] text-gray-400">{custPhone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-black text-gray-900 text-sm">
                    {currency}{Number(total).toFixed(2)}
                  </td>

                  {/* ── Inline Payment Status ── */}
                  <td className="px-5 py-4">
                    <StatusDropdown
                      value={payStatus}
                      options={PMT_OPTIONS}
                      onSelect={v => handlePaymentStatus(order.id, v)}
                      disabled={isUpdating}
                    />
                  </td>

                  {/* ── Inline Order Status ── */}
                  <td className="px-5 py-4">
                    <StatusDropdown
                      value={ordStatus}
                      options={ORD_OPTIONS}
                      onSelect={v => handleOrderStatus(order.id, v)}
                      disabled={isUpdating}
                    />
                  </td>

                  <td className={cn("px-5 py-4 text-right", isLast && "rounded-br-[2rem]")}>
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={isUpdating}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black transition-colors">
                        View <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        isDeleting={deleting}
        onClose={() => setDeleteModal({ isOpen: false, orderId: "" })}
        onConfirm={confirmDelete}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
