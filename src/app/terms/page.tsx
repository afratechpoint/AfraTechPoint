"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Book, Bookmark, CreditCard, UserCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useUI } from "@/lib/ui";

export default function TermsPage() {
  
  const sections = [
    {
      id: "intro",
      icon: <Book size={20} className="text-blue-500" />,
      title: "Introduction",
      content: "Welcome to Afra Tech Point. These Terms & Conditions govern your use of our website and purchase of our premium tech products. By accessing this site, you agree to abide by these rules in full."
    },
    {
      id: "account",
      icon: <UserCheck size={20} className="text-purple-500" />,
      title: "User Accounts",
      content: "When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      id: "payment",
      icon: <CreditCard size={20} className="text-green-500" />,
      title: "Payments & Pricing",
      content: "All prices are listed in USD. We reserve the right to change prices at any time without notice. Payments are processed securely via our trusted payment partners. Tax and shipping costs will be calculated at checkout."
    },
    {
      id: "intellectual",
      icon: <Shield size={20} className="text-red-500" />,
      title: "Intellectual Property",
      content: "The content on this website, including designs, logos, and product imagery, is owned by Afra Tech Point or its licensors. You may not reproduce, distribute, or create derivative works without explicit permission."
    },
    {
      id: "returns",
      icon: <Bookmark size={20} className="text-orange-500" />,
      title: "Returns & Refunds",
      content: "We offer a 30-day return policy for unused items in their original packaging. Refunds are processed within 7-10 business days of receiving the returned goods. Digital products are non-refundable."
    },
    {
      id: "contact",
      icon: <HelpCircle size={20} className="text-teal-500" />,
      title: "Support & Contact",
      content: "If you have any questions regarding these terms, please contact our legal team at legal@afratech.com or through our Contact Us page."
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        <Navbar 
          searchEnabled={false} 
          
        />

        <main className="py-20 max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-gray-50 rounded-full text-black text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-gray-100"
            >
              Legal Documents
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-6 uppercase"
            >
              TERMS & <br className="md:hidden" /> CONDITIONS.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg font-medium"
            >
              Last Updated: March 17, 2026
            </motion.p>
          </section>

          {/* Content Sections */}
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50/50 rounded-[2.5rem] p-10 md:p-14 border border-gray-100 hover:bg-white hover:border-black/5 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-700"
              >
                <div className="flex flex-col md:flex-row gap-10 md:gap-14">
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight italic">
                      {idx + 1}. {section.title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-[1.8] font-medium italic">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          {/* Acceptance Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-12 bg-black rounded-[3rem] text-center text-white"
          >
             <h3 className="text-3xl font-bold mb-6 tracking-tight">Ready to start shopping?</h3>
             <p className="text-gray-400 font-medium mb-10 max-w-md mx-auto italic">
                By continuing to browse our shop, you accept these terms and our premium service standards.
             </p>
             <Link 
              href="/shop" 
              className="inline-flex h-14 px-10 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest items-center hover:scale-110 transition-transform"
             >
                Enter Shop
             </Link>
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
