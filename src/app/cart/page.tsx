"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity } = useCart();
  const settings = useSettings();
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-10">
      <Navbar searchEnabled={false} />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-6">
          <Link href="/shop" className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-black transition-colors mb-4 uppercase tracking-widest">
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2 uppercase">
            <ShoppingBag size={24} />
            Your Cart
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">Your cart is empty</h2>
            <p className="text-xs text-gray-500 mb-6 max-w-xs px-4">Looks like you haven't added any premium tech items to your cart yet.</p>
            <Link 
              href="/shop"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-text)' }}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--primary-accent)] flex items-center gap-2"
            >
              Start Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-3">
              <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-100 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="col-span-6 px-2">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right px-2">Total</div>
                </div>

                <div className="space-y-6">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={`${item.id}-${item.variantName || 'default'}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center py-4 border-b border-gray-50 last:border-0"
                      >
                        {/* Product Info */}
                        <div className="w-full md:col-span-6 flex items-center gap-3">
                          <Link href={`/shop/${item.id}`} className="w-16 h-16 md:w-20 md:h-20 bg-[#f8f9fa] rounded-xl overflow-hidden flex-shrink-0 group border border-gray-50">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-500"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-xs md:text-sm leading-tight hover:text-black transition-all truncate">
                              <Link href={`/shop/${item.id}`}>{item.name}</Link>
                            </h3>
                            {item.variantName && (
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.variantName}</p>
                            )}
                            <p className="text-[11px] font-bold text-gray-500 mt-1 md:hidden">
                              {settings?.currencySymbol || '$'}{item.price.toFixed(0)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity & Total Row (Mobile Optimized) */}
                        <div className="w-full md:col-span-6 grid grid-cols-2 gap-4 items-center mt-2 pt-3 border-t border-gray-50 md:border-t-0 md:mt-0 md:pt-0">
                           {/* Quantity */}
                           <div className="flex flex-col gap-1">
                              <span className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantity</span>
                              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-0.5 border border-gray-100 w-fit">
                                <button 
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      updateQuantity(item.id, item.variantName, item.quantity - 1);
                                    } else {
                                      removeItem(item.id, item.variantName);
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm font-bold hover:text-black active:scale-90 transition-all text-sm"
                                >
                                  -
                                </button>
                                <span className="w-4 text-center text-[11px] font-black text-gray-900">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.variantName, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm font-bold hover:text-black active:scale-90 transition-all text-sm"
                                >
                                  +
                                </button>
                              </div>
                           </div>

                           {/* Total & Remove */}
                           <div className="flex flex-col items-end gap-1">
                              <span className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                              <div className="flex items-center gap-3">
                                 <p className="font-black text-sm text-gray-900">
                                   {settings?.currencySymbol || '$'}{(item.price * item.quantity).toFixed(0)}
                                 </p>
                                 <button
                                   onClick={() => removeItem(item.id, item.variantName)}
                                   className="p-1 text-gray-300 hover:text-red-500 transition-all"
                                   title="Remove item"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                   <button
                     onClick={clearCart}
                     className="text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                   >
                     Clear Cart
                   </button>
                </div>
              </div>
            </div>

            {/* Order Summary / Sticky Sidebar */}
            <div className="lg:col-span-4 sticky top-24 pb-10 md:pb-0">
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl shadow-black/5 border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-gray-100 pb-3">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-gray-500 font-medium text-xs">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">{settings?.currencySymbol || '$'}{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 font-medium text-xs">
                    <span>Shipping</span>
                    <span className="text-gray-400 italic text-[10px]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                    <div className="flex flex-col items-end">
                      <span className="text-xl md:text-2xl font-black text-black leading-none tracking-tighter">
                        {settings?.currencySymbol || '$'}{total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-text)' 
                  }}
                  className="w-full py-3 rounded-xl font-bold uppercase tracking-widest shadow-xl shadow-[var(--primary-accent)] hover:scale-[1.02] hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all text-[11px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Secure Checkout
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
