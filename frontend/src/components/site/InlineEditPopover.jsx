import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEditMode, getByPath, getLabelFor } from "@/context/EditModeContext";
import { uploadToServer } from "@/lib/upload";
import { toast } from "sonner";

const POPOVER_W = 310;

function usePosition(rect) {
  if (!rect) return { top: -9999, left: -9999 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Horizontal: prefer left-aligned with element
  let left = rect.left;
  if (left + POPOVER_W > vw - 10) left = vw - POPOVER_W - 10;
  if (left < 10) left = 10;

  // Vertical: below element, but flip up if not enough space
  const belowY = rect.bottom + 8;
  const aboveY = rect.top - 8; // "bottom" of the popover if placed above
  const fitsBelow = belowY + 260 < vh;
  const top = fitsBelow ? belowY : aboveY - 260;

  return { top, left };
}

export default function InlineEditPopover() {
  const { popover, closePopover, updateField, config } = useEditMode();
  const [localValue, setLocalValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const firstInputRef = useRef(null);

  const { path, type, rect } = popover || {};
  const currentValue = popover ? String(getByPath(config, path) ?? "") : "";
  const pos = usePosition(rect);

  // Sync local value when popover opens/changes
  useEffect(() => {
    if (popover) {
      setLocalValue(currentValue);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popover?.path]);

  // Live update config as user types
  const handleChange = (val) => {
    setLocalValue(val);
    updateField(path, type === "number" ? Number(val) : val);
  };

  // Image upload helpers
  const handleImageFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem muito grande (máx. 10MB)."); return; }
    setUploading(true);
    try {
      const url = await uploadToServer(file);
      setLocalValue(url);
      updateField(path, url);
      toast.success("Imagem atualizada!");
    } catch {
      toast.error("Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  if (!popover) return null;

  return (
    <>
      {/* backdrop — click outside closes */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={closePopover}
        aria-hidden
      />

      <div
        data-nb-popover
        style={{ top: pos.top, left: pos.left, width: POPOVER_W, zIndex: 9999 }}
        className="fixed rounded-2xl glass-dark border border-accent-nb/40 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-accent-nb truncate pr-2">
            {getLabelFor(path)}
          </p>
          <button
            onClick={closePopover}
            aria-label="Fechar editor"
            className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Text input */}
        {type === "text" && (
          <Input
            ref={firstInputRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-[#0e0e0f] border-white/15 text-white text-sm"
            onKeyDown={(e) => e.key === "Enter" && closePopover()}
          />
        )}

        {/* Number input */}
        {type === "number" && (
          <Input
            ref={firstInputRef}
            type="number"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-[#0e0e0f] border-white/15 text-white text-sm"
          />
        )}

        {/* Textarea */}
        {type === "textarea" && (
          <Textarea
            ref={firstInputRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className="bg-[#0e0e0f] border-white/15 text-white text-sm resize-none"
          />
        )}

        {/* Image */}
        {type === "image" && (
          <div className="space-y-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleImageFile(e.dataTransfer.files?.[0]); }}
              className={`rounded-xl border-2 border-dashed p-3 text-center cursor-pointer transition-all ${
                dragging ? "border-accent-nb bg-accent-nb/10" : "border-white/15 hover:border-accent-nb/50"
              }`}
            >
              {localValue ? (
                <img src={localValue} alt="preview" className="h-24 w-full object-contain rounded-lg mb-2" />
              ) : null}
              {uploading ? (
                <p className="text-xs text-white/50 flex items-center justify-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Enviando…
                </p>
              ) : (
                <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  {dragging ? "Solte para enviar" : "Arraste ou clique para trocar"}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleImageFile(e.target.files?.[0])}
              />
            </div>
            <Input
              ref={firstInputRef}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Ou cole uma URL"
              className="bg-[#0e0e0f] border-white/15 text-white text-xs"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={closePopover}
            className="bg-accent-nb text-[#0a0a0a] hover:bg-accent-nb/90 h-8 px-4 text-xs gap-1.5"
          >
            <Check className="h-3.5 w-3.5" /> Feito
          </Button>
        </div>
      </div>
    </>
  );
}
