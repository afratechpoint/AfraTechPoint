"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ImageIcon, Upload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/api-helper";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with ONE url when in single-select mode */
  onSelect: (url: string) => void;
  /** Called with multiple urls when in multi-select mode */
  onSelectMultiple?: (urls: string[]) => void;
  /** When true, Ctrl+click enables selection of multiple images */
  multiSelect?: boolean;
  currentUrl?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  multiSelect = false,
  currentUrl,
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Single-select state
  const [selected, setSelected] = useState<string | null>(currentUrl || null);
  // Multi-select state
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authenticatedFetch("/api/upload");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load media files.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelected(currentUrl || null);
      setMultiSelected(new Set());
      fetchFiles();
    }
  }, [isOpen, currentUrl, fetchFiles]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleUpload = async (fileList: FileList) => {
    if (fileList.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));
    try {
      const res = await authenticatedFetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Uploaded!");
        await fetchFiles();
        if (data.files?.length > 0) {
          setSelected(data.files[data.files.length - 1].url);
        }
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (url: string, e: React.MouseEvent) => {
    if (multiSelect) {
      // Ctrl+click or Cmd+click toggles multi-selection; plain click sets single selection
      if (e.ctrlKey || e.metaKey) {
        setMultiSelected(prev => {
          const next = new Set(prev);
          if (next.has(url)) next.delete(url);
          else next.add(url);
          return next;
        });
      } else {
        // Plain click: toggle this image as the only selection in multi-set
        setMultiSelected(prev => {
          const next = new Set<string>();
          if (!prev.has(url)) next.add(url);
          return next;
        });
      }
    } else {
      setSelected(prev => (prev === url ? null : url));
    }
  };

  const handleConfirm = () => {
    if (multiSelect) {
      const urls = Array.from(multiSelected);
      if (urls.length > 0) {
        if (onSelectMultiple) {
          onSelectMultiple(urls);
        } else {
          // Fallback: call onSelect for each
          urls.forEach(url => onSelect(url));
        }
        onClose();
      }
    } else {
      if (selected) {
        onSelect(selected);
        onClose();
      }
    }
  };

  const selectedCount = multiSelect ? multiSelected.size : (selected ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[780px] z-[201] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-black text-gray-900">Media Library</h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {multiSelect
                    ? "Click to select • Ctrl+Click to select multiple images"
                    : "Select an image to use"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick Upload Button */}
                <label className={cn(
                  "flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all",
                  isUploading
                    ? "bg-gray-100 text-gray-400 pointer-events-none"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black"
                )}>
                  {isUploading
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Upload size={13} />}
                  Upload New
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  />
                </label>
                <button
                  onClick={fetchFiles}
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center transition-all"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Gallery */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
                  <ImageIcon size={48} className="mb-3 text-gray-200" />
                  <p className="font-bold text-gray-500 text-sm">No images found</p>
                  <p className="text-xs mt-1">Upload images using the button above</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                  {files.map((file) => {
                    const isSelected = multiSelect
                      ? multiSelected.has(file.url)
                      : selected === file.url;
                    const selectionIndex = multiSelect
                      ? Array.from(multiSelected).indexOf(file.url) + 1
                      : null;

                    return (
                      <button
                        key={file.name}
                        type="button"
                        onClick={(e) => handleImageClick(file.url, e)}
                        className={cn(
                          "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 group bg-gray-50",
                          isSelected
                            ? "border-black shadow-lg shadow-black/15 scale-[1.03]"
                            : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/20 flex items-start justify-end p-1.5">
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-lg">
                              {multiSelect && selectionIndex ? (
                                <span className="text-[9px] font-black text-white">{selectionIndex}</span>
                              ) : (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                          </div>
                        )}
                        {/* Tooltip: filename */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] text-white font-bold truncate">{file.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between gap-4">
              <div className="text-xs text-gray-500 font-medium">
                {selectedCount > 0 ? (
                  <span className="text-black font-bold">
                    ✓ {selectedCount} image{selectedCount > 1 ? "s" : ""} selected
                    {multiSelect && selectedCount < 2 && (
                      <span className="text-gray-400 font-normal ml-2">Ctrl+Click to select more</span>
                    )}
                  </span>
                ) : (
                  <span>
                    {multiSelect ? "Click an image to select it" : "Select an image from the gallery above"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:text-black hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={selectedCount === 0}
                  className="h-10 px-6 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Check size={13} />
                  Add {selectedCount > 0 ? `${selectedCount} Image${selectedCount > 1 ? "s" : ""}` : "Image"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
