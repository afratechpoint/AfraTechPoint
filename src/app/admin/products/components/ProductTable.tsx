"use client";

// ── ProductTable Component ────────────────────────────────────────
// Renders the product list in a styled table with responsive horizontal scrolling.
// Accepts products as a prop so the parent page controls data fetching.
// Emits onDelete callbacks so the parent can refresh the list after deletion.

import React, { useState, useCallback } from "react";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Link from "next/link";
import { Edit2, Trash2, Package, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-helper";
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  currencySymbol?: string;
  onDeleted: () => void;
}

export default function ProductTable({
  products,
  currencySymbol = "৳",
  onDeleted,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;

    setDeletingId(id);
    try {
      const res = await authenticatedFetch(`/api/products/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result?.success) {
        toast.success(`"${name}" deleted.`);
        setDeleteTarget(null);
        onDeleted();
      } else {
        toast.error(result?.error ?? "Failed to delete.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
    setDeletingId(null);
  }, [deleteTarget, onDeleted]);

  const handleCopyUrl = (id: string, name: string) => {
    const url = `${window.location.origin}/shop/${id}`;
    navigator.clipboard.writeText(url);
    toast.success(`Link for "${name}" copied to clipboard!`);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm p-16 sm:p-20 flex flex-col items-center gap-4 text-center">
        <Package size={48} className="text-gray-200" />
        <p className="font-bold text-gray-500">No products yet</p>
        <p className="text-sm text-gray-400">Click &quot;Add Product&quot; to create your first listing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isDeleting={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => { if (!deletingId) setDeleteTarget(null); }}
      />

      {/* Desktop / Tablet Table View (with horizontal scroll if needed) */}
      <div className="hidden md:block bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[680px]">
            {/* Sticky header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/80 backdrop-blur border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const activePrice = product.salePrice ?? product.regularPrice ?? product.price ?? 0;
                const isDeleting = deletingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50/50 transition-colors group ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    {/* Image + Name + Description */}
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px] mt-0.5">
                            {product.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category badge */}
                    <td className="px-4 py-4 text-left whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                        {product.category || "—"}
                      </span>
                    </td>

                    {/* Price with optional strikethrough */}
                    <td className="px-4 py-4 text-left whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {currencySymbol}{activePrice.toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {currencySymbol}{(product.regularPrice ?? 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-4 text-left whitespace-nowrap">
                      {product.stock !== undefined ? (
                        <span className={`text-xs font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                          {product.stock > 0 ? product.stock : "Out of stock"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyUrl(product.id, product.name)}
                          className="p-1.5 sm:p-2 bg-gray-50 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all border border-gray-100"
                          title="Copy product link"
                        >
                          <Copy size={15} />
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 sm:p-2 bg-gray-50 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-black transition-all border border-gray-100"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                          disabled={isDeleting}
                          className="p-1.5 sm:p-2 bg-gray-50 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all border border-gray-100 disabled:opacity-40"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden space-y-3.5">
        {products.map((product) => {
          const activePrice = product.salePrice ?? product.regularPrice ?? product.price ?? 0;
          const isDeleting = deletingId === product.id;

          return (
            <div 
              key={product.id} 
              className={cn(
                "bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3.5 transition-all",
                isDeleting && "opacity-40 pointer-events-none"
              )}
            >
              <div className="flex gap-3.5">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Package size={22} className="text-gray-300" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</p>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold shrink-0">
                        {product.category || "—"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium truncate mt-1">
                      {product.description || "No description"}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900">
                        {currencySymbol}{activePrice.toFixed(2)}
                      </span>
                      {product.salePrice && (
                        <span className="text-[9px] text-gray-400 line-through">
                          {currencySymbol}{(product.regularPrice ?? 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.stock !== undefined && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                        product.stock > 0 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
                      )}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleCopyUrl(product.id, product.name)}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-100 hover:text-blue-600 transition-all border border-gray-100"
                  title="Copy product link"
                >
                  <Copy size={16} />
                </button>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 h-10 bg-gray-50 text-gray-900 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <Edit2 size={14} /> Edit Product
                </Link>
                <button
                  onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                  disabled={isDeleting}
                  className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 border border-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
