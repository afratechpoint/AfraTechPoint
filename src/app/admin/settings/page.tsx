"use client";

import React, { useEffect, useState } from "react";
import { Save, Loader2, Store, PanelTop, PanelBottom, Instagram, Plus, Trash2, ImageIcon, X, Scissors, Check, ChevronUp, ChevronDown, ExternalLink, CreditCard, ToggleLeft, ToggleRight, Truck, Banknote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import ImageCropperModal from "@/components/admin/ImageCropperModal";
import { THEMES, ThemeId } from "@/lib/themes";

interface Settings {
  storeName: string;
  logoUrl: string;
  shortDescription: string;
  currencySymbol: string;
  themeId: ThemeId;
  announcementText: string;
  announcementActive: boolean;
  categories: any[];
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  businessHours?: string;
}

const currencies = [
  { label: "US Dollar ($)", symbol: "$" },
  { label: "Bangladeshi Taka (৳)", symbol: "৳" },
  { label: "Euro (€)", symbol: "€" },
  { label: "British Pound (£)", symbol: "£" },
  { label: "Indian Rupee (₹)", symbol: "₹" },
  { label: "Japanese Yen (¥)", symbol: "¥" },
  { label: "Canadian Dollar (C$)", symbol: "C$" },
  { label: "Australian Dollar (A$)", symbol: "A$" },
];

function ListEditor({ title, description, icon: Icon, items, setItems, isSocial = false, iconColor = "bg-purple-50 text-purple-600" }: any) {
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), [isSocial ? 'platform' : 'label']: '', [isSocial ? 'url' : 'href']: '' }]);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i: any) => i.id !== id));
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
         <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Icon size={16} />
           </div>
           <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{description}</p>
           </div>
         </div>
         <button 
           type="button" 
           onClick={addItem}
           className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
         >
           <Plus size={14} /> Add Item
         </button>
      </div>
      <div className="p-6 space-y-4 bg-gray-50/10 min-h-[400px] content-start">
        {items.length === 0 ? (
          <p className="text-center text-xs text-gray-400 font-medium italic p-4">No items configured yet.</p>
        ) : items.map((item: any) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isSocial ? 'Platform Name' : 'Display Label'}</label>
              <input 
                value={isSocial ? item.platform : item.label} 
                onChange={(e) => updateItem(item.id, isSocial ? 'platform' : 'label', e.target.value)}
                placeholder={isSocial ? "e.g. Facebook" : "e.g. Home"}
                className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
              />
            </div>
            <div className="flex-[2] space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{isSocial ? 'URL Link' : 'Target Path'}</label>
              <div className="flex gap-2">
                <input 
                  value={isSocial ? item.url : item.href} 
                  onChange={(e) => updateItem(item.id, isSocial ? 'url' : 'href', e.target.value)}
                  placeholder={isSocial ? "https://..." : "/"}
                  className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                />
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavigationEditor({ title, description, icon: Icon, items, setItems, predefinedItems, labelName = "Display Label", linkName = "Target Path", iconColor = "bg-purple-50 text-purple-600" }: any) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addItem = (label = '', href = '') => {
    setItems([...items, { id: Date.now().toString(), label, href }]);
    setShowAddMenu(false);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i: any) => i.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const PREDEFINED_PAGES = predefinedItems || [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Cart", href: "/cart" },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center relative">
         <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Icon size={16} />
           </div>
           <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{description}</p>
           </div>
         </div>
         
         <div className="relative">
            <button 
              type="button" 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <Plus size={14} /> Add Item
            </button>
            
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quick Add Page</span>
                </div>
                {PREDEFINED_PAGES.map((page: any) => (
                  <button
                    key={page.href}
                    type="button"
                    onClick={() => addItem(page.label, page.href)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    {page.label}
                  </button>
                ))}
                <div className="h-px bg-gray-50 my-1" />
                <button
                  type="button"
                  onClick={() => addItem()}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  + Custom Link
                </button>
              </div>
            )}
         </div>
      </div>
      <div className="p-6 space-y-4 bg-gray-50/10 min-h-[400px] content-start">
        {items.length === 0 ? (
          <p className="text-center text-xs text-gray-400 font-medium italic p-4">No items configured yet.</p>
        ) : items.map((item: any, index: number) => (
          <div key={item.id} className="flex gap-4 items-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group animate-in slide-in-from-right-2 duration-300">
            {/* Reorder controls */}
            <div className="flex flex-col gap-1 pr-2 border-r border-gray-50">
               <button 
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors text-gray-400 hover:text-black"
               >
                 <ChevronUp size={14} />
               </button>
               <button 
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors text-gray-400 hover:text-black"
               >
                 <ChevronDown size={14} />
               </button>
            </div>
            
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{labelName}</label>
              <input 
                value={item.label} 
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                placeholder={`e.g. ${labelName}`}
                className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
              />
            </div>
            <div className="flex-[2] space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{linkName}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    value={item.href} 
                    onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                    placeholder="/"
                    className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium pr-10" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <ExternalLink size={12} />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialMediaEditor({ title, description, icon: Icon, items, setItems, iconColor = "bg-purple-50 text-purple-600" }: any) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addItem = (platform = '', url = '') => {
    setItems([...items, { id: Date.now().toString(), platform, url }]);
    setShowAddMenu(false);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i: any) => i.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const PLATFORMS = ["Facebook", "Instagram", "Twitter / X", "LinkedIn", "YouTube", "WhatsApp", "Telegram", "Pinterest", "TikTok"];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center relative">
         <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Icon size={16} />
           </div>
           <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{description}</p>
           </div>
         </div>
         
         <div className="relative">
            <button 
              type="button" 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <Plus size={14} /> Add Social Link
            </button>
            
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Choose Platform</span>
                </div>
                {PLATFORMS.map(plat => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => addItem(plat)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    {plat}
                  </button>
                ))}
                <div className="h-px bg-gray-50 my-1" />
                <button
                  type="button"
                  onClick={() => addItem()}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  + Custom Platform
                </button>
              </div>
            )}
         </div>
      </div>
      <div className="p-6 space-y-4 bg-gray-50/10 min-h-[400px] content-start">
        {items.length === 0 ? (
          <p className="text-center text-xs text-gray-400 font-medium italic p-4">No social links configured yet.</p>
        ) : items.map((item: any, index: number) => (
          <div key={item.id} className="flex gap-4 items-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group animate-in slide-in-from-right-2 duration-300">
            {/* Reorder controls */}
            <div className="flex flex-col gap-1 pr-2 border-r border-gray-50">
               <button 
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors text-gray-400 hover:text-black"
               >
                 <ChevronUp size={14} />
               </button>
               <button 
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-30 transition-colors text-gray-400 hover:text-black"
               >
                 <ChevronDown size={14} />
               </button>
            </div>
            
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Platform</label>
              <div className="relative">
                <select 
                  value={PLATFORMS.includes(item.platform) ? item.platform : "Custom"}
                  onChange={(e) => updateItem(item.id, 'platform', e.target.value === "Custom" ? "" : e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold appearance-none pr-10"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="Custom">Custom...</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={12} />
                </div>
              </div>
              {!PLATFORMS.includes(item.platform) && item.platform !== "Custom" && (
                <input 
                  value={item.platform} 
                  onChange={(e) => updateItem(item.id, 'platform', e.target.value)}
                  placeholder="Platform Name"
                  className="w-full h-8 px-3 rounded-lg bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-[10px] font-bold mt-1" 
                />
              )}
            </div>
            
            <div className="flex-[2] space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profile URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    value={item.url} 
                    onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium pr-10" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                    <ExternalLink size={12} />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [footerProducts, setFooterProducts] = useState<any[]>([]);
  const [footerCompany, setFooterCompany] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string; accountNumber: string; enabled: boolean }[]>([]);
  const [codEnabled, setCodEnabled] = useState<boolean>(true);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "header" | "footer" | "social">("general");
  const [logoUrl, setLogoUrl] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>("midnight");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLogoUrl(data.logoUrl || "");
        setCurrencySymbol(data.currencySymbol || "৳");
        setThemeId(data.themeId || "midnight");
        setNavLinks(data.navLinks || []);
        setSocialLinks(data.socialLinks || []);
        setFooterProducts(data.footerProducts || []);
        setFooterCompany(data.footerCompany || []);
        setPaymentMethods(data.paymentMethods || []);
        setCodEnabled(data.codEnabled !== false);
        setDeliveryCharge(Number(data.deliveryCharge) || 0);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // Explicitly handle checkbox (it's omitted completely from formData if unchecked)
    data.announcementActive = formData.get('announcementActive') === 'on' ? true : false;

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          logoUrl,
          currencySymbol,
          themeId,
          navLinks,
          socialLinks,
          footerProducts,
          footerCompany,
          paymentMethods,
          codEnabled,
          deliveryCharge: Number(deliveryCharge),
        }),
      });

      if (res.ok) {
        toast.success("Settings updated successfully!");
        const updated = await res.json();
        setSettings(updated);
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setIsCropping(true);
    const formData = new FormData();
    // Rename with timestamp to ensure uniqueness and identifiable as cropped
    const fileName = `cropped-logo-${Date.now()}.jpg`;
    formData.append("files", blob, fileName);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.files.length > 0) {
        setLogoUrl(data.files[0].url);
        toast.success("Logo cropped and updated!");
      }
    } catch (error) {
      toast.error("Failed to upload cropped image.");
    } finally {
      setIsCropping(false);
      setIsCropperOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "header", label: "Header", icon: PanelTop },
    { id: "footer", label: "Footer", icon: PanelBottom },
    { id: "social", label: "Social", icon: Instagram },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Sub-menu Tabs */}
      <div className="flex space-x-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-white text-black shadow-sm shadow-black/5"
                  : "bg-transparent text-gray-500 hover:bg-white/50 hover:text-black"
              )}
            >
              <Icon size={14} className={isActive ? "text-indigo-600" : "text-gray-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Store size={16} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">General Information</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Core details about your digital storefront.</p>
               </div>
            </div>
            <div className="p-6 space-y-6 min-h-[400px]">
              {/* Store Name + Logo row */}
              <input type="hidden" name="logoUrl" value={logoUrl} />
              <div className="flex items-start gap-6">
                 {/* Left side: Inputs */}
                 <div className="flex-1 space-y-6">
                   {/* Store Name */}
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                     <input
                       name="storeName"
                       defaultValue={settings?.storeName}
                       className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                     />
                   </div>

                   {/* Currency & Color row */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Currency Symbol</label>
                       <select 
                         value={currencySymbol}
                         onChange={(e) => setCurrencySymbol(e.target.value)}
                         className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                       >
                         {currencies.map((c) => (
                           <option key={c.symbol} value={c.symbol}>
                             {c.label}
                           </option>
                         ))}
                       </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Theme Palette</label>
                        <div className="grid grid-cols-5 gap-3 h-12">
                          {Object.values(THEMES).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setThemeId(t.id as any)}
                              className={cn(
                                "relative h-full rounded-xl border-2 transition-all p-0.5",
                                themeId === t.id ? "border-black scale-105 shadow-sm" : "border-transparent hover:scale-105"
                              )}
                              title={t.name}
                            >
                              <div className="w-full h-full rounded-lg overflow-hidden flex flex-col">
                                <div style={{ backgroundColor: t.primary }} className="flex-1 w-full" />
                                <div style={{ backgroundColor: t.hover }} className="flex-1 w-full" />
                              </div>
                              {themeId === t.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center border-2 border-white">
                                  <Check size={8} strokeWidth={4} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                 </div>

                 <div className="space-y-1.5 shrink-0">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Store Logo (512x512)</label>
                   <div className="relative group">
                     <button
                       type="button"
                       onClick={() => setIsMediaPickerOpen(true)}
                       className="relative w-40 h-40 rounded-2xl bg-gray-50 ring-1 ring-gray-100 overflow-hidden group hover:ring-2 hover:ring-black transition-all flex items-center justify-center p-0"
                       title="Click to choose logo from Media Library"
                     >
                       {logoUrl
                         ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                         : <div className="flex flex-col items-center gap-1 text-gray-300">
                             <ImageIcon size={20} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Set Logo</span>
                           </div>}
                       {/* Hover overlay */}
                       <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
                         <ImageIcon size={16} className="text-white" />
                         <span className="text-[9px] font-bold text-white uppercase tracking-widest">Select New</span>
                       </div>
                     </button>

                     {/* Edit/Crop Button */}
                     {logoUrl && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setImageToCrop(logoUrl);
                           setIsCropperOpen(true);
                         }}
                         className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all z-10 group/edit"
                       >
                         {isCropping ? <Loader2 size={16} className="animate-spin" /> : <Scissors size={16} />}
                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] font-black rounded-lg opacity-0 group-hover/edit:opacity-100 transition-opacity whitespace-nowrap">Edit/Crop</span>
                       </button>
                     )}
                   </div>
                 </div>
               </div>                  
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between ml-1 mb-1.5">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Announcement Bar</label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Active</span>
                        <input 
                           type="checkbox" 
                           name="announcementActive" 
                           defaultChecked={settings?.announcementActive}
                           className="w-4 h-4 rounded text-black bg-gray-100 border-none focus:ring-black focus:ring-offset-0" 
                        />
                     </label>
                  </div>
                  <input 
                    name="announcementText" 
                    defaultValue={settings?.announcementText || "Free shipping on all orders over $50! Shop now."} 
                    placeholder="e.g. Big Winter Sale up to 50% Off!"
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                  />
                </div>

                {/* ── Contact Info Block ── */}
                <div className="md:col-span-2 pt-6 border-t border-gray-100 mt-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Corporate Identity & Contact</h4>
                    <p className="text-[10px] font-medium text-gray-500">This data dynamically populates the /contact page and site footer.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                      <input name="contactEmail" defaultValue={settings?.contactEmail} className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" placeholder="support@domain.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Support Phone</label>
                      <input name="contactPhone" defaultValue={settings?.contactPhone} className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" placeholder="+8801..." />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Office Address</label>
                      <textarea name="contactAddress" defaultValue={settings?.contactAddress} className="w-full p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none" rows={2} placeholder="Level 4, Innovation Tower..." />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Business Hours</label>
                      <textarea name="businessHours" defaultValue={settings?.businessHours} className="w-full p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none" rows={3} placeholder="Monday - Friday: 9am - 8pm..." />
                    </div>
                  </div>
                </div>

              </div>
            </div>
        )}

        {/* Header Settings */}
        {activeTab === "header" && (
          <NavigationEditor 
            title="Main Menu Links" 
            description="Manage top navigation bar items." 
            icon={PanelTop} 
            iconColor="bg-indigo-50 text-indigo-600"
            items={navLinks} 
            setItems={setNavLinks} 
          />
        )}

        {/* Footer Settings */}
        {activeTab === "footer" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[140px]">
              <div className="p-6 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Footer Short Description</label>
                <textarea 
                  name="shortDescription" 
                  defaultValue={settings?.shortDescription} 
                  className="w-full h-24 p-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none" 
                />
              </div>
            </div>

            <NavigationEditor 
              title="Footer Product Categories" 
              description="Manage product category links in the footer." 
              icon={PanelBottom} 
              iconColor="bg-orange-50 text-orange-600"
              items={footerProducts} 
              setItems={setFooterProducts} 
              predefinedItems={settings?.categories?.map((c: any) => ({
                label: c.label,
                href: `/shop?category=${encodeURIComponent(c.label)}`
              }))}
            />

            <NavigationEditor 
              title="Footer Company Links" 
              description="Manage corporate links like About or Careers." 
              icon={PanelBottom} 
              iconColor="bg-teal-50 text-teal-600"
              items={footerCompany} 
              setItems={setFooterCompany} 
              labelName="Company Name"
              linkName="Company Link"
              predefinedItems={[
                { label: "About Us", href: "/about" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact Us", href: "/contact" },
              ]}
            />
          </div>
        )}

        {/* Social Settings */}
        {activeTab === "social" && (
          <SocialMediaEditor 
            title="Social Media Integration" 
            description="Add multiple dynamic social URLs." 
            icon={Instagram} 
            iconColor="bg-pink-50 text-pink-600"
            items={socialLinks} 
            setItems={setSocialLinks} 
          />
        )}
        
        {/* ── Payment Methods Section (always visible) ─────────── */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Payment Methods</h3>
              <p className="text-[10px] text-gray-500 font-medium">Set account numbers, delivery charge, and toggle methods on/off for checkout.</p>
            </div>
          </div>
          <div className="p-6 space-y-4">

            {/* Delivery Charge */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shrink-0">
                <Truck size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">Delivery Charge</p>
                <p className="text-[10px] text-gray-500">Added to every order at checkout. Set 0 for free delivery.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-32 h-10 px-4 rounded-xl bg-white border ring-1 ring-gray-200 focus:ring-2 focus:ring-black outline-none text-sm font-bold font-mono text-right"
                  placeholder="0"
                />
              </div>
            </div>

            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center gap-4">
                {/* Method name badge */}
                <div className={`w-24 shrink-0 px-3 py-2 rounded-xl text-xs font-black text-center border ${
                  method.name === "bKash"  ? "bg-pink-50 border-pink-200 text-pink-700" :
                  method.name === "Nagad"  ? "bg-orange-50 border-orange-200 text-orange-700" :
                  "bg-purple-50 border-purple-200 text-purple-700"
                }`}>
                  {method.name}
                </div>
                {/* Account number */}
                <input
                  type="text"
                  value={method.accountNumber}
                  onChange={(e) => setPaymentMethods(prev =>
                    prev.map(m => m.id === method.id ? { ...m, accountNumber: e.target.value } : m)
                  )}
                  placeholder="01XXXXXXXXX"
                  className="flex-1 h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium font-mono"
                />
                {/* Enabled toggle */}
                <button
                  type="button"
                  onClick={() => setPaymentMethods(prev =>
                    prev.map(m => m.id === method.id ? { ...m, enabled: !m.enabled } : m)
                  )}
                  className={`flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold border transition-all ${
                    method.enabled
                      ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                      : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {method.enabled
                    ? <><ToggleRight size={16} /> Active</>
                    : <><ToggleLeft size={16} /> Off</>
                  }
                </button>
              </div>
            ))}
          </div>

          {/* Cash on Delivery Toggle */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <Banknote size={16} className="text-green-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Cash on Delivery</p>
                  <p className="text-[10px] text-gray-500">Allow customers to pay in cash when order arrives</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCodEnabled(prev => !prev)}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold border transition-all ${
                  codEnabled
                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {codEnabled
                  ? <><ToggleRight size={16} /> Enabled</>
                  : <><ToggleLeft size={16} /> Disabled</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Global Save Button - visible regardless of tab */}
        <div className="flex justify-end pt-4 pb-20">
          <button 
            type="submit" 
            disabled={isSaving}
            className="h-12 px-8 rounded-xl bg-black text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/10"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>

      </form>

      {/* Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setLogoUrl(url)}
        currentUrl={logoUrl}
      />

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropperModal
          image={imageToCrop}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

