"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Order?",
  message = "Are you sure you want to delete this order? This action cannot be undone and will remove it from the system entirely.",
  isDeleting
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden relative border border-gray-100"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>

          <div className="p-8 pt-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              {message}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="h-12 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="h-12 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Delete Now"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
