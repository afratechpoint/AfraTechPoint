"use client";
// Tags feature added — supports SEO keywords & related products

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2, Tag, X } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
  useMainPrice?: boolean;
}

interface Product {
  id: string;
  name: string;
  regularPrice: number;
  salePrice?: number;
  category: string;
  image: string;
  gallery?: string[];
  aboutItem?: string;
  description: string;
  specifications?: { label: string; value: string }[];
  price?: number; // Deprecated: Use regularPrice/salePrice
  variants?: Variant[];
  tags?: string[];
}

interface ProductFormProps {
  initialData?: Product | null;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const settings = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(initialData?.image || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickingFor, setPickingFor] = useState<"main" | "gallery" | number>("main");
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || []);
  const [newVariantName, setNewVariantName] = useState("");
  const [regularPrice, setRegularPrice] = useState<number>(initialData?.regularPrice || initialData?.price || 0);
  const [salePrice, setSalePrice] = useState<number | undefined>(initialData?.salePrice);
  
  // Safe init for specifications which may be string or array due to previous structure
  const [specs, setSpecs] = useState<{label: string, value: string}[]>(
    Array.isArray((initialData as any)?.specifications) ? (initialData as any).specifications : []
  );

  // Tags state
  const [tags, setTags] = useState<string[]>(Array.isArray((initialData as any)?.tags) ? (initialData as any).tags : []);
  const [tagInput, setTagInput] = useState("");

  const addTag = (raw: string) => {
    const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF\s_-]/gi, "");
    if (cleaned && !tags.includes(cleaned)) {
      setTags(prev => [...prev, cleaned]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  // Sync variants when regularPrice/salePrice changes
  useEffect(() => {
    setVariants(prev => prev.map(v => 
      v.useMainPrice ? { ...v, regularPrice, salePrice } : v
    ));
  }, [regularPrice, salePrice]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setAvailableCategories(data.categories);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const method = initialData ? "PUT" : "POST";
    const url = initialData ? `/api/products/${initialData.id}` : "/api/products";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          regularPrice: parseFloat(data.regularPrice as string),
          salePrice: data.salePrice ? parseFloat(data.salePrice as string) : undefined,
          variants,
          gallery,
          specifications: specs,
          tags,
        }),
      });

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to save product", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialData ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">
              {initialData ? `ID: ${initialData.id}` : "Create a new catalog entry"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
            <input
              name="name"
              defaultValue={initialData?.name}
              required
              placeholder="e.g. Sony WH-1000XM5"
              className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-blue-600">Dynamic Category</label>
              <select
                name="category"
                defaultValue={initialData?.category}
                required
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold cursor-pointer appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {availableCategories.length > 0 ? (
                  availableCategories.map(cat => (
                    <option key={cat.id || cat.slug} value={cat.label || cat}>
                      {cat.label || cat}
                    </option>
                  ))
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Regular Price ({settings?.currencySymbol || '$'})</label>
              <input 
                type="number"
                name="regularPrice"
                value={regularPrice}
                onChange={(e) => setRegularPrice(parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
                className="w-full h-12 pl-4 pr-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-green-600">Sale Price (Optional)</label>
              <input 
                type="number"
                name="salePrice"
                value={salePrice || ""}
                onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full h-12 pl-4 pr-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold text-green-600" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <ImageIcon size={12} /> Product Images
            </label>
            
            <div className="flex flex-col md:flex-row bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden h-auto md:h-32">
              {/* Main image — left fixed panel */}
              <div 
                onClick={() => {
                  setPickingFor("main");
                  setIsMediaPickerOpen(true);
                }}
                className={cn(
                  "relative w-full md:w-32 h-32 md:h-full shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-1",
                )}
              >
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-contain p-3" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">Change</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImage(""); }}
                        className="mt-1 h-5 px-2 rounded bg-red-500 text-white text-[8px] font-bold uppercase flex items-center gap-0.5"
                      >
                        <Trash2 size={8} /> Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-black transition-colors">
                    <Plus size={18} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Main Image</span>
                  </div>
                )}
              </div>

              {/* Gallery — right flexible panel */}
              <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gallery Photos</p>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPickingFor("gallery");
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-[9px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-all"
                  >
                    <Plus size={9} /> Add
                  </button>
                </div>
                {gallery.length > 0 ? (
                  <div className="flex flex-wrap gap-2 overflow-y-auto">
                    {gallery.map((gImg, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group">
                        <img src={gImg} className="w-full h-full object-contain p-1.5" />
                        <button 
                          type="button"
                          onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all z-10 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-white">
                    <p className="text-[9px] font-medium text-gray-400">Click "Add" to upload extra photos</p>
                  </div>
                )}
              </div>
            </div>
            <input type="hidden" name="image" value={image} required />
          </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">About This Item</label>
            <textarea 
              name="aboutItem" 
              defaultValue={initialData?.aboutItem} 
              placeholder="Short catchy summary displayed immediately below the price & variants"
              className="w-full h-24 p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none leading-relaxed whitespace-pre-line" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Description</label>
            <textarea 
              name="description" 
              defaultValue={initialData?.description} 
              required 
              placeholder="Detailed product overview for the robust description tab..."
              className="w-full h-32 p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none leading-relaxed whitespace-pre-line" 
            />
          </div>

          {/* ── Tags ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={11} /> Tags
                {tags.length > 0 && <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-[9px] font-black">{tags.length}</span>}
              </label>
              <span className="text-[9px] text-gray-300 font-medium">Press Enter or comma to add</span>
            </div>

            <div className="min-h-[48px] flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-black transition-all cursor-text"
              onClick={(e) => { (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus(); }}
            >
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full shrink-0">
                  #{tag}
                  <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="hover:text-red-300 transition-colors leading-none">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={tags.length === 0 ? "e.g. smartphone, wireless, android..." : ""}
                className="flex-1 min-w-[160px] bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300"
              />
            </div>

            {tags.length > 0 && (
              <p className="text-[9px] text-gray-300 font-medium ml-1">
                {tags.length} tag{tags.length > 1 ? 's' : ''} · Used for SEO & related products
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specifications / Features</label>
              <button 
                type="button" 
                onClick={() => setSpecs([...specs, { label: "", value: "" }])}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-all"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
            
            {specs.length > 0 ? (
              <div className="space-y-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="w-full flex gap-2">
                      <input 
                        placeholder="Type (e.g. Warranty)"
                        value={s.label}
                        onChange={(e) => {
                           const newSpecs = [...specs];
                           newSpecs[i].label = e.target.value;
                           setSpecs(newSpecs);
                        }}
                        className="flex-[1] min-w-0 h-10 px-3 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold bg-white"
                      />
                      <input 
                        placeholder="Value (e.g. 2 Years)"
                        value={s.value}
                        onChange={(e) => {
                           const newSpecs = [...specs];
                           newSpecs[i].value = e.target.value;
                           setSpecs(newSpecs);
                        }}
                        className="flex-[2] min-w-0 h-10 px-3 rounded-lg border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-medium bg-white"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}
                      className="w-full md:w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 bg-white md:bg-transparent border md:border-none border-gray-100"
                    >
                      <Trash2 size={16} />
                      <span className="md:hidden text-xs font-bold ml-2">Remove Row</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <p className="text-xs font-medium text-gray-500">No specifications added. Click "Add Row" to start.</p>
                </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Advanced Variants</label>
              <p className="text-[9px] text-gray-400 italic">Add specific prices & images for different versions</p>
            </div>

            <div className="flex gap-2">
              <input 
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder="Variant Name (e.g. Red, Blue, XL)"
                className="flex-1 h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newVariantName.trim()) {
                      setVariants([...variants, { id: Date.now().toString(), name: newVariantName.trim() }]);
                      setNewVariantName("");
                    }
                  }
                }}
              />
              <button 
                type="button"
                onClick={() => {
                  if (newVariantName.trim()) {
                    setVariants([...variants, { id: Date.now().toString(), name: newVariantName.trim() }]);
                    setNewVariantName("");
                  }
                }}
                className="h-12 px-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variants.map((v, i) => (
                <div key={v.id} className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-black transition-all overflow-hidden flex flex-col">
                  {/* Top: Image & Price */}
                  <div className="p-4 flex gap-4 items-center bg-gray-50/50">
                    <div 
                      onClick={() => {
                        setPickingFor(i);
                        setIsMediaPickerOpen(true);
                      }}
                      className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden shrink-0 shadow-sm"
                    >
                      {v.image ? (
                        <img src={v.image} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-300">
                          <ImageIcon size={18} />
                          <span className="text-[7px] font-bold uppercase tracking-widest">Add</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Price Override</label>
                        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => {
                          const updated = [...variants];
                          updated[i].useMainPrice = !v.useMainPrice;
                          if (updated[i].useMainPrice) {
                            updated[i].regularPrice = regularPrice;
                            updated[i].salePrice = salePrice;
                          }
                          setVariants(updated);
                        }}>
                          <div className={cn(
                            "w-3 h-3 rounded border flex items-center justify-center transition-all",
                            v.useMainPrice ? "bg-black border-black" : "bg-white border-gray-200"
                          )}>
                            {v.useMainPrice && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tight">Main Price</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[7px] font-bold text-gray-400 uppercase tracking-tight ml-1">Regular</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">{settings?.currencySymbol || '$'}</span>
                            <input 
                              type="number"
                              placeholder="Reg."
                              disabled={v.useMainPrice}
                              className={cn(
                                "w-full h-8 pl-5 pr-2 rounded-lg border-none ring-1 outline-none transition-all text-[10px] font-bold",
                                v.useMainPrice ? "bg-gray-100 ring-gray-100 text-gray-400" : "bg-white ring-gray-100 focus:ring-2 focus:ring-black"
                              )}
                              value={v.regularPrice || ""}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].regularPrice = e.target.value ? parseFloat(e.target.value) : undefined;
                                setVariants(updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] font-bold text-green-600 uppercase tracking-tight ml-1">Sale</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400">{settings?.currencySymbol || '$'}</span>
                            <input 
                              type="number"
                              placeholder="Sale"
                              disabled={v.useMainPrice}
                              className={cn(
                                "w-full h-8 pl-5 pr-2 rounded-lg border-none ring-1 outline-none transition-all text-[10px] font-bold text-green-600",
                                v.useMainPrice ? "bg-gray-100 ring-gray-100 text-green-400" : "bg-white ring-gray-100 focus:ring-2 focus:ring-black"
                              )}
                              value={v.salePrice || ""}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].salePrice = e.target.value ? parseFloat(e.target.value) : undefined;
                                setVariants(updated);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Name / Color / Type */}
                  <div className="p-4 pt-3 border-t border-gray-50">
                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Label / Color / Type</label>
                    <input 
                      className="w-full h-8 px-3 rounded-lg bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-[11px] font-bold text-gray-900"
                      placeholder="e.g. Space Grey"
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i].name = e.target.value;
                        setVariants(updated);
                      }}
                    />
                  </div>

                  {/* Remove Button */}
                  <button 
                    type="button"
                    onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 transition-all z-10 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row gap-4">
            <Link 
              href="/admin/products"
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] h-12 rounded-xl bg-black text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                 <Loader2 size={18} className="animate-spin" />
              ) : (
                 <Save size={18} />
              )}
              {initialData ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      <MediaPickerModal 
        isOpen={isMediaPickerOpen}
        multiSelect={pickingFor === "gallery"}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setPickingFor("main");
        }}
        onSelect={(url) => {
          if (pickingFor === "main") {
            setImage(url);
          } else if (pickingFor === "gallery") {
            setGallery(prev => [...prev, url]);
          } else if (typeof pickingFor === "number") {
            const updated = [...variants];
            updated[pickingFor].image = url;
            setVariants(updated);
          }
          setIsMediaPickerOpen(false);
        }}
        onSelectMultiple={(urls) => {
          if (pickingFor === "gallery") {
            setGallery(prev => {
              const existingSet = new Set(prev);
              const newUrls = urls.filter(u => !existingSet.has(u));
              return [...prev, ...newUrls];
            });
          }
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
