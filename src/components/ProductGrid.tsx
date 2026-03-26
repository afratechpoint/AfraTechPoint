"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, ShoppingCart, Search, X, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  regularPrice: number;
  salePrice?: number;
  price?: number; // Legacy support
  category: string;
  image: string;
  description: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const settings = useSettings();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      });
  }, []);

  return (
    <section id="shop" className="py-24 max-w-[1400px] mx-auto px-4 sm:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-[2px] bg-black"></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400 italic">Curated Tech</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase mb-3">THE <br className="md:hidden"/>COLLECTION.</h2>
          <p className="text-gray-400 mt-2 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            Explore our curated selection of high-end technology, combining futuristic aesthetics with unparalleled performance.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
           <button className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-2xl text-xs font-bold transition-all">All</button>
           <button className="px-6 py-2.5 text-gray-400 hover:text-black rounded-2xl text-xs font-bold transition-all">Audio</button>
           <button className="px-6 py-2.5 text-gray-400 hover:text-black rounded-2xl text-xs font-bold transition-all">Wearables</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 auto-rows-fr">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-6 h-[400px] animate-pulse border border-gray-100" />
          ))
        ) : products.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="group relative bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-700 flex flex-col h-full"
          >
            <Link href={`/shop/${product.id}`} className="block relative aspect-square mb-5 bg-[#f8f9fa] rounded-[1.5rem] overflow-hidden group-hover:scale-[0.98] transition-transform duration-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
            </Link>

            <div className="space-y-1.5 flex flex-col flex-1 px-1">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   {product.category}
                 </p>
                 <div className="flex flex-col items-end">
                   {product.salePrice && (
                     <span className="text-[10px] font-bold text-gray-300 line-through tracking-tighter mb-0.5">
                       {settings?.currencySymbol || '$'}{(product.regularPrice || product.price || 0).toFixed(0)}
                     </span>
                   )}
                   <p className="text-base md:text-lg font-bold text-gray-900 leading-none">
                     {settings?.currencySymbol || '$'}{(product.salePrice || product.regularPrice || product.price || 0).toFixed(0)}
                   </p>
                 </div>
               </div>
               <Link href={`/shop/${product.id}`}>
                 <h3 className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors leading-tight">
                   {product.name}
                 </h3>
               </Link>
               <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium mt-1">
                 {product.description}
               </p>

               <div className="flex items-center gap-2 pt-4 mt-auto">
                  <Link 
                    href={`/shop/${product.id}`}
                    className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-black rounded-xl text-[10px] font-bold text-center transition-all uppercase tracking-widest border border-gray-100"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.salePrice || product.regularPrice || product.price || 0,
                        image: product.image,
                        quantity: 1
                      });
                      toast.success(`${product.name} added to cart!`);
                    }}
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-text)'
                    }}
                    className="flex-1 py-2.5 hover:bg-[var(--primary-hover)] rounded-xl text-[10px] font-bold text-center transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                  >
                    Add to Cart
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
