"use client";

// ── Admin Products List Page ──────────────────────────────────────
// Fetches all products and renders them via the ProductTable component.
// Provides search/filter and a link to the Add Product page.

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import ProductTable from "./components/ProductTable";
import { Product } from "./types";
import { authenticatedFetch } from "@/lib/api-helper";

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [filtered, setFiltered]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery]         = useState("");
  const settings = useSettings();

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await authenticatedFetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setFiltered(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Search filter (client-side) ────────────────────────────────
  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
      );
    }
  }, [query, products]);

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-72">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none bg-white text-sm"
          />
        </div>

        {/* Stats pill */}
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">
          {filtered.length} of {products.length} products
        </span>

        {/* Add product CTA */}
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        // Skeleton loader — matches table layout
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-20" />
                <div className="h-3 bg-gray-100 rounded-full w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ProductTable
          products={filtered}
          currencySymbol={settings?.currencySymbol ?? "৳"}
          onDeleted={fetchProducts}
        />
      )}
    </div>
  );
}
