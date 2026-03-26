"use client";

import React, { useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          setIsLoading(false);
        });
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 font-bold">
        Product not found
      </div>
    );
  }

  return <ProductForm initialData={product} />;
}
