"use client";
// app/admin/orders/page.tsx
// Admin orders list — inline clickable status dropdowns for payment & order.

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import {
  Search, Filter, ChevronRight, Clock, CheckCircle2,
  XCircle, Package, ChevronDown, Truck,
  Ban, CreditCard, Trash2, Banknote, Download, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Required for smooth modal animations
import PremiumLoader from "@/components/PremiumLoader";
import { cn } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-helper";
import OrderInvoice from "@/components/admin/OrderInvoice";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  { value: "pending", label: "Pending", color: "#d97706", bg: "#fffbeb", dot: "#fbbf24" },
  { value: "pending_cod", label: "Cash on Delivery", color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
  { value: "confirmed", label: "Confirmed", color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  { value: "failed", label: "Failed", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
  { value: "refunded", label: "Refunded", color: "#2563eb", bg: "#eff6ff", dot: "#60a5fa" },
  { value: "cancelled", label: "Cancelled", color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
];

const ORD_OPTIONS = [
  { value: "pending", label: "Pending", color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
  { value: "processing", label: "Processing", color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
  { value: "shipped", label: "Shipped", color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  { value: "delivered", label: "Delivered", color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  { value: "cancelled", label: "Cancelled", color: "#ef4444", bg: "#fef2f2", dot: "#f87171" },
];

const pmtMap = Object.fromEntries(PMT_OPTIONS.map(o => [o.value, o]));
const ordMap = Object.fromEntries(ORD_OPTIONS.map(o => [o.value, o]));

// ── Inline Status Badge ──────────────────────────────────────────────────
// ── Inline Status Dropdown ──────────────────────────────────────────────────
// ── Static Status Badge ──────────────────────────────────────────────────
function StatusBadge({
  value,
  options,
}: {
  value: string;
  options: typeof PMT_OPTIONS;
}) {
  const cfg = options.find(o => o.value === value) ?? options[0];

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ── Admin Orders Page ───────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const settings = useSettings() as any;
  const currency = settings?.currencySymbol ?? "৳";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null); // orderId being updated
  const [toast, setToast] = useState("");

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: string }>({ isOpen: false, orderId: "" });
  const [deleting, setDeleting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    const fetchOrders = () => {
      authenticatedFetch("/api/orders", { cache: "no-store" })
        .then(r => r.json())
        .then((data: Order[]) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3 * 60 * 1000); // 3 minutes — saves Firestore quota
    return () => clearInterval(interval);
  }, []);

  const patchOrder = useCallback(async (orderId: string, fields: Record<string, string>) => {
    setUpdating(orderId);
    try {
      const res = await authenticatedFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
        cache: "no-store",
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
      const res = await authenticatedFetch(`/api/orders/${orderId}`, { method: "DELETE" });
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

  const handleDownloadPDF = async (order: Order) => {
    const invoiceElement = document.getElementById("invoice-capture");
    if (!invoiceElement) {
      showToast("Invoice element not found.");
      return;
    }

    try {
      setDownloadingPdf(true);
      
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "148mm";
      iframe.style.height = "210mm";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Could not create isolated print environment.");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Invoice</title>
          </head>
          <body style="margin:0; padding:0; background:#fff;">
            ${invoiceElement.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      if (doc.fonts && doc.fonts.ready) {
        await doc.fonts.ready;
      }
      await new Promise(r => setTimeout(r, 600));

      // Target the strictly bounded wrapper to prevent grabbing extra iframe background
      const targetEl = doc.querySelector(".inv-wrapper") as HTMLElement || doc.body;

      const canvas = await html2canvas(targetEl, {
        scale: 3, 
        useCORS: true, 
        logging: false,
        backgroundColor: "#ffffff",
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a5");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`afra-invoice-${order.id.toUpperCase()}.pdf`);
      showToast("Invoice downloaded successfully.");

      document.body.removeChild(iframe);
      
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      showToast("Download failed. Could not render PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    const invoiceElement = document.getElementById("invoice-capture");
    if (!invoiceElement) return;

    // Use an invisible iframe so the print dialog ONLY shows the invoice, not the admin UI
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Invoice - ${selectedOrder?.id?.toUpperCase() || ''}</title>
          <style>
            @media print {
              @page { size: A5 portrait; margin: 0; }
              body { margin: 0.5cm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body style="margin:0; background:#fff;">
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    
    // Give fonts and images a moment to settle
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Cleanup after print dialog closes
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };





  const filtered = orders.filter(o => {
    const name = o.shippingAddress?.fullName ?? o.customer?.name ?? o.userEmail ?? "";
    const phone = o.shippingAddress?.phone ?? o.customer?.phone ?? "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.userEmail ?? "").toLowerCase().includes(search.toLowerCase());
    const payStatus = o.paymentStatus ?? "pending";
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
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-visible">
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
              const ordStatus = order.orderStatus ?? order.status?.toLowerCase() ?? "pending";
              const total = order.totalAmount ?? order.total ?? 0;
              const pmtMethod = order.payment?.method ?? order.paymentDetails?.method ?? "—";
              const custName = order.shippingAddress?.fullName ?? order.customer?.name ?? order.userEmail ?? "—";
              const custPhone = order.shippingAddress?.phone ?? order.customer?.phone ?? "—";
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
                    <StatusBadge
                      value={payStatus}
                      options={PMT_OPTIONS}
                    />
                  </td>

                  {/* ── Inline Order Status ── */}
                  <td className="px-5 py-4">
                    <StatusBadge
                      value={ordStatus}
                      options={ORD_OPTIONS}
                    />
                  </td>

                  <td className={cn("px-5 py-4 text-right", isLast && "rounded-br-[2rem]")}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50 group/del"
                        title="Delete Order"
                      >
                        <Trash2 size={14} className="group-hover/del:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => { setSelectedOrder(order); setShowInvoice(true); }}
                        className="w-8 h-8 flex items-center justify-center text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white rounded-xl transition-all group/inv"
                        title="Quick Invoice"
                      >
                        <Banknote size={14} className="group-hover/inv:scale-110 transition-transform" />
                      </button>
                      <Link href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-900 text-gray-700 hover:text-white text-[11px] font-bold tracking-wide rounded-xl transition-all group/view">
                        View <ChevronRight size={14} className="group-hover/view:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <PremiumLoader />
        ) : filtered.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center text-gray-400 text-sm italic">
            No orders found.
          </div>
        ) : filtered.map((order) => {
          const payStatus = order.paymentStatus ?? "pending";
          const ordStatus = order.orderStatus ?? order.status?.toLowerCase() ?? "pending";
          const total = order.totalAmount ?? order.total ?? 0;
          const pmtMethod = order.payment?.method ?? order.paymentDetails?.method ?? "—";
          const custName = order.shippingAddress?.fullName ?? order.customer?.name ?? order.userEmail ?? "—";
          const custPhone = order.shippingAddress?.phone ?? order.customer?.phone ?? "—";
          const isUpdating = updating === order.id;

          return (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
              {/* Card Header: Order ID & Date */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-xs text-gray-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-base">{currency}{Number(total).toFixed(2)}</p>
                  {pmtMethod === "Cash on Delivery" ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5 mt-0.5">
                      <Banknote size={10} /> COD
                    </span>
                  ) : (
                    <p className="text-[10px] text-gray-400">{pmtMethod}</p>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50/50 p-3 rounded-2xl flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{custName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{custPhone}</p>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="shrink-0 w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment</p>
                  <StatusBadge
                    value={payStatus}
                    options={PMT_OPTIONS}
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-1">Delivery</p>
                  <StatusBadge
                    value={ordStatus}
                    options={ORD_OPTIONS}
                  />
                </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleDelete(order.id)}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} /> Delete Order
                </button>
                <button
                  onClick={() => { setSelectedOrder(order); setShowInvoice(true); }}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95"
                  style={{ backgroundColor: '#14b8a6', boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.1)' }}
                >
                  <Banknote size={12} /> Invoice
                </button>
                <Link href={`/admin/orders/${order.id}`} className="text-[10px] font-bold text-gray-900 bg-gray-100 px-4 py-1.5 rounded-xl">
                  Full Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Invoice Modal Preview ──────────────────── */}
      <AnimatePresence>
        {showInvoice && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInvoice(false)}
              className="absolute inset-0 bg-black/60 shadow-2xl backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Invoice Preview</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Order #{selectedOrder.id.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-gray-100"
                  >
                    <Printer size={14} />
                    Print
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    disabled={downloadingPdf}
                    className="flex items-center justify-center gap-2 px-6 py-2 text-white rounded-xl text-xs font-black transition-all shadow-lg min-w-[140px] disabled:opacity-50"
                    style={{ backgroundColor: '#14b8a6', boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.1)' }}
                  >
                    {downloadingPdf ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Download PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Invoice Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-100/30">
                <div id="invoice-capture" className="mx-auto w-fit">
                  <OrderInvoice
                    order={selectedOrder as any}
                    currency={currency}
                    storeName={settings?.storeName}
                    storeAddress={settings?.contactAddress}
                    storePhone={settings?.contactPhone}
                    storeEmail={settings?.contactEmail}
                    logoUrl={settings?.logoUrl}
                    signatureUrl={settings?.signatureUrl}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
