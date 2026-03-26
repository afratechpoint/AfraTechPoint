"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, clearCart } = useCart();
  const settings = useSettings();
  const router   = useRouter();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag size={24} />
                Your Cart
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm">Start adding some premium tech items!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          {item.variantName && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.variantName}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.variantName)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Qty: {item.quantity}</p>
                      <p className="font-bold text-gray-900">{settings?.currencySymbol || '$'}{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 pb-12">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">{settings?.currencySymbol || '$'}{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)',
                  boxShadow: '0 20px 25px -5px var(--primary-accent)' 
                }}
                className="w-full py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full text-center mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
