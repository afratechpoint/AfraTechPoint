"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Package, Users, ShoppingCart, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const settings = useSettings();

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([orders, products]) => {
      // Calculate unique customers based on order history
      const uniqueCustomers = new Set(orders.map((o: any) => o.customer?.email).filter(Boolean));
      
      setStats(prev => ({ 
        ...prev, 
        orders: orders.length, 
        products: products.length,
        customers: uniqueCustomers.size
      }));
      setRecentOrders(orders.slice(0, 5));
    });
  }, []);

  const metrics = [
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "bg-blue-500" },
    { label: "Products Catalog", value: stats.products, icon: Package, color: "bg-purple-500" },
    { label: "Active Customers", value: stats.customers, icon: Users, color: "bg-emerald-500" },
    { label: "Conversion Rate", value: "3.2%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", m.color)}>
              <m.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{m.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
              View All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="p-4 flex-1">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs font-medium italic">
                 No orders placed yet.
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 gap-3 md:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{order.customer?.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Order #{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                      <p className="font-bold text-sm text-gray-900">{settings?.currencySymbol || '$'}{order.total?.toFixed(2)}</p>
                      <p className="text-[10px] text-orange-500 font-bold uppercase">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-black rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-black/10">
           <div>
              <h3 className="text-lg font-bold mb-1.5">Quick Actions</h3>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Instantly manage your store's inventory and view customer feedback.</p>
           </div>
           
           <div className="space-y-2 mt-6">
              <Link href="/admin/products" className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-between transition-all group">
                <div className="flex items-center gap-2.5">
                  <Package size={16} className="text-[#ccff00]" />
                  <span className="text-xs font-bold">Manage Catalog</span>
                </div>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/admin/orders" className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl flex items-center justify-between transition-all group">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart size={16} className="text-blue-400" />
                  <span className="text-xs font-bold">Process Orders</span>
                </div>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              {/* Admin Alerts Registration (Mobile Compatibility) */}
              <button 
                onClick={() => (window as any).triggerPushPermission?.(true)}
                className="w-full bg-[#ccff00] hover:bg-[#b8e600] p-3 rounded-xl flex items-center justify-between transition-all group group-hover:scale-[1.02] shadow-lg shadow-[#ccff00]/5"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-black" />
                  <span className="text-xs font-black text-black uppercase tracking-tight">Enable Admin Alerts</span>
                </div>
                <Check size={12} className="text-black" />
              </button>
           </div>

           <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Store Status</p>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <p className="text-[10px] font-bold text-gray-300">Online & Accepting Payments</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
