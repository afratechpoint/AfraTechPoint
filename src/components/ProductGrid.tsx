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
            <div className="w-8 h-[2px] bg-black"></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400 italic">Curated Tech</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase mb-3">THE <br className="md:hidden"/>COLLECTION.</h2>
          <p className="text-gray-400 mt-2 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            Explore our curated selection of high-end technology, combining futuristic aesthetics with unparalleled performance.
          </p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
           <button 
             onClick={() => setFilter('All')}
             className={cn(
                "px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
               filter === 'All' ? "bg-[var(--primary)] text-white" : "text-gray-400 hover:text-black"
             )}
           >
             All
           </button>
           {(settings.categories || []).map((cat: any) => (
             <button 
               key={cat.id}
               onClick={() => setFilter(cat.label)}
               className={cn(
                  "px-6 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                 filter === cat.label ? "bg-[var(--primary)] text-white" : "text-gray-400 hover:text-black"
               )}
             >
               {cat.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-10 auto-rows-fr">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 h-[300px] md:h-[400px] animate-pulse border border-gray-50 shadow-sm" />
          ))
        ) : filteredProducts.map((product, i) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative bg-white rounded-2xl md:rounded-[2.5rem] !p-0 md:!p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col h-full active:scale-[0.98] overflow-hidden"
          >
            {/* Image Container - Full Bleed on Mobile */}
            <Link href={`/shop/${product.id}`} className="block w-full !m-0 relative aspect-square bg-[#f8f9fa] md:rounded-[1.8rem] overflow-hidden md:m-1">
               <Image
                 src={product.image}
                 alt={product.name}
                 fill
                 priority={i < 4}
                 sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                 className="w-full h-full object-contain md:p-4 group-hover:scale-110 transition-transform duration-1000 ease-out"
               />
               {/* Sale Badge */}
               {product.salePrice && (
                 <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter z-10">
                   SALE
                 </div>
               )}
            </Link>

            <div className="flex flex-col flex-1 px-3 py-3 md:px-1">
               {/* Price Row First (AliExpress Pattern) */}
               <div className="flex items-baseline gap-1.5 mb-0.5">
                  <p className="text-sm md:text-xl font-black text-gray-900 leading-none">
                    {settings?.currencySymbol || '$'}{(product.salePrice || product.regularPrice || product.price || 0).toFixed(0)}
                  </p>
                  {product.salePrice && (
                    <span className="text-[9px] md:text-sm font-bold text-gray-300 line-through tracking-tighter">
                      {settings?.currencySymbol || '$'}{(product.regularPrice || product.price || 0).toFixed(0)}
                    </span>
                  )}
               </div>

               {/* Category & Title */}
               <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                 {product.category}
               </p>
               <Link href={`/shop/${product.id}`}>
                 <h3 className="text-[11px] md:text-sm font-black text-gray-800 group-hover:text-black transition-colors leading-tight line-clamp-2 md:line-clamp-1">
                   {product.name}
                 </h3>
               </Link>

               {/* Desktop Only Description */}
               <p className="hidden md:block text-xs text-gray-400 leading-relaxed font-medium mt-2 line-clamp-2">
                 {product.description}
               </p>

               {/* Desktop Buttons */}
               <div className="hidden md:flex items-center gap-2 pt-4 mt-auto">
                  <Link 
                    href={`/shop/${product.id}`}
                    className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-black rounded-xl text-[10px] font-bold text-center transition-all uppercase tracking-widest border border-gray-100"
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
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-text)' }}
                    className="flex-1 py-2.5 hover:bg-[var(--primary-hover)] rounded-xl text-[10px] font-bold text-center transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Add
                  </button>
               </div>

               {/* Mobile Minimalist Add to Cart (AliExpress Style) */}
               <div className="md:hidden flex justify-end mt-auto pt-2">
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
                    className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                 >
                   <Plus size={14} strokeWidth={3} />
                 </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
