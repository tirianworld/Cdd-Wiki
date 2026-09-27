import React, { createContext, useContext, useState, useEffect } from "react";
import { WikiCategory } from "../types";
import { MergedCategory, mergeCategories, setGlobalMergedCategories } from "../utils/categoryHelper";

interface CategoryContextType {
  customCategories: WikiCategory[];
  mergedCategories: MergedCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  addCategory: (name: string, description: string, color?: string, icon?: string) => Promise<WikiCategory>;
  updateCategory: (id: string, name: string, description: string, color?: string, icon?: string) => Promise<WikiCategory>;
  deleteCategory: (id: string) => Promise<void>;
  reassignCategory: (categoryId: string) => Promise<{ id: string; title: string; oldCategory: string; newCategory: string }[]>;
  confirmReassign: (reassignments: { id: string; newCategory: string }[]) => Promise<number>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [customCategories, setCustomCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCustomCategories(data);
        setError(null);
      } else {
        throw new Error("No se pudieron cargar las categorías del servidor.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con la biblioteca.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const addCategory = async (name: string, description: string, color?: string, icon?: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      const newCat: Partial<WikiCategory> = {
        name,
        slug,
        description,
        color: color || "#" + Math.floor(Math.random() * 16777215).toString(16),
        icon: icon || "BookOpen"
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al registrar la nueva categoría.");
      }

      const created: WikiCategory = await res.json();
      await refreshCategories();
      return created;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateCategory = async (id: string, name: string, description: string, color?: string, icon?: string) => {
    try {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      const updatedCat: Partial<WikiCategory> = {
        name,
        slug,
        description,
        color: color || "#c8a96e",
        icon: icon || "BookOpen"
      };

      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCat)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al actualizar la categoría.");
      }

      const updated: WikiCategory = await res.json();
      await refreshCategories();
      return updated;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al eliminar la categoría.");
      }

      await refreshCategories();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const reassignCategory = async (categoryId: string) => {
    try {
      const res = await fetch("/api/ai/reassign-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error en el ritual de reasignación.");
      }

      const data = await res.json();
      return data.suggestions || [];
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const confirmReassign = async (reassignments: { id: string; newCategory: string }[]) => {
    try {
      const res = await fetch("/api/ai/confirm-reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reassignments })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al confirmar las reasignaciones.");
      }

      const data = await res.json();
      return data.updatedCount || 0;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const mergedCategories = mergeCategories(customCategories);

  useEffect(() => {
    setGlobalMergedCategories(mergedCategories);
  }, [mergedCategories]);

  return (
    <CategoryContext.Provider
      value={{
        customCategories,
        mergedCategories,
        loading,
        error,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        reassignCategory,
        confirmReassign
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories debe ser usado dentro de un CategoryProvider.");
  }
  return context;
}
