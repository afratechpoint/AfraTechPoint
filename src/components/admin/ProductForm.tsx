"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2,
  Tag, X, Package, DollarSign, BarChart2, AlignLeft, Layers,
  Hash, ChevronDown, Info
} from "lucide-react";
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
  price?: number;
  category: string;
  image: string;
  gallery?: string[];
  aboutItem?: string;
  description: string;
  specifications?: { label: string; value: string }[];
  variants?: Variant[];
  stock?: number;
  tags?: string[];
}

interface ProductFormProps {
  initialData?: Product | null;
}

// ── Section Card wrapper ──────────────────────────────────────────
function Section({ title, icon: Icon, iconColor = "bg-gray-100 text-gray-500", children }: {
  title: string;
  icon: any;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", iconColor)}>
          <Icon size={14} />
        </div>
        <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[9px] text-gray-300 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT = "w-full h-11 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium";
const TEXTAREA = "w-full p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none leading-relaxed";

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const settings = useSettings();
  const currency = settings?.currencySymbol || "৳";

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
  const [stock, setStock] = useState<number | undefined>(initialData?.stock);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    Array.isArray((initialData as any)?.specifications) ? (initialData as any).specifications : []
  );
  const [tags, setTags] = useState<string[]>(
    Array.isArray((initialData as any)?.tags) ? (initialData as any).tags : []
  );
  const [tagInput, setTagInput] = useState("");

  // Discount %
  const discount = salePrice && regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  // Sync variants when main price changes
  useEffect(() => {
    setVariants(prev => prev.map(v => v.useMainPrice ? { ...v, regularPrice, salePrice } : v));
  }, [regularPrice, salePrice]);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.categories) setAvailableCategories(data.categories);
    });
  }, []);

  // ── Tag helpers ───────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const cleaned = raw.trim().toLowerCase().replace(/[^\w\u0980-\u09FF\s_-]/g, "").replace(/\s+/g, "-");
    if (cleaned && !tags.includes(cleaned)) setTags(prev => [...prev, cleaned]);
    setTagInput("");
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
    else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) setTags(prev => prev.slice(0, -1));
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) { alert("Please select a main product image."); return; }
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
          salePrice: salePrice || undefined,
          stock: stock !== undefined ? Number(stock) : undefined,
          variants,
          gallery,
          specifications: specs,
          tags,
          image,
        }),
      });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Failed to save product", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {initialData ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-widest">
              {initialData ? `ID: ${initialData.id.slice(0, 12)}…` : "Fill in the details below"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ══ LEFT — Main Content ══════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-5">

            {/* Basic Info */}
            <Section title="Product Info" icon={Package} iconColor="bg-blue-50 text-blue-600">
              <Field label="Product Name">
                <input
                  name="name"
                  defaultValue={initialData?.name}
                  required
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  className={INPUT}
                />
              </Field>
            </Section>

            {/* Images */}
            <Section title="Media" icon={ImageIcon} iconColor="bg-indigo-50 text-indigo-600">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Main image */}
                <div
                  onClick={() => { setPickingFor("main"); setIsMediaPickerOpen(true); }}
                  className="relative w-full sm:w-40 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black cursor-pointer transition-all overflow-hidden group flex-shrink-0 flex items-center justify-center"
                >
                  {image ? (
                    <>
                      <img src={image} alt="Main" className="w-full h-full object-contain p-3" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Change</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setImage(""); }}
                          className="h-6 px-2 rounded-md bg-red-500 text-white text-[9px] font-black flex items-center gap-1"
                        >
                          <Trash2 size={8} /> Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-gray-600 transition-colors">
                      <ImageIcon size={24} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Main Image</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Main</span>
                </div>

                {/* Gallery */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gallery ({gallery.length})</p>
                    <button
                      type="button"
                      onClick={() => { setPickingFor("gallery"); setIsMediaPickerOpen(true); }}
                      className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all"
                    >
                      <Plus size={10} /> Add Photos
                    </button>
                  </div>
                  {gallery.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gallery.map((g, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden group">
                          <img src={g} className="w-full h-full object-contain p-1" />
                          <button
                            type="button"
                            onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center min-h-[80px]">
                      <p className="text-[10px] text-gray-300 font-medium">No gallery photos yet</p>
                    </div>
                  )}
                </div>
              </div>
              <input type="hidden" name="image" value={image} />
            </Section>

            {/* Content */}
            <Section title="Content" icon={AlignLeft} iconColor="bg-green-50 text-green-600">
              <div className="space-y-4">
                <Field label="About This Item" hint="Short summary shown below price">
                  <textarea
                    name="aboutItem"
                    defaultValue={initialData?.aboutItem}
                    rows={3}
                    placeholder="Catchy 1–2 sentence blurb customers see immediately…"
                    className={TEXTAREA}
                  />
                </Field>
                <Field label="Full Description">
                  <textarea
                    name="description"
                    defaultValue={initialData?.description}
                    required
                    rows={5}
                    placeholder="Detailed product overview, features, and what's in the box…"
                    className={TEXTAREA}
                  />
                </Field>
              </div>
            </Section>

            {/* Specifications */}
            <Section title="Specifications" icon={BarChart2} iconColor="bg-orange-50 text-orange-600">
              <div className="space-y-2 mb-3">
                {specs.length === 0 ? (
                  <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">No specs added yet</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">e.g. Battery Life → 30 hours</p>
                  </div>
                ) : specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center">
                    <input
                      placeholder="Label (e.g. Weight)"
                      value={s.label}
                      onChange={e => { const n = [...specs]; n[i].label = e.target.value; setSpecs(n); }}
                      className="col-span-2 h-10 px-3 rounded-xl bg-gray-50 ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none text-xs font-bold border-none"
                    />
                    <input
                      placeholder="Value (e.g. 250g)"
                      value={s.value}
                      onChange={e => { const n = [...specs]; n[i].value = e.target.value; setSpecs(n); }}
                      className="col-span-2 h-10 px-3 rounded-xl bg-gray-50 ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none text-xs font-medium border-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}
                      className="h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSpecs([...specs, { label: "", value: "" }])}
                className="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-black hover:text-black text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={14} /> Add Specification Row
              </button>
            </Section>

            {/* Variants */}
            <Section title="Product Variants" icon={Layers} iconColor="bg-purple-50 text-purple-600">
              <p className="text-[10px] text-gray-400 mb-3">Add color options, storage sizes, models, etc. Each variant can have its own price and image.</p>

              <div className="flex gap-2 mb-4">
                <input
                  value={newVariantName}
                  onChange={e => setNewVariantName(e.target.value)}
                  placeholder="Variant name (e.g. Midnight Black, 256GB)"
                  className="flex-1 h-11 px-4 rounded-xl bg-gray-50 ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none text-sm font-medium border-none"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newVariantName.trim()) {
                        setVariants([...variants, { id: Date.now().toString(), name: newVariantName.trim(), useMainPrice: true, regularPrice, salePrice }]);
                        setNewVariantName("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newVariantName.trim()) {
                      setVariants([...variants, { id: Date.now().toString(), name: newVariantName.trim(), useMainPrice: true, regularPrice, salePrice }]);
                      setNewVariantName("");
                    }
                  }}
                  className="h-11 px-5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-400 font-medium">No variants added</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Leave empty if product has only one version</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={v.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      {/* Variant image */}
                      <div
                        onClick={() => { setPickingFor(i); setIsMediaPickerOpen(true); }}
                        className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:border-black transition-all overflow-hidden shrink-0"
                      >
                        {v.image
                          ? <img src={v.image} className="w-full h-full object-contain p-1" />
                          : <ImageIcon size={16} className="text-gray-300" />
                        }
                      </div>

                      {/* Name */}
                      <input
                        value={v.name}
                        onChange={e => { const u = [...variants]; u[i].name = e.target.value; setVariants(u); }}
                        placeholder="Variant label"
                        className="flex-1 h-9 px-3 rounded-lg bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none text-xs font-bold border-none"
                      />

                      {/* Prices */}
                      <div className="flex gap-2 items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => {
                          const u = [...variants];
                          u[i].useMainPrice = !v.useMainPrice;
                          if (u[i].useMainPrice) { u[i].regularPrice = regularPrice; u[i].salePrice = salePrice; }
                          setVariants(u);
                        }}>
                          <div className={cn("w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all", v.useMainPrice ? "bg-black border-black" : "border-gray-300")}>
                            {v.useMainPrice && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                          </div>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight whitespace-nowrap">Main Price</span>
                        </label>
                      </div>
                      {!v.useMainPrice && (
                        <>
                          <input
                            type="number" placeholder="Regular"
                            value={v.regularPrice || ""}
                            onChange={e => { const u = [...variants]; u[i].regularPrice = parseFloat(e.target.value) || undefined; setVariants(u); }}
                            className="w-24 h-9 px-2 rounded-lg bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none text-xs font-bold border-none"
                          />
                          <input
                            type="number" placeholder="Sale"
                            value={v.salePrice || ""}
                            onChange={e => { const u = [...variants]; u[i].salePrice = parseFloat(e.target.value) || undefined; setVariants(u); }}
                            className="w-24 h-9 px-2 rounded-lg bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-green-400 outline-none text-xs font-bold text-green-600 border-none"
                          />
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ══ RIGHT — Sidebar ══════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">

            {/* Publish / Save */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 shadow-sm text-gray-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                {initialData ? "Update Product" : "Publish Product"}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-black text-white rounded-xl font-black text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSubmitting ? "Saving…" : (initialData ? "Save Changes" : "Create Product")}
              </button>
              <Link
                href="/admin/products"
                className="mt-2 w-full h-10 rounded-xl text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-50 flex items-center justify-center transition-all"
              >
                Cancel
              </Link>
            </div>

            {/* Category */}
            <Section title="Category" icon={Hash} iconColor="bg-blue-50 text-blue-600">
              <Field label="Product Category">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={initialData?.category || ""}
                    required
                    className={cn(INPUT, "appearance-none pr-10 cursor-pointer")}
                  >
                    <option value="" disabled>Select a category</option>
                    {availableCategories.length > 0
                      ? availableCategories.map(cat => (
                        <option key={cat.id || cat.slug} value={cat.label || cat}>{cat.label || cat}</option>
                      ))
                      : <option value="General">General</option>
                    }
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>
            </Section>

            {/* Pricing */}
            <Section title="Pricing" icon={DollarSign} iconColor="bg-green-50 text-green-600">
              <div className="space-y-3">
                <Field label={`Regular Price (${currency})`}>
                  <input
                    type="number"
                    name="regularPrice"
                    min="0"
                    step="0.01"
                    value={regularPrice}
                    onChange={e => setRegularPrice(parseFloat(e.target.value) || 0)}
                    required
                    placeholder="0.00"
                    className={INPUT}
                  />
                </Field>
                <Field label={`Sale Price (${currency})`} hint="Optional">
                  <input
                    type="number"
                    name="salePrice"
                    min="0"
                    step="0.01"
                    value={salePrice || ""}
                    onChange={e => setSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className={cn(INPUT, "text-green-600 font-bold")}
                  />
                </Field>

                {/* Discount badge */}
                {discount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                    <span className="text-xs font-bold text-green-700">Discount</span>
                    <span className="text-sm font-black text-green-700">{discount}% OFF</span>
                  </div>
                )}
              </div>
            </Section>

            {/* Inventory */}
            <Section title="Inventory" icon={Package} iconColor="bg-yellow-50 text-yellow-600">
              <Field label="Stock Quantity" hint="Leave empty = unlimited">
                <div className="relative">
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={stock ?? ""}
                    onChange={e => setStock(e.target.value !== "" ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 50"
                    className={INPUT}
                  />
                  {stock !== undefined && stock <= 10 && stock > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-orange-500 text-[10px] font-black">
                      <Info size={10} /> Low stock warning
                    </div>
                  )}
                  {stock === 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-500 text-[10px] font-black">
                      <Info size={10} /> Out of stock
                    </div>
                  )}
                </div>
              </Field>
            </Section>

            {/* Tags */}
            <Section title="Tags & SEO Keywords" icon={Tag} iconColor="bg-pink-50 text-pink-600">
              <Field label="Add Tags" hint="Enter · comma · or press Enter">
                <div
                  className="min-h-[72px] flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-black transition-all cursor-text"
                  onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
                >
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full">
                      #{tag}
                      <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="hover:text-red-300 transition-colors">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput.trim() && addTag(tagInput)}
                    placeholder={tags.length === 0 ? "android, wireless…" : ""}
                    className="bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300 min-w-[100px] flex-1"
                  />
                </div>
              </Field>
              {tags.length > 0 && (
                <p className="text-[9px] text-gray-300 mt-1.5">
                  {tags.length} tag{tags.length > 1 ? "s" : ""} saved · used for SEO &amp; related products
                </p>
              )}
            </Section>

          </div>
        </div>
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        multiSelect={pickingFor === "gallery"}
        onClose={() => { setIsMediaPickerOpen(false); setPickingFor("main"); }}
        onSelect={url => {
          if (pickingFor === "main") setImage(url);
          else if (pickingFor === "gallery") setGallery(prev => [...prev, url]);
          else if (typeof pickingFor === "number") {
            const u = [...variants]; u[pickingFor].image = url; setVariants(u);
          }
          setIsMediaPickerOpen(false);
        }}
        onSelectMultiple={urls => {
          if (pickingFor === "gallery") {
            setGallery(prev => { const s = new Set(prev); return [...prev, ...urls.filter(u => !s.has(u))]; });
          }
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
