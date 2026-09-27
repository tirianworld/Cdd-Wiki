import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Default standard site texts
export const DEFAULT_SITE_UI: Record<string, string> = {
  // Brand & Header
  "nav.brand": "DRAGOPEDIA",
  "nav.searchPlaceholder": "Buscar...",
  
  // Navigation Sidebar
  "nav.section.home": "Home",
  "nav.menu.inicio": "Inicio",
  "nav.menu.nuevo": "Nuevo artículo",
  "nav.section.tarotAI": "Tarot AI",
  "nav.menu.tarotAI": "Escriba de Tarot AI",
  "nav.menu.tarotChat": "Chat con Tarot AI",
  "nav.section.applications": "Aplicaciones",
  "nav.menu.grafo": "Grafo del mundo",
  "nav.menu.mundo": "Explorar Mundo",
  "nav.menu.spellbook": "Libro de Hechizos",
  "nav.menu.diario": "Diario del Cazador",
  "nav.menu.arbol": "Árbol Genealógico",
  "nav.menu.filtros": "Gestión de Filtros",
  "nav.categoriesHeader": "Categorías de Lore",
  "nav.footer.title": "Archivero de Tarot v1.0",
  "nav.footer.subtitle": "Enciclopedia del universo de Caldo de Dragón.",

  // Home Hero & Sections
  "home.hero.title": "Libro de Tarot",
  "home.hero.subtitle": "La enciclopedia definitiva del universo de Caldo de Dragón. Explora deidades primordiales, héroes de leyenda, dragones mitológicos, órdenes sagradas y reliquias arcanas del Mundo.",
  "home.hero.articlesSuffix": "artículos",
  "home.hero.categoriesSuffix": "categorías",
  "home.explore.title": "Explorar por Categoría",
  "home.featured.title": "Artículos Destacados",
  "home.latest.title": "Últimos Artículos Añadidos",

  // Events panel
  "events.sectionTitle": "Últimos Acontecimientos",
  "events.addBtn": "Añadir Acontecimiento",
  "events.searchPlaceholder": "Buscar acontecimientos, lugares o personajes...",
  "events.empty": "No hay acontecimientos registrados.",

  // General & Labels
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.reset": "Restablecer original",
  "common.edit": "Editar texto"
};

interface UIContentContextType {
  uiTexts: Record<string, string>;
  getText: (key: string, fallback?: string) => string;
  setText: (key: string, value: string) => Promise<boolean>;
  setMultipleTexts: (entries: Record<string, string>) => Promise<boolean>;
  resetText: (key: string) => Promise<boolean>;
  resetAllTexts: () => Promise<boolean>;
  isUIInspectorOpen: boolean;
  setIsUIInspectorOpen: (open: boolean) => void;
  activeEditingKey: string | null;
  setActiveEditingKey: (key: string | null) => void;
  activeCategoryForEdit: any | null;
  setActiveCategoryForEdit: (cat: any | null) => void;
}

const UIContentContext = createContext<UIContentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "dragopedia_custom_ui_texts";

export function UIContentProvider({ children }: { children: React.ReactNode }) {
  const [uiTexts, setUiTexts] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_SITE_UI, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn("Error reading custom UI from localStorage:", e);
    }
    return { ...DEFAULT_SITE_UI };
  });

  const [isUIInspectorOpen, setIsUIInspectorOpen] = useState(false);
  const [activeEditingKey, setActiveEditingKey] = useState<string | null>(null);
  const [activeCategoryForEdit, setActiveCategoryForEdit] = useState<any | null>(null);

  // Sync with backend on mount
  useEffect(() => {
    fetch("/api/site-ui-config")
      .then((res) => res.json())
      .then((serverConfig) => {
        if (serverConfig && typeof serverConfig === "object") {
          setUiTexts((prev) => {
            const merged = { ...DEFAULT_SITE_UI, ...prev, ...serverConfig };
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn("Could not sync custom UI texts from backend:", err);
      });
  }, []);

  const getText = useCallback((key: string, fallback?: string): string => {
    if (uiTexts[key] !== undefined && uiTexts[key] !== null && uiTexts[key] !== "") {
      return uiTexts[key];
    }
    if (fallback !== undefined) {
      return fallback;
    }
    return DEFAULT_SITE_UI[key] || key;
  }, [uiTexts]);

  const setText = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const updated = { ...uiTexts, [key]: value };
      setUiTexts(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}

      // Background persist to server
      fetch("/api/site-ui-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      }).catch((e) => console.warn("Failed to persist UI text to server:", e));

      return true;
    } catch (err) {
      console.error("Error setting custom UI text:", err);
      return false;
    }
  }, [uiTexts]);

  const setMultipleTexts = useCallback(async (entries: Record<string, string>): Promise<boolean> => {
    try {
      const updated = { ...uiTexts, ...entries };
      setUiTexts(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}

      fetch("/api/site-ui-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries)
      }).catch((e) => console.warn("Failed to persist UI texts batch:", e));

      return true;
    } catch (err) {
      console.error("Error setting multiple UI texts:", err);
      return false;
    }
  }, [uiTexts]);

  const resetText = useCallback(async (key: string): Promise<boolean> => {
    try {
      const updated = { ...uiTexts };
      if (DEFAULT_SITE_UI[key] !== undefined) {
        updated[key] = DEFAULT_SITE_UI[key];
      } else {
        delete updated[key];
      }
      setUiTexts(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}

      fetch("/api/site-ui-config/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
      }).catch((e) => console.warn("Failed to reset UI text on server:", e));

      return true;
    } catch (err) {
      console.error("Error resetting UI text:", err);
      return false;
    }
  }, [uiTexts]);

  const resetAllTexts = useCallback(async (): Promise<boolean> => {
    try {
      setUiTexts({ ...DEFAULT_SITE_UI });
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {}

      fetch("/api/site-ui-config/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetAll: true })
      }).catch((e) => console.warn("Failed to reset all UI texts on server:", e));

      return true;
    } catch (err) {
      console.error("Error resetting all UI texts:", err);
      return false;
    }
  }, []);

  return (
    <UIContentContext.Provider
      value={{
        uiTexts,
        getText,
        setText,
        setMultipleTexts,
        resetText,
        resetAllTexts,
        isUIInspectorOpen,
        setIsUIInspectorOpen,
        activeEditingKey,
        setActiveEditingKey,
        activeCategoryForEdit,
        setActiveCategoryForEdit
      }}
    >
      {children}
    </UIContentContext.Provider>
  );
}

export function useUIContent() {
  const context = useContext(UIContentContext);
  if (!context) {
    throw new Error("useUIContent must be used within a UIContentProvider");
  }
  return context;
}
