"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, MessageSquare, 
  Clock, Globe, ChevronDown, CheckCircle2, AlertCircle,
  HelpCircle, ShieldCheck, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useUI } from "@/lib/ui";
import { useSettings } from "@/components/SettingsProvider";

// Mock FAQ Data
const FAQS = [
  {
    q: "How long does shipping usually take?",
    a: "Our standard delivery takes 2-3 business days within Dhaka, and 3-5 days outside Dhaka. You will receive a tracking link as soon as your order ships."
  },
  {
    q: "What is your return policy?",
    a: "We offer a hassle-free 7-day return policy for unused items in their original packaging. Please contact our support team to initiate a return request."
  },
  {
    q: "Do you offer international shipping?",
    a: "Currently, we only operate within Bangladesh, but we are actively working on expanding our delivery network internationally."
  },
  {
    q: "How can I track my order?",
    a: "You can track your order directly from your account page under the 'Orders' tab, or by clicking the tracking link sent to your email."
  }
];

export default function PremiumContactPage() {
  const { openCart } = useUI();
  const settings = useSettings();
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
      
      toast.success("Thank you! Your message has been sent successfully.");
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white flex flex-col">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8 mb-8">
        <Navbar searchEnabled={false} onOpenCart={openCart} />
      </div>

      {/* ── MAIN CONTENT LAYER ── */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pb-24">
        


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          
          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-400" />
                Send a Message
              </h2>

              {success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Message Received</h3>
                  <p className="text-gray-500 text-sm font-medium pb-6 max-w-sm">We've received your inquiry and sent a confirmation to your email. We'll be in touch soon.</p>
                  <button onClick={() => setSuccess(false)} className="px-5 py-2.5 bg-gray-50 border border-gray-200 hover:border-black text-sm text-gray-900 font-bold rounded-xl transition-all">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input 
                        name="name" required
                        className="w-full h-10 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-gray-900 focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input 
                        name="email" type="email" required
                        className="w-full h-10 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-gray-900 focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Message</label>
                    <textarea 
                      name="message" required rows={5}
                      className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-gray-900 focus:border-black focus:bg-white transition-all resize-none placeholder:text-gray-400"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-black text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Send Message <Send size={15} /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" /> Our Office
              </h3>
              <div className="space-y-4 text-sm font-medium text-gray-500">
                <p className="leading-relaxed whitespace-pre-line">
                  {settings?.contactAddress || "Afra Tech Point\nLevel 4, Innovation Tower\n123 Tech Drive, Gulshan-2\nDhaka 1212, Bangladesh"}
                </p>
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <a href={`mailto:${settings?.contactEmail || "info@afratechpoint.shop"}`} className="flex items-center gap-3 hover:text-black transition-colors">
                    <Mail size={15} /> {settings?.contactEmail || "info@afratechpoint.shop"}
                  </a>
                  <a href={`tel:${settings?.contactPhone || "+880 1XXXXXXXXX"}`} className="flex items-center gap-3 hover:text-black transition-colors">
                    <Phone size={15} /> {settings?.contactPhone || "+880 1XXXXXXXXX"}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Business Hours
              </h3>
              <div className="space-y-3 text-sm font-medium text-gray-500 whitespace-pre-line">
                {settings?.businessHours || "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 5:00 PM\nSunday: Closed"}
              </div>
            </div>

          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm font-medium">Quick answers to common questions</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                  <button
                    onClick={() => setActiveFaq(isActive ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between outline-none hover:bg-gray-50"
                  >
                    <span className="text-sm font-bold text-left pr-4 text-gray-900">
                      {faq.q}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-5 pb-5 text-gray-500 tracking-tight text-sm font-medium leading-relaxed border-t border-gray-50 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
