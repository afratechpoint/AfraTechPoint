"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Target, ShieldCheck, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import { useUI } from "@/lib/ui";

export default function AboutPage() {
  const { openCart } = useUI();
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        
        <Navbar 
          searchEnabled={false} 
          onOpenCart={openCart} 
        />

        {/* Hero Section */}
        <section className="mb-12 md:mb-24">
          <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl bg-gray-900">
            <img 
              src="/images/about_hero.png" 
              alt="Innovation Lab" 
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-white/20"
              >
                Since 2024
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 md:mb-6 uppercase leading-tight"
              >
                CRAFTING <br className="md:hidden"/>THE FUTURE.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/70 text-sm md:text-lg max-w-2xl font-medium"
              >
                Afra Tech Point isn't just a gadget store; it's a bridge between humanity and the technology of tomorrow.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-20 md:mb-32 px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-3 md:mb-4 inline-block">Our Mission</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight tracking-tight uppercase">EMPOWERING <br/>EVERYONE.</h2>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              We started with a simple vision: to make high-end technology accessible and understandable. Technology should be a tool that enhances life, not a barrier that complicates it. Our team works tirelessly to curate the finest gadgets that blend performance with premium design.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-[2rem] p-10 border border-gray-100"
          >
            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: <ShieldCheck className="text-green-500" />, title: "Trusted Quality", desc: "Every product is tested for performance and durability." },
                { icon: <Zap className="text-yellow-500" />, title: "Cutting Edge", desc: "We bring the future to your doorstep before anywhere else." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">What Drives Us.</h2>
            <p className="text-gray-500 text-sm font-medium">Core principles that define Afra Tech Point.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="text-blue-500" />, title: "Innovation", desc: "Constant search for the next big thing in tech." },
              { icon: <Users className="text-purple-500" />, title: "Customer First", desc: "Your experience is our top priority." },
              { icon: <ShieldCheck className="text-green-500" />, title: "Elegance", desc: "Design-conscious products that look as good as they work." }
            ].map((value, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-black mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-tight">{value.title}</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="bg-black rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 tracking-tight z-10 relative">Ready to Experience <br className="hidden md:block"/> the Future?</h2>
            <Link 
              href="/shop"
              className="bg-white text-black px-8 md:px-12 py-4 md:py-6 rounded-2xl font-black text-xs md:text-sm inline-flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl z-10 relative group uppercase tracking-[0.2em]"
            >
              Start Shopping
              <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
            </Link>
          </div>
        </section>

      </div>

      <Footer />
      {/* CartSidebar is now managed by global UI state in layout.tsx, but some pages might still need to trigger it if not through navbar */}
    </div>
  );
}
