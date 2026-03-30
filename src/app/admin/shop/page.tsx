"use client";

import React, { useEffect, useState } from "react";
import { Save, Loader2, Image as ImageIcon, Tags, Mail, Phone, MapPin, Plus, Trash2, LayoutTemplate, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { authenticatedFetch } from "@/lib/api-helper";

export default function AdminShopPage() {
  const [settings, setSettings] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"banners" | "categories" | "contact">("banners");

  // Structured Business Hours State
  const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const [isEveryday, setIsEveryday] = useState(false);
  const [bhStartDay, setBhStartDay] = useState("Mon");
  const [bhEndDay, setBhEndDay] = useState("Fri");
  const [bhOpenTime, setBhOpenTime] = useState("9:00");
  const [bhOpenPeriod, setBhOpenPeriod] = useState("AM");
  const [bhCloseTime, setBhCloseTime] = useState("6:00");
  const [bhClosePeriod, setBhClosePeriod] = useState("PM");

  // Media Picker State for Banners
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeBannerId, setActiveBannerId] = useState<string | null>(null);

  useEffect(() => {
    authenticatedFetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setBanners(data.banners || []);
        setCategories(data.categories || []);
        
        // Parse Business Hours: "Mon - Fri: 9:00 AM - 6:00 PM"
        if (data.businessHours) {
          try {
            const parts = data.businessHours.split(': ');
            if (parts.length >= 2) {
              const daysPart = parts[0];
              if (daysPart === "Everyday") {
                setIsEveryday(true);
              } else if (daysPart.includes(' - ')) {
                const dayRange = daysPart.split(' - ');
                setBhStartDay(dayRange[0]);
                setBhEndDay(dayRange[1]);
                setIsEveryday(false);
              } else {
                setBhStartDay(daysPart);
                setBhEndDay(""); 
                setIsEveryday(false);
              }
              
              const times = parts[1].split(' - ');
              if (times.length >= 2) {
                const open = times[0].split(' ');
                const close = times[1].split(' ');
                if (open.length >= 2) {
                  setBhOpenTime(open[0]);
                  setBhOpenPeriod(open[1]);
                }
                if (close.length >= 2) {
                  setBhCloseTime(close[0]);
                  setBhClosePeriod(close[1]);
                }
              }
            }
          } catch (e) {
            console.error("Failed to parse business hours", e);
          }
        }
        
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
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await authenticatedFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Merge the contact details with the new arrays
        body: JSON.stringify({
          ...data,
          banners,
          categories
        }),
      });

      if (res.ok) {
        toast.success("Shop settings updated successfully!");
        const updated = await res.json();
        setSettings(updated);
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to save shop settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Banner Handlers
  const addBanner = () => {
    setBanners([...banners, { id: Date.now().toString(), title: '', description: '', imageUrl: '', linkUrl: '' }]);
  };
  const updateBanner = (id: string, field: string, value: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  const removeBanner = (id: string) => setBanners(banners.filter(b => b.id !== id));

  // Category Handlers
  const addCategory = () => {
    setCategories([...categories, { id: Date.now().toString(), label: '', slug: '' }]);
  };
  const updateCategory = (id: string, field: string, value: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const removeCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "banners", label: "Homepage Banners", icon: LayoutTemplate },
    { id: "categories", label: "Product Categories", icon: Tags },
    { id: "contact", label: "Quick Contact Info", icon: MapPin },
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
        
        {/* Banner Section */}
        {activeTab === "banners" && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <LayoutTemplate size={16} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">Homepage Banners</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Add or remove top carousel banners on the main website.</p>
                 </div>
               </div>
               <button 
                 type="button" 
                 onClick={addBanner}
                 className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
               >
                 <Plus size={14} /> Add Banner
               </button>
            </div>
            <div className="p-6 space-y-6 bg-gray-50/10 min-h-[400px]">
              {banners.length === 0 ? (
                <p className="text-center text-xs text-gray-400 font-medium italic p-4">No banners configured yet.</p>
              ) : banners.map((banner, index) => (
                  <div key={banner.id} className="p-6 bg-white border border-gray-100 rounded-3xl relative shadow-sm group/banner hover:shadow-md transition-shadow">
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-300">#{index + 1}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left Side: Preview & Image Selection */}
                      <div className="md:col-span-4 space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                          <ImageIcon size={12} /> Banner Image
                        </label>
                        
                        <div 
                          onClick={() => {
                            setActiveBannerId(banner.id);
                            setIsMediaPickerOpen(true);
                          }}
                          className="relative aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden group cursor-pointer hover:border-black transition-all flex items-center justify-center"
                        >
                          {banner.imageUrl ? (
                            <>
                              <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-black shadow-lg uppercase tracking-wider scale-90 group-hover:scale-100 transition-transform">Change Image</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-black transition-colors">
                              <Plus size={24} strokeWidth={1.5} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Select Image</span>
                            </div>
                          )}
                        </div>
                        <input type="hidden" value={banner.imageUrl} />
                      </div>

                      {/* Right Side: Details */}
                      <div className="md:col-span-8 flex flex-col justify-between gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title (Optional)</label>
                            <input 
                              value={banner.title} 
                              onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                              placeholder="e.g. Latest Gadgets"
                              className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-indigo-600">Details / Description</label>
                            <textarea 
                              value={banner.description} 
                              onChange={(e) => updateBanner(banner.id, 'description', e.target.value)}
                              placeholder="e.g. Learn more about our latest promotion..."
                              className="w-full h-20 px-4 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none text-gray-700" 
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                          <button 
                            type="button" 
                            onClick={() => removeBanner(banner.id)}
                            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2 text-xs font-bold transition-all shadow-sm shadow-red-100/50"
                          >
                            <Trash2 size={14} /> Remove Banner
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Tags size={16} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">Product Categories</h3>
                    <p className="text-[10px] text-gray-500 font-medium">Add or remove categories shown across the shop.</p>
                 </div>
               </div>
               <button 
                 type="button" 
                 onClick={addCategory}
                 className="text-xs font-bold bg-black text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:scale-105 transition-transform"
               >
                 <Plus size={14} /> Add Category
               </button>
            </div>
            <div className="p-6 space-y-4 bg-gray-50/10 min-h-[400px]">
              {categories.length === 0 ? (
                <p className="text-center text-xs text-gray-400 font-medium italic p-4">No categories configured yet.</p>
              ) : categories.map((cat: any) => (
                <div key={cat.id} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Label</label>
                    <input 
                      value={cat.label} 
                      onChange={(e) => updateCategory(cat.id, 'label', e.target.value)}
                      placeholder="e.g. Smartphones"
                      className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                    <div className="flex gap-2">
                      <input 
                        value={cat.slug} 
                        onChange={(e) => updateCategory(cat.id, 'slug', e.target.value)}
                        placeholder="smartphones"
                        className="w-full h-10 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium lowercase" 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeCategory(cat.id)}
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
        )}

        {/* Contact Information (Quick Edit) */}
        {activeTab === "contact" && (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <MapPin size={16} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">Quick Contact Details</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Update the phone, email, and address quickly.</p>
               </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px] content-start">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Mail size={12}/> Support Email</label>
                <input 
                  name="contactEmail" 
                  type="email"
                  defaultValue={settings?.contactEmail} 
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Phone size={12}/> Phone Number</label>
                <input 
                  name="contactPhone" 
                  defaultValue={settings?.contactPhone} 
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MapPin size={12}/> Physical Address</label>
                <input 
                  name="contactAddress" 
                  defaultValue={settings?.contactAddress} 
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium" 
                />
              </div>
              <div className="space-y-3 md:col-span-2 pt-2 border-t border-gray-50 mt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Clock size={12}/> Business Hours Configuration
                </label>
                
                <div className="flex flex-wrap gap-3 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                  {/* Everyday Checkbox */}
                  <div className="flex items-center gap-3 bg-white px-4 h-10 rounded-xl ring-1 ring-gray-100 mb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isEveryday}
                        onChange={(e) => setIsEveryday(e.target.checked)}
                        className="w-4 h-4 rounded text-black bg-gray-100 border-none focus:ring-black focus:ring-offset-0 cursor-pointer" 
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Everyday</span>
                    </label>
                  </div>

                  {/* Days Range Selector - Hidden if Everyday is checked */}
                  {!isEveryday && (
                    <div className="flex-1 min-w-[240px] space-y-1.5 pt-1 animate-in fade-in slide-in-from-left-2 duration-200">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Working Days</span>
                      <div className="flex items-center gap-2">
                         <select 
                          value={bhStartDay} 
                          onChange={(e) => setBhStartDay(e.target.value)}
                          className="flex-1 h-10 px-3 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold cursor-pointer"
                         >
                           {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                         
                         <span className="text-[10px] font-black text-gray-300">TO</span>
                         
                         <select 
                          value={bhEndDay} 
                          onChange={(e) => setBhEndDay(e.target.value)}
                          className="flex-1 h-10 px-3 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold cursor-pointer"
                         >
                           <option value="">(None)</option>
                           {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>
                    </div>
                  )}

                  {/* Open Time */}
                  <div className="w-[90px] space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Open Time</span>
                    <input 
                      value={bhOpenTime} 
                      onChange={(e) => setBhOpenTime(e.target.value)}
                      placeholder="9:00"
                      className="w-full h-10 px-3 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold text-center" 
                    />
                  </div>
                  
                  {/* Open Period */}
                  <div className="w-[70px]">
                    <select 
                      value={bhOpenPeriod} 
                      onChange={(e) => setBhOpenPeriod(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold cursor-pointer"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>

                  <div className="pb-3 text-gray-300 font-black text-xs px-1">TO</div>

                  {/* Close Time */}
                  <div className="w-[90px] space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Close Time</span>
                    <input 
                      value={bhCloseTime} 
                      onChange={(e) => setBhCloseTime(e.target.value)}
                      placeholder="6:00"
                      className="w-full h-10 px-3 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold text-center" 
                    />
                  </div>

                  {/* Close Period */}
                  <div className="w-[70px]">
                    <select 
                      value={bhClosePeriod} 
                      onChange={(e) => setBhClosePeriod(e.target.value)}
                      className="w-full h-10 px-2 rounded-xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-black outline-none transition-all text-xs font-bold cursor-pointer"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <input 
                  type="hidden" 
                  name="businessHours" 
                  value={`${isEveryday ? "Everyday" : `${bhStartDay}${bhEndDay ? ` - ${bhEndDay}` : ""}`}: ${bhOpenTime} ${bhOpenPeriod} - ${bhCloseTime} ${bhClosePeriod}`} 
                />
                
                <p className="text-[10px] text-gray-400 font-medium ml-1">
                  Preview: <span className="text-black font-bold">{isEveryday ? "Everyday" : `${bhStartDay}${bhEndDay ? ` - ${bhEndDay}` : ""}`}: {bhOpenTime} {bhOpenPeriod} - {bhCloseTime} {bhClosePeriod}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button - visible regardless of tab */}
        <div className="flex justify-end pt-4 pb-20">
          <button 
            type="submit" 
            disabled={isSaving}
            className="h-12 px-8 rounded-xl bg-black text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/10"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Customization
          </button>
        </div>

      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal 
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (activeBannerId) {
            updateBanner(activeBannerId, 'imageUrl', url);
          }
          setIsMediaPickerOpen(false);
          setActiveBannerId(null);
        }}
      />
    </div>
  );
}
