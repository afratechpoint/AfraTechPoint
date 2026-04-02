"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  Search,
  X,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import PremiumSpinner from "@/components/PremiumSpinner";
import { authenticatedFetch } from "@/lib/api-helper";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  deleteUrl?: string;
  imgbbId?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filtered, setFiltered] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ usedBytes: number; totalBytes: number; availableBytes: number; percentUsed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authenticatedFetch("/api/upload");
      const data = await res.json();
      setFiles(data);
      setFiltered(data);
    } catch {
      toast.error("Failed to load media files.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/admin/storage-usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.warn("Could not fetch storage usage", e);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchUsage();
  }, [fetchFiles, fetchUsage]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(files.filter((f) => f.name.toLowerCase().includes(q)));
  }, [search, files]);

  const uploadFiles = async (rawFiles: FileList | File[]) => {
    const fileArr = Array.from(rawFiles);
    if (fileArr.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    fileArr.forEach((f) => formData.append("files", f));

    try {
      const res = await authenticatedFetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.files.length} file(s) uploaded successfully!`);
        fetchFiles();
        fetchUsage();
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const handleDelete = async (file: MediaFile) => {
    setDeleting(file.name);
    try {
      const res = await authenticatedFetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      if (res.ok) {
        toast.success(`"${file.name}" deleted.`);
        if (selected?.name === file.name) setSelected(null);
        fetchFiles();
        fetchUsage();
      } else {
        toast.error("Failed to delete file.");
      }
    } catch {
      toast.error("Failed to delete file.");
    } finally {
      setDeleting(null);
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length, icon: ImageIcon, color: "bg-blue-50 text-blue-600" },
          { label: "Total Storage", value: formatBytes(totalSize), icon: HardDrive, color: "bg-purple-50 text-purple-600" },
          { 
            label: "Storage Available", 
            value: usage ? formatBytes(usage.availableBytes) : "20 GB", 
            icon: HardDrive, 
            color: "bg-green-50 text-green-600",
            extra: usage ? (
              <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
                <div role="progressbar" style={{ width: `${usage.percentUsed}%` }} className="h-full bg-green-500 rounded-full" />
              </div>
            ) : null
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
                <p className="text-lg font-black text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
            {(stat as any).extra}
          </div>
        ))}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative w-full rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center py-10 gap-3 group",
          isDragging
            ? "border-black bg-black/5 scale-[1.01]"
            : "border-gray-200 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {isUploading ? (
          <>
            <PremiumSpinner size="lg" />
            <p className="text-sm font-bold text-gray-500">Uploading...</p>
          </>
        ) : (
          <>
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
              isDragging ? "bg-black text-white scale-110" : "bg-white text-gray-400 shadow-sm border border-gray-100 group-hover:border-gray-200 group-hover:text-black"
            )}>
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700 text-sm">
                {isDragging ? "Drop files to upload" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1">or click to browse · PNG, JPG, WebP, GIF, SVG</p>
            </div>
          </>
        )}
      </div>

      {/* Search + Refresh Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium outline-none focus:ring-2 focus:ring-black transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={fetchFiles}
          className="w-11 h-11 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-200 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gallery Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <ImageIcon size={48} className="mb-4 text-gray-200" />
              <p className="font-bold text-gray-500">{search ? "No results found" : "No files uploaded yet"}</p>
              <p className="text-xs mt-1">{search ? "Try a different search term" : "Upload images to get started"}</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence>
                {filtered.map((file) => (
                  <motion.div
                    key={file.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelected(file === selected ? null : file)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group bg-gray-50",
                      selected?.name === file.name
                        ? "border-black shadow-xl shadow-black/10 scale-[1.02]"
                        : "border-transparent hover:border-gray-200"
                    )}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 text-[10px] text-gray-400 font-medium break-all text-center flex items-center justify-center p-2"
                    />
                    {/* Quick action overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                        title="Copy URL"
                      >
                        {copiedUrl === file.url ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-black" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                        title="Delete"
                        disabled={deleting === file.name}
                      >
                        {deleting === file.name
                          ? <PremiumSpinner size="sm" />
                          : <Trash2 size={14} className="text-red-500" />}
                      </button>
                    </div>
                    {/* Selected indicator */}
                    {selected?.name === file.name && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 260 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="shrink-0 overflow-hidden w-full lg:w-auto"
            >
              <div className="w-full lg:w-[260px] bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-gray-900">File Details</p>
                  <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-black transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Preview */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={selected.url} alt={selected.name} className="w-full h-full object-contain p-2" />
                </div>

                {/* Info */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Filename</p>
                    <p className="font-bold text-gray-800 break-all">{selected.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">File Size</p>
                    <p className="font-bold text-gray-800">{formatBytes(selected.size)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Uploaded</p>
                    <p className="font-bold text-gray-800">{new Date(selected.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* URL Copybox */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">File URL</p>
                  <div className="flex gap-2 items-center bg-gray-50 ring-1 ring-gray-100 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-mono text-gray-600 flex-1 truncate">{selected.url}</p>
                    <button
                      onClick={() => copyUrl(selected.url)}
                      className="shrink-0 text-gray-400 hover:text-black transition-colors"
                    >
                      {copiedUrl === selected.url ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyUrl(selected.url)}
                      className="flex-1 h-9 rounded-xl bg-black text-white text-[10px] font-black flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform"
                    >
                      <Copy size={12} /> Copy URL
                    </button>
                    <button
                      onClick={() => handleDelete(selected)}
                      disabled={deleting === selected.name}
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                    >
                      {deleting === selected.name
                        ? <PremiumSpinner size="sm" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>

                  {selected.deleteUrl && (
                    <a
                      href={selected.deleteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-8 rounded-xl border border-red-100 bg-red-50/30 text-red-400 text-[9px] font-bold flex items-center justify-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase tracking-tighter"
                    >
                      <X size={10} /> Manual ImgBB Delete
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
