"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, ShoppingCart, Filter, ArrowRight, X, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";
import { Suspense } from "react";
import PremiumLoader from "@/components/PremiumLoader";

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

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
    const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortOrder, setSortOrder] = useState("default");
  
  const { addItem } = useCart();

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    result = result.filter(p => (p.salePrice || p.regularPrice || p.price || 0) <= maxPrice);

    if (sortOrder === "price-asc") {
      result.sort((a, b) => (a.salePrice || a.regularPrice || a.price || 0) - (b.salePrice || b.regularPrice || b.price || 0));
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => (b.salePrice || b.regularPrice || b.price || 0) - (a.salePrice || a.regularPrice || a.price || 0));
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, maxPrice, sortOrder, products]);

  const settings = useSettings();
  const categories = ["All", ...(settings.categories?.map((c: any) => c.label) || ["Audio", "Wearables", "Laptops", "Smart Home"])];

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        
        <Navbar 
          searchEnabled={true} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        {/* Shop Header / Top Bar Filters */}
        <header className="mb-4 mt-4 md:mb-6 md:mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           {/* Mobile Filter Trigger */}
           <div className="flex justify-end md:hidden">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-xs font-bold shadow-xl shadow-black/10 active:scale-95 transition-all w-full justify-center"
              >
                <Filter size={14} />
                Filters & Refine
              </button>
           </div>

           {/* Desktop Top Bar Filters */}
           <div className="hidden md:flex items-center justify-between w-full">
             {/* Categories */}
             <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                          "px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap",
                          selectedCategory === cat 
                            ? "bg-black text-white shadow-md shadow-black/10" 
                            : "bg-transparent text-gray-500 hover:bg-white hover:text-black hover:shadow-sm"
                      )}
                    >
                      {cat}
                    </button>
                ))}
             </div>

             {/* Sort Dropdown & Settings */}
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort By</span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-xs font-bold text-black py-2.5 pl-4 pr-10 rounded-xl cursor-pointer outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
                  >
                    <option value="default">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
             </div>
           </div>
        </header>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 z-[200] md:hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[85vh]"
              >
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Refine Results</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-gray-50 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              // Keep open for better UX if they want to tune multiple filters
                            }}
                            className={cn(
                                "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                                selectedCategory === cat 
                                  ? "bg-black text-white border-black shadow-lg" 
                                  : "bg-gray-50 text-gray-500 border-gray-50"
                            )}
                          >
                            {cat}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price Range</h4>
                      <span className="text-sm font-bold text-black">{settings?.currencySymbol || '$'}{maxPrice}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="2000" 
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-black h-1.5 bg-gray-100 rounded-full appearance-none"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-3">
                      <span>{settings?.currencySymbol || '$'}0</span>
                      <span>{settings?.currencySymbol || '$'}2000+</span>
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Sort By</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "default", label: "Recommended" },
                        { id: "price-asc", label: "Price: Low to High" },
                        { id: "price-desc", label: "Price: High to Low" }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortOrder(option.id)}
                          className={cn(
                            "text-left px-5 py-4 rounded-xl text-xs font-bold transition-all border",
                            sortOrder === option.id 
                              ? "bg-black text-white border-black" 
                              : "bg-gray-50 text-gray-500 border-gray-50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-5 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/20"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4 mt-2 md:mt-4 relative w-full">
          
          {/* Products Grid */}
          <main className="w-full">
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8 auto-rows-fr">
              {isLoading ? (
                 [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 h-[300px] md:h-[400px] animate-pulse border border-gray-100" />
                 ))
              ) : filteredProducts.length > 0 ? (
                 filteredProducts.map((product, i) => (
                      <motion.div
                         key={product.id}
                         layout
                         initial={{ opacity: 0, y: 30 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         transition={{ duration: 0.4, delay: i * 0.05 }}
                         className="group relative bg-white rounded-2xl md:rounded-[2.5rem] !p-0 md:!p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col h-full active:scale-[0.98] overflow-hidden"
                      >
                         {/* Image Container - AliExpress Style */}
                         <Link href={`/shop/${product.id}`} className="block w-full !m-0 relative aspect-square bg-[#f8f9fa] md:rounded-[1.8rem] overflow-hidden transition-all duration-700 md:m-1">
                            <img
                               src={product.image}
                               alt={product.name}
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
                                 className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-[10px] font-bold text-center transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
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
                   ))
              ) : (
                 <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-bold text-lg">No products found for this category or search.</p>
                 </div>
              )}
             </div>
          </main>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<PremiumLoader />}>
      <ShopContent />
    </Suspense>
  );
}
