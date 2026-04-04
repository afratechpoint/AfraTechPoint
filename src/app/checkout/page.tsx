"use client";
// app/checkout/page.tsx — Supports Digital Payment + Cash on Delivery

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, CheckCircle2, AlertCircle, ShieldCheck, Copy, Package, Banknote, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PremiumLoader from "@/components/PremiumLoader";

const METHOD_COLORS: Record<string, string> = {
  bKash:  "bg-pink-50 border-pink-200 text-pink-700",
  Nagad:  "bg-orange-50 border-orange-200 text-orange-700",
  Rocket: "bg-purple-50 border-purple-200 text-purple-700",
};

const BD_PHONE = /^01[3-9]\d{8}$/;

type PaymentTab = "digital" | "cod";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const settings             = useSettings() as any;
  const { user, loading }    = useAuth();
  const router               = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [copied, setCopied]             = useState<string | null>(null);
  const submitted                       = useRef(false);

  // Shipping
  const [ship, setShip] = useState({ fullName: "", phone: "", address: "", city: "", postalCode: "", division: "", district: "", upazila: "" });

  // BD Geo data
  const [geoDivisions, setGeoDivisions] = useState<any[]>([]);
  const [geoDistricts, setGeoDistricts] = useState<any[]>([]);
  const [geoUpazilas, setGeoUpazilas]   = useState<any[]>([]);

  // Payment tab: "digital" or "cod"
  const [paymentTab, setPaymentTab]     = useState<PaymentTab>("digital");
  const [method, setMethod]             = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTrxId]       = useState("");

  // ── Guards ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/checkout");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && items.length === 0 && !submitted.current) router.push("/shop");
  }, [items, loading, router]);

  useEffect(() => {
    if (user) {
      setShip(s => ({ ...s, fullName: user.displayName ?? "" }));
      user.getIdToken().then(token => {
        fetch("/api/profile", {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data && (data.phone || data.address || data.division)) {
              setShip(s => ({ 
                ...s, 
                phone: data.phone || "", 
                address: data.address || "",
                division: data.division || "",
                district: data.district || "",
                upazila: data.upazila || "",
              }));
            } else {
              toast.info("Please ensure your profile has a phone and address for faster checkout.");
            }
          })
          .catch(err => console.error("Checkout profile fetch failed:", err));
      });
    }
  }, [user]);

  // BD Geo Effects
  useEffect(() => {
    fetch("/api/geo/divisions")
      .then(r => r.json())
      .then(d => { if (d?.data) setGeoDivisions(d.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!ship.division) { setGeoDistricts([]); setGeoUpazilas([]); return; }
    fetch(`/api/geo/division/${ship.division.toLowerCase()}`)
      .then(r => r.json())
      .then(d => { if (d?.data) setGeoDistricts(d.data); })
      .catch(console.error);
  }, [ship.division]);

  useEffect(() => {
    if (!ship.district || !geoDistricts.length) { setGeoUpazilas([]); return; }
    const distObj = geoDistricts.find((d: any) => d.district?.toLowerCase() === ship.district.toLowerCase());
    if (distObj?.upazilla) setGeoUpazilas(distObj.upazilla);
    else setGeoUpazilas([]);
  }, [ship.district, geoDistricts]);

  const paymentMethods: { id: string; name: string; accountNumber: string; enabled: boolean }[] =
    (settings?.paymentMethods ?? []).filter((m: any) => m.enabled);

  const codEnabled: boolean = settings?.codEnabled !== false; // default true if not configured

  useEffect(() => {
    if (paymentMethods.length > 0 && !method) setMethod(paymentMethods[0].name);
    // If no digital methods, default to COD
    if (paymentMethods.length === 0 && codEnabled) setPaymentTab("cod");
  }, [settings]);

  const subtotal      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharge = Number(settings?.deliveryCharge) || 0;
  const grandTotal    = subtotal + deliveryCharge;
  const currency      = settings?.currencySymbol ?? "৳";
  const isCOD         = paymentTab === "cod";

  // ── Validation ────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!ship.fullName.trim())      e.fullName  = "Full name is required.";
    if (!BD_PHONE.test(ship.phone)) e.phone     = "Enter a valid BD number (e.g. 01XXXXXXXXX).";
    if (!ship.division)             e.division  = "Select a division.";
    if (!ship.district)             e.district  = "Select a district.";
    if (!ship.upazila)              e.upazila   = "Select an upazila.";

    // Only validate digital payment fields when not COD
    if (!isCOD) {
      if (!BD_PHONE.test(senderNumber))  e.senderNumber  = "Enter a valid sender number.";
      if (!transactionId.trim())         e.transactionId = "Transaction ID is required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const copyNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard: prevent double submission (double-click or StrictMode re-render)
    if (submitted.current || isProcessing) return;
    if (!validate()) return;
    setIsProcessing(true);

    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId:    user!.uid,
          userEmail: user!.email ?? "",
          items: items.map(i => ({
            productId:   i.id,
            name:        i.name,
            price:       i.price,
            quantity:    i.quantity,
            image:       i.image,
            variantName: i.variantName,
          })),
          shippingAddress: {
            fullName:   ship.fullName,
            phone:      ship.phone,
            address:    [ship.address, ship.upazila, ship.district, ship.division].filter(Boolean).join(", "),
            city:       ship.district || ship.division,
            postalCode: ship.postalCode || undefined,
            division:   ship.division,
            district:   ship.district,
            upazila:    ship.upazila,
          },
          payment: isCOD
            ? { method: "Cash on Delivery", senderNumber: "", transactionId: "", accountUsed: "" }
            : { method, senderNumber, transactionId, accountUsed: paymentMethods.find(m => m.name === method)?.accountNumber ?? "" },
          customer: { name: ship.fullName, email: user!.email ?? "", phone: ship.phone, address: [ship.address, ship.upazila, ship.district, ship.division].filter(Boolean).join(", "), city: ship.district || ship.division },
          total:         grandTotal,
          totalAmount:   grandTotal,
          subtotal,
          deliveryCharge,
          paymentMethod: isCOD ? "Cash on Delivery" : method,
          paymentStatus: isCOD ? "pending_cod" : "pending",
          orderStatus:   "pending",
          status:        "Processing",
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();

      submitted.current = true;
      clearCart();
      router.push(`/checkout/success?orderId=${data.id}`);
    } catch {
      setErrors({ _global: "Failed to place order. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return <PremiumLoader />;
  }

  const canSubmit = isCOD ? (codEnabled) : paymentMethods.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-black text-sm font-semibold mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left ───────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Shipping */}
            <section className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                  <Truck size={14} className="text-white" />
                </div>
                <h2 className="font-black text-gray-900">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name" error={errors.fullName}>
                  <input required value={ship.fullName} onChange={e => setShip(s => ({ ...s, fullName: e.target.value }))}
                    placeholder="Rahim Uddin" className={inp(!!errors.fullName)} />
                </Field>
                <Field label="Phone Number" error={errors.phone}>
                  <input required type="tel" value={ship.phone} onChange={e => setShip(s => ({ ...s, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX" className={inp(!!errors.phone)} />
                </Field>
                <Field label="Division" error={errors.division}>
                  <div className="relative">
                    <select value={ship.division} onChange={e => setShip(s => ({ ...s, division: e.target.value, district: "", upazila: "" }))}
                      className={`${inp(!!errors.division)} appearance-none cursor-pointer pr-8`}>
                      <option value="">Select Division</option>
                      {geoDivisions.map((d: any) => <option key={d._id || d.division} value={d.division}>{d.division}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                  </div>
                </Field>
                <Field label="District" error={errors.district}>
                  <div className="relative">
                    <select value={ship.district} onChange={e => setShip(s => ({ ...s, district: e.target.value, upazila: "" }))}
                      disabled={!ship.division}
                      className={`${inp(!!errors.district)} appearance-none cursor-pointer pr-8 disabled:opacity-50`}>
                      <option value="">Select District</option>
                      {geoDistricts.map((d: any) => <option key={d._id || d.district} value={d.district}>{d.district}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                  </div>
                </Field>
                <Field label="Upazila" error={errors.upazila}>
                  <div className="relative">
                    <select value={ship.upazila} onChange={e => setShip(s => ({ ...s, upazila: e.target.value }))}
                      disabled={!ship.district}
                      className={`${inp(!!errors.upazila)} appearance-none cursor-pointer pr-8 disabled:opacity-50`}>
                      <option value="">Select Upazila</option>
                      {geoUpazilas.map((u: string) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                  </div>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="গ্রাম / বাসার নম্বর">
                    <div className="relative">
                      <input value={ship.address} onChange={e => setShip(s => ({ ...s, address: e.target.value.slice(0, 15) }))}
                        placeholder="গ্রাম, বাসার নম্বর" maxLength={15} className={`${inp(false)} pr-14`} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">{ship.address.length}/15</div>
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                  <CreditCard size={14} className="text-white" />
                </div>
                <h2 className="font-black text-gray-900">Payment Method</h2>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-2xl">
                {paymentMethods.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentTab("digital")}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentTab === "digital" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard size={14} /> Digital Payment
                  </button>
                )}
                {codEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentTab("cod")}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentTab === "cod" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Banknote size={14} /> Cash on Delivery
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {paymentTab === "digital" && paymentMethods.length > 0 && (
                  <motion.div key="digital" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    <p className="text-gray-400 text-xs mb-4">
                      Send <span className="font-bold text-gray-700">{currency}{grandTotal.toFixed(2)}</span> to any number below, then fill the form.
                    </p>

                    {/* Account numbers */}
                    <div className="grid gap-3 mb-5"
                      style={{ gridTemplateColumns: `repeat(${Math.min(paymentMethods.length, 3)}, minmax(0,1fr))` }}>
                      {paymentMethods.map(m => (
                        <div key={m.id} className={`rounded-2xl border p-3 ${METHOD_COLORS[m.name] ?? "bg-gray-50 border-gray-200 text-gray-700"}`}>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{m.name}</p>
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-sm">{m.accountNumber}</p>
                            <button type="button" onClick={() => copyNum(m.accountNumber)}
                              className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
                              {copied === m.accountNumber ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Field label="Payment Method Used">
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${paymentMethods.length}, minmax(0,1fr))` }}>
                          {paymentMethods.map(m => (
                            <button key={m.id} type="button" onClick={() => setMethod(m.name)}
                              className={`h-10 rounded-xl border text-sm font-bold transition-all ${
                                method === m.name ? "bg-black text-white border-black" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400"
                              }`}>{m.name}</button>
                          ))}
                        </div>
                      </Field>
                      <Field label={`Your ${method || "Sender"} Number`} error={errors.senderNumber}>
                        <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX" className={inp(!!errors.senderNumber)} />
                      </Field>
                      <Field label="Transaction ID (TrxID)" error={errors.transactionId}>
                        <input value={transactionId} onChange={e => setTrxId(e.target.value)}
                          placeholder="e.g. 9FT9XXXXX" className={`${inp(!!errors.transactionId)} font-mono`} />
                      </Field>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                      <ShieldCheck size={14} className="text-green-500 shrink-0" />
                      Order confirmed after payment verification — usually within a few minutes.
                    </div>
                  </motion.div>
                )}

                {paymentTab === "cod" && (
                  <motion.div key="cod" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    {/* COD Info card */}
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                          <Banknote size={22} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-black text-green-800 text-sm mb-1">Pay when your order arrives!</p>
                          <p className="text-xs text-green-700 leading-relaxed">
                            No advance payment needed. Our delivery agent will collect{" "}
                            <strong>{currency}{grandTotal.toFixed(2)}</strong> in cash when your package is delivered to your door.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="space-y-2 mb-4">
                      {[
                        { step: "1", text: "Place your order now" },
                        { step: "2", text: "We prepare & dispatch your package" },
                        { step: "3", text: "Pay cash to the delivery agent at your doorstep" },
                      ].map(s => (
                        <div key={s.step} className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                          {s.text}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ShieldCheck size={14} className="text-green-500 shrink-0" />
                      No hidden charges. Pay exactly <strong className="text-gray-600 ml-1">{currency}{subtotal.toFixed(2)}</strong>.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <AnimatePresence>
              {errors._global && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                  <AlertCircle size={16} className="shrink-0" /> {errors._global}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Summary ─────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">Order Summary</h2>
                <Link href="/cart" className="text-xs text-gray-400 hover:text-black transition-colors font-semibold">Edit Cart</Link>
              </div>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.id}-${item.variantName}`} className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-50 rounded-xl shrink-0 overflow-hidden border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      {item.variantName && <p className="text-[10px] text-gray-400">{item.variantName}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Charge</span>
                  {deliveryCharge > 0
                    ? <span className="font-semibold text-gray-700">{currency}{deliveryCharge.toFixed(2)}</span>
                    : <span className="text-green-600 font-semibold">Free</span>
                  }
                </div>
                {isCOD && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span className="flex items-center gap-1"><Banknote size={12} /> Pay on Delivery</span>
                    <Check size={14} className="text-green-600" />
                  </div>
                )}
                <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span><span>{currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={isProcessing || !canSubmit}
                className="w-full h-12 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isProcessing
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Package size={16} /> {isCOD ? "Place COD Order" : "Place Order"}</>
                }
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                {isCOD
                  ? `Pay ${currency}${grandTotal.toFixed(2)} cash upon delivery.`
                  : "By placing your order you confirm the payment has been sent."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
    </div>
  );
}

function inp(err: boolean) {
  return `w-full h-10 px-4 rounded-xl bg-gray-50 border outline-none text-sm text-gray-900 transition-all ${
    err ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-black focus:bg-white"
  }`;
}
