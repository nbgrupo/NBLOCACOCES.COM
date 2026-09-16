import React from "react";
import { Pencil, Save, X } from "lucide-react";
import { useEditMode } from "@/context/EditModeContext";
import { Button } from "@/components/ui/button";
import InlineEditPopover from "@/components/site/InlineEditPopover";

export default function EditModeBar() {
  const { isEditMode, handleSave, exitEditMode } = useEditMode();

  if (!isEditMode) return null;

  return (
    <>
      {/* Floating bar at the bottom */}
      <div
        data-nb-popover
        className="fixed bottom-0 left-0 right-0 z-[9990] flex items-center justify-between gap-4 px-5 py-3 glass-dark border-t border-accent-nb/40 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-accent-nb animate-pulse shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-nb hidden sm:block">
            Modo Edição
          </span>
          <span className="text-xs text-white/50 hidden sm:block">
            — clique em qualquer texto ou imagem para editar
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-accent-nb text-[#0a0a0a] hover:bg-accent-nb/90 h-8 px-4 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> Salvar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exitEditMode}
            className="border-white/15 text-white hover:bg-white/10 h-8 px-3 text-xs gap-1.5"
          >
            <X className="h-3.5 w-3.5" /> Sair
          </Button>
        </div>
      </div>

      {/* The floating popover renders here */}
      <InlineEditPopover />
    </>
  );
}
