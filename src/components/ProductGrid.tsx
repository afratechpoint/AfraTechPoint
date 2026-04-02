"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Search, X, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


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
  const [filter, setFilter] = useState('All');
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

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter((p: Product) => p.category === filter);

  return (
    <section id="shop" className="py-6 md:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-[2px] bg-black" aria-hidden="true"></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Curated Tech</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase mb-3">THE <br className="md:hidden"/>COLLECTION.</h2>
          <p className="text-gray-500 mt-2 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            Explore our curated selection of high-end technology, combining futuristic aesthetics with unparalleled performance.
          </p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
           <button 
             onClick={() => setFilter('All')}
             aria-pressed={filter === 'All'}
             className={cn(
                "px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
               filter === 'All' ? "bg-[var(--primary)] text-white" : "text-gray-500 hover:text-black"
             )}
           >
             All
           </button>
           {(settings.categories || []).map((cat: any) => (
             <button 
               key={cat.id}
               onClick={() => setFilter(cat.label)}
               aria-pressed={filter === cat.label}
               className={cn(
                  "px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                 filter === cat.label ? "bg-[var(--primary)] text-white" : "text-gray-500 hover:text-black"
               )}
             >
               {cat.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-[280px] md:h-[380px] animate-pulse border border-gray-100" />
          ))
        ) : filteredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative bg-white rounded-2xl border border-gray-100/80 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300 flex flex-col overflow-hidden active:scale-[0.98]"
          >
            {/* Image */}
             <Link href={`/shop/${product.id}`} className="relative aspect-square bg-gray-50 overflow-hidden">
                <Image
                  src={`${product.image}?tr=w-300,f-auto,q-80`}
                  alt={product.name || "Product image"}
                  fill
                  unoptimized={true}
                  priority={i < 4}
                  // @ts-ignore
                  fetchpriority={i < 4 ? "high" : "low"}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-3 md:p-6 group-hover:scale-105 transition-transform duration-700 ease-out text-[10px] text-gray-400 font-medium break-all text-center flex items-center justify-center"
                />
               {product.salePrice && (
                 <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider z-10">
                   SALE
                 </div>
               )}
            </Link>

            {/* Info */}
            <div className="flex flex-col flex-1 p-2.5 md:p-3.5">
               <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
                 {product.category}
               </p>
               <Link href={`/shop/${product.id}`}>
                 <h3 className="text-[11px] md:text-[13px] font-black text-gray-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-black">
                   {product.name}
                 </h3>
               </Link>

               <div className="flex items-baseline gap-1.5 mt-auto mb-2.5">
                  <p className="text-sm md:text-base font-black text-gray-900">
                    {settings?.currencySymbol || '৳'}{(product.salePrice || product.regularPrice || product.price || 0).toFixed(0)}
                  </p>
                  {product.salePrice && (
                    <span className="text-[9px] md:text-xs font-bold text-gray-300 line-through">
                      {settings?.currencySymbol || '৳'}{(product.regularPrice || product.price || 0).toFixed(0)}
                    </span>
                  )}
               </div>

               {/* Desktop Description */}
               <p className="hidden md:block text-[10px] text-gray-400 leading-relaxed mb-3 line-clamp-2">
                 {product.description?.length > 80 ? `${product.description.substring(0, 80)}...` : (product.description || "")}
               </p>

               {/* Add Button */}
               <div className="flex items-center gap-2 mt-auto">
                  <Link 
                    href={`/shop/${product.id}`}
                    className="hidden md:flex flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-black rounded-xl text-[9px] font-black text-center transition-all uppercase tracking-widest items-center justify-center border border-gray-100"
                  >
                    Details
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.salePrice || product.regularPrice || product.price || 0,
                        image: product.image,
                        quantity: 1
                      });
                      toast.success(`${product.name} added to cart!`);
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-text)' }}
                    className="hidden md:flex flex-1 py-2 rounded-xl text-[9px] font-black text-center transition-all uppercase tracking-widest items-center justify-center gap-1 shadow-sm hover:opacity-90"
                  >
                    <Plus size={11} strokeWidth={3} aria-hidden="true" /> Add
                  </button>
                  {/* Mobile Add Button */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.salePrice || product.regularPrice || product.price || 0,
                        image: product.image,
                        quantity: 1
                      });
                      toast.success(`${product.name} added!`);
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    className="md:hidden ml-auto w-7 h-7 bg-black text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                 >
                   <Plus size={13} strokeWidth={3} aria-hidden="true" />
                 </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
