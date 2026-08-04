import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import defaultConfig from "@/data/defaultConfig";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const STORAGE_KEY = "nb_locacoes_config";

const ConfigContext = createContext(null);

// Deep merge that keeps default keys but overrides with stored values.
function deepMerge(base, override) {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }
  if (typeof base === "object" && base !== null) {
    const out = { ...base };
    if (override && typeof override === "object") {
      Object.keys(override).forEach((key) => {
        out[key] = key in base ? deepMerge(base[key], override[key]) : override[key];
      });
    }
    return out;
  }
  return override === undefined ? base : override;
}

function hexToRgb(hex) {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return "0 229 255";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// Darken a hex color toward black by a factor (0..1). Used for legible accent text on light bg.
function darkenHex(hex, factor = 0.45) {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return "#006773";
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor);
  const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHslString(hex) {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return null;
  let r = parseInt(clean.slice(0, 2), 16) / 255;
  let g = parseInt(clean.slice(2, 4), 16) / 255;
  let b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(colors) {
  const root = document.documentElement;
  const accent = colors?.accent || "#00E5FF";
  const bg = colors?.background || "#F4F5F7";
  root.style.setProperty("--nb-accent", accent);
  root.style.setProperty("--nb-accent-rgb", hexToRgb(accent));
  root.style.setProperty("--nb-accent-ink", darkenHex(accent, 0.45));
  root.style.setProperty("--nb-bg", bg);
  const hsl = hexToHslString(accent);
  if (hsl) {
    root.style.setProperty("--primary", hsl);
    root.style.setProperty("--ring", hsl);
  }
}

export function ConfigProvider({ children }) {
  const [config, setConfigState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return deepMerge(defaultConfig, JSON.parse(stored));
    } catch (e) {
      /* ignore */
    }
    return defaultConfig;
  });
  const [loaded, setLoaded] = useState(false);

  // Apply theme whenever colors change
  useEffect(() => {
    applyTheme(config.colors);
  }, [config.colors]);

  // Hydrate from backend on first mount (shared config wins over local default)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${API}/config`);
        if (active && res.data && res.data.data) {
          setConfigState(deepMerge(defaultConfig, res.data.data));
        }
      } catch (e) {
        /* offline: keep local */
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistLocal = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      /* ignore quota */
    }
  }, []);

  // Update a top-level section immutably
  const updateSection = useCallback(
    (section, value) => {
      setConfigState((prev) => {
        const next = { ...prev, [section]: value };
        persistLocal(next);
        return next;
      });
    },
    [persistLocal]
  );

  const setConfig = useCallback(
    (next) => {
      setConfigState(next);
      persistLocal(next);
    },
    [persistLocal]
  );

  // Save to backend so all visitors see the change
  const saveToServer = useCallback(async (cfg) => {
    await axios.put(`${API}/config`, { data: cfg });
  }, []);

  const resetConfig = useCallback(async () => {
    setConfigState(defaultConfig);
    try {
      localStorage.removeItem(STORAGE_KEY);
      await axios.delete(`${API}/config`);
    } catch (e) {
      /* ignore */
    }
  }, []);

  return (
    <ConfigContext.Provider
      value={{ config, setConfig, updateSection, saveToServer, resetConfig, loaded }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}
