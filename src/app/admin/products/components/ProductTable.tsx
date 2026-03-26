"use client";

// ── ProductTable Component ────────────────────────────────────────
// Renders the product list in a styled table.
// Accepts products as a prop so the parent page controls data fetching.
// Emits onDelete callbacks so the parent can refresh the list after deletion.

import React, { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "../actions";
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  currencySymbol?: string;
  onDeleted: () => void; // Parent refreshes list after deletion
}

export default function ProductTable({
  products,
  currencySymbol = "৳",
  onDeleted,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setDeletingId(id);
    const result = await deleteProduct(id);
    setDeletingId(null);

    if (result?.success) {
      toast.success(`"${name}" deleted.`);
      onDeleted();
    } else {
      toast.error(result?.message ?? "Failed to delete.");
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-20 flex flex-col items-center gap-4 text-center">
        <Package size={48} className="text-gray-200" />
        <p className="font-bold text-gray-500">No products yet</p>
        <p className="text-sm text-gray-400">Click "Add Product" to create your first listing.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        {/* Sticky header */}
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50/80 backdrop-blur border-b border-gray-100">
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-9 h-9 object-contain"
                        />
                      ) : (
                        <Package size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate max-w-[180px] mt-0.5">
                        {product.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category badge */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
                    {product.category || "—"}
                  </span>
                </td>

                {/* Price with optional strikethrough */}
                <td className="px-6 py-4">
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
                <td className="px-6 py-4">
                  {product.stock !== undefined ? (
                    <span className={`text-xs font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {product.stock > 0 ? product.stock : "Out of stock"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-black transition-all border border-transparent hover:border-gray-100 flex items-center justify-center"
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100 disabled:opacity-40"
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
