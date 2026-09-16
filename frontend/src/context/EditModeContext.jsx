import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useConfig } from "@/context/ConfigContext";
import { toast } from "sonner";

const EditModeContext = createContext(null);

// ---- path helpers ----
export function getByPath(obj, path) {
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}
export function setByPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
}

export const FIELD_LABELS = {
  "hero.badge": "Badge",
  "hero.titleLine1": "Título — linha 1",
  "hero.titleLine2": "Título — linha 2",
  "hero.subtitle": "Subtítulo",
  "hero.ctaPrimary": "Botão principal",
  "hero.ctaSecondary": "Botão secundário",
  "hero.image": "Imagem do Hero",
  "counter.value": "Contador",
  "counter.suffix": "Sufixo do contador",
  "counter.label": "Rótulo do contador",
  "comoFunciona.title": "Título — Como Funciona",
  "comoFunciona.subtitle": "Subtítulo — Como Funciona",
  "diferenciais.title": "Título — Diferenciais",
  "diferenciais.subtitle": "Subtítulo — Diferenciais",
  "frota.title": "Título — Frota",
  "frota.subtitle": "Subtítulo — Frota",
  "depoimentos.title": "Título — Depoimentos",
  "faq.title": "Título — FAQ",
  "localizacao.title": "Título — Localização",
  "localizacao.subtitle": "Subtítulo — Localização",
  "localizacao.address": "Endereço",
  "localizacao.hours": "Horário",
  "localizacao.phone": "Telefone",
  "localizacao.whatsapp": "WhatsApp",
  "ctaFinal.title": "Título — CTA Final",
  "ctaFinal.subtitle": "Subtítulo — CTA Final",
  "ctaFinal.button": "Botão — CTA Final",
  "footer.description": "Descrição do rodapé",
};

export function getLabelFor(path) {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];
  // Derive from last key
  const last = path.split(".").pop().replace(/([A-Z])/g, " $1").trim();
  return last.charAt(0).toUpperCase() + last.slice(1);
}

// ---- Provider ----
export function EditModeProvider({ children }) {
  const { config, setConfig, saveToServer } = useConfig();
  const [isEditMode, setIsEditMode] = useState(false);
  const [popover, setPopover] = useState(null);
  // popover: { path, type, rect }

  const openPopover = useCallback((path, type, rect) => {
    setPopover({ path, type, rect });
  }, []);

  const closePopover = useCallback(() => setPopover(null), []);

  const updateField = useCallback(
    (path, value) => {
      setConfig((prev) => {
        const next = structuredClone(prev);
        setByPath(next, path, value);
        return next;
      });
    },
    [setConfig]
  );

  const handleSave = useCallback(async () => {
    try {
      await saveToServer(config);
      toast.success("Alterações salvas!");
    } catch {
      toast.warning("Salvo localmente (sem conexão).");
    }
  }, [saveToServer, config]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setPopover(null);
    document.body.removeAttribute("data-nb-edit");
  }, []);

  useEffect(() => {
    if (isEditMode) {
      document.body.setAttribute("data-nb-edit", "");
    } else {
      document.body.removeAttribute("data-nb-edit");
    }
  }, [isEditMode]);

  // Close popover on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closePopover();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePopover]);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        popover,
        openPopover,
        closePopover,
        updateField,
        handleSave,
        exitEditMode,
        config,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used inside EditModeProvider");
  return ctx;
}
