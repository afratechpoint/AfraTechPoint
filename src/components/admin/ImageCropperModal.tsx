"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/canvasUtils";
import { X, Check, Loader2, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCropperModalProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export default function ImageCropperModal({
  image,
  isOpen,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCrop = async () => {
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 z-[301] flex items-center justify-center p-2 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-[440px] max-h-full bg-[#121418] rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto border border-white/5 ring-1 ring-white/10"
            >
              {/* Header */}
              <div className="px-5 py-3.5 flex items-center justify-between shrink-0 bg-white/[0.02] border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center">
                    <Scissors size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-[13px] tracking-tight">Logo Editor</h2>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Edit for 512x512 output</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/5 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Cropper area — Fully Flexible */}
              <div className="relative flex-1 bg-black min-h-[260px] md:min-h-[340px] overflow-hidden">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={onCropChange}
                  onCropComplete={onCropCompleteHandler}
                  onZoomChange={onZoomChange}
                  cropShape="rect"
                  showGrid={true}
                  classes={{
                    containerClassName: "rounded-none",
                    cropAreaClassName: "border border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                  }}
                />
              </div>

              {/* Controls */}
              <div className="p-5 space-y-4 bg-black/40 shrink-0">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    <span>Precision Zoom</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded-md font-mono">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e: any) => onZoomChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={onClose}
                    className="flex-1 h-11 rounded-xl bg-white/5 text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCrop}
                    disabled={isProcessing}
                    className="flex-[2] h-11 rounded-xl bg-white text-black text-[10px] font-black flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={16} strokeWidth={3} />
                        Save Logo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
