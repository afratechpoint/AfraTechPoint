"use client";

import React, { useEffect, useState } from "react";
import { Search, Trash2, Users, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUsers, updateUserRole, deleteUserAccount, getSuperAdminEmail } from "./actions";
import PremiumLoader from "@/components/PremiumLoader";
import PremiumSpinner from "@/components/PremiumSpinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "shop_manager", label: "Shop Manager" },
  { value: "order_manager", label: "Order Manager" },
  { value: "customer", label: "Customer" },
];

export default function CustomersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [superAdminEmail, setSuperAdminEmail] = useState<string>("");

  // The currently logged-in user is the super-admin if their email matches
  const isSuperAdmin = !!superAdminEmail && user?.email === superAdminEmail;

  useEffect(() => {
    if (!user) return;
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      const [data, saEmail] = await Promise.all([
        getUsers(token),
        getSuperAdminEmail(token).catch(() => ""),
      ]);
      setUsers(data as UserProfile[]);
      setSuperAdminEmail(saEmail);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users. Are you sure you're an admin?");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUid: string, newRole: string) => {
    try {
      setUpdatingId(targetUid);
      const token = await user!.getIdToken();
      
      // Update role via server action
      await updateUserRole(targetUid, newRole, token);
      
      // Optimistic update
      setUsers(prev => prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully.");
      
      // If we updated our own role, we should force refresh token
      if (targetUid === user?.uid) {
        await user!.getIdToken(true); // Force refresh
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (targetUid: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    
    try {
      setDeletingId(targetUid);
      const token = await user!.getIdToken();
      await deleteUserAccount(targetUid, token);
      
      setUsers(prev => prev.filter(u => u.uid !== targetUid));
      toast.success("User deleted permanently.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return u.email?.toLowerCase().includes(s) || u.displayName?.toLowerCase().includes(s);
    }
    return true;
  });

  if (loading && users.length === 0) {
    return <PremiumLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users size={24} /> User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered users and assign access roles.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full flex items-center">
          <Search size={16} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table & Cards */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="font-bold text-gray-600">{(u.displayName || u.email || "?")[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              {u.displayName || "Unknown User"}
                            {u.email === superAdminEmail && (
                                <span title="Permanent Super-Admin"><Crown size={12} className="text-yellow-500" /></span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={
                            updatingId === u.uid ||
                            !isSuperAdmin ||           // only super-admin can change
                            u.uid === user?.uid ||     // can't change own role
                            u.email === superAdminEmail // super-admin row is locked
                          }
                          value={u.role || "customer"}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className={cn(
                            "h-8 pl-3 pr-8 rounded-lg text-xs font-bold transition-all outline-none border cursor-pointer appearance-none",
                            u.role === "admin" ? "bg-black text-white border-black" :
                            u.role === "shop_manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            u.role === "order_manager" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-gray-50 text-gray-600 border-gray-200",
                            (updatingId === u.uid || !isSuperAdmin || u.uid === user?.uid || u.email === superAdminEmail) ? "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          {ROLE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u.uid)}
                          disabled={deletingId === u.uid || u.uid === user?.uid}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-block"
                          title={u.uid === user?.uid ? "You cannot delete yourself" : "Delete user"}
                        >
                          {deletingId === u.uid ? (
                            <PremiumSpinner size="sm" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-400 text-sm italic font-medium">
              No users found matching your filters.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.uid} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-black text-lg border border-gray-100">
                    {(u.displayName || u.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm flex items-center gap-1.5 truncate">
                      {u.displayName || "Unknown User"}
                      {u.email === superAdminEmail && (
                        <Crown size={12} className="text-yellow-500" />
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(u.uid)}
                    disabled={deletingId === u.uid || u.uid === user?.uid || u.email === superAdminEmail}
                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    {deletingId === u.uid ? (
                      <PremiumSpinner size="sm" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</p>
                    <p className="text-xs font-bold text-gray-700">{new Date(u.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-1">Access Role</p>
                    <div className="relative inline-block mt-1">
                      <select
                        disabled={
                          updatingId === u.uid ||
                          !isSuperAdmin ||
                          u.uid === user?.uid ||
                          u.email === superAdminEmail
                        }
                        value={u.role || "customer"}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className={cn(
                          "h-9 pl-4 pr-10 rounded-xl text-[11px] font-black transition-all outline-none border appearance-none cursor-pointer",
                          u.role === "admin" ? "bg-black text-white border-black" :
                          u.role === "shop_manager" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          u.role === "order_manager" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-gray-50 text-gray-600 border-gray-200",
                        )}
                      >
                        {ROLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
