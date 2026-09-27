import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { WikiArticle } from "../types";
import { getCategoryIcon } from "./Layout";
import { ArticleCard } from "./ArticleCard";
import { Search, ArrowLeft, BookOpen } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { syncFetch, getCachedArticles } from "../utils/syncArticles";

export function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const { mergedCategories } = useCategories();
  const currentCategory = mergedCategories.find((c) => c.slug === slug);
  const Icon = currentCategory ? currentCategory.icon : BookOpen;
  const themeColor = currentCategory ? currentCategory.color : "#a0a0a0";

  const [articles, setArticles] = useState<WikiArticle[]>(() => {
    const cached = getCachedArticles();
    if (currentCategory && Array.isArray(cached)) {
      return cached.filter(
        (a: WikiArticle) => a && a.category && typeof a.category === "string" && a.category.toLowerCase() === currentCategory.name.toLowerCase()
      );
    }
    return [];
  });
  const [filterQuery, setFilterQuery] = useState("");

  // Selectable filters state
  const [selCampana, setSelCampana] = useState("");
  const [selContinente, setSelContinente] = useState("");
  const [selPlano, setSelPlano] = useState("");
  const [selCriatura, setSelCriatura] = useState("");
  const [sortBy, setSortBy] = useState("created_newest");
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({
    campaña: [],
    continente: [],
    plano: [],
    criatura: []
  });

  const updateCategoryArticles = (allArticles: WikiArticle[]) => {
    const safeArticles = Array.isArray(allArticles) ? allArticles.filter(a => a && a.id) : [];
    if (currentCategory) {
      const catArticles = safeArticles.filter(
        (a: WikiArticle) => a && a.category && typeof a.category === "string" && a.category.toLowerCase() === currentCategory.name.toLowerCase()
      );
      setArticles(catArticles);
    } else {
      setArticles([]);
    }
  };

  useEffect(() => {
    setFilterQuery(""); // Reset query
    setSelCampana("");
    setSelContinente("");
    setSelPlano("");
    setSelCriatura("");

    // Check cached articles first
    const cached = getCachedArticles();
    if (cached.length > 0) {
      updateCategoryArticles(cached);
    }

    Promise.all([
      syncFetch("/api/articles").then((res) => res.json()).catch(() => []),
      fetch("/api/filter-categories").then((res) => res.json()).catch(() => ({ campaña: [], continente: [], plano: [], criatura: [] }))
    ])
      .then(([allArticles, filterData]) => {
        updateCategoryArticles(allArticles);
        setAvailableFilters(filterData || { campaña: [], continente: [], plano: [], criatura: [] });
      })
      .catch((err) => {
        console.error("Error loading category content:", err);
      });

    const handleUpdate = () => {
      const fresh = getCachedArticles();
      if (fresh.length > 0) {
        updateCategoryArticles(fresh);
      }
    };
    window.addEventListener("wiki-articles-updated", handleUpdate);
    return () => window.removeEventListener("wiki-articles-updated", handleUpdate);
  }, [slug, currentCategory]);

  // Multi-tier filtering
  const filteredArticles = (Array.isArray(articles) ? articles : []).filter((a) => {
    if (!a) return false;
    const lowerFilter = filterQuery.toLowerCase();
    // Text search filter
    const titleMatch = (a.title && typeof a.title === "string") ? a.title.toLowerCase().includes(lowerFilter) : false;
    const summaryMatch = (a.summary && typeof a.summary === "string") ? a.summary.toLowerCase().includes(lowerFilter) : false;
    const matchesQuery = !filterQuery.trim() || titleMatch || summaryMatch;
    if (!matchesQuery) return false;

    // Campaña filter
    if (selCampana) {
      const hasCampana = a.filters?.campaña?.some((v: string) => v && typeof v === "string" && v.toLowerCase() === selCampana.toLowerCase());
      if (!hasCampana) return false;
    }

    // Continente filter
    if (selContinente) {
      const hasContinente = a.filters?.continente?.some((v: string) => v && typeof v === "string" && v.toLowerCase() === selContinente.toLowerCase());
      if (!hasContinente) return false;
    }

    // Plano filter
    if (selPlano) {
      const hasPlano = a.filters?.plano?.some((v: string) => v.toLowerCase() === selPlano.toLowerCase());
      if (!hasPlano) return false;
    }

    // Criatura filter
    if (selCriatura) {
      const hasCriatura = a.filters?.criatura?.some((v: string) => v.toLowerCase() === selCriatura.toLowerCase()) ||
                          a.filters?.entidad?.some((v: string) => v.toLowerCase() === selCriatura.toLowerCase());
      if (!hasCriatura) return false;
    }

    return true;
  });

  // Sort articles based on selection
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "created_newest") {
      const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
      const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === "created_oldest") {
      const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
      const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
      return dateA - dateB;
    }
    if (sortBy === "name_asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "name_desc") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{currentCategory?.name || "Categoría"}</span>
      </div>

      {/* Category Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-border/60">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}15`, border: `1px solid ${themeColor}30` }}
            >
              <Icon className="h-5 w-5" style={{ color: themeColor }} />
            </div>
            <h1 className="font-heading text-xl lg:text-3xl font-bold text-foreground tracking-wide">
              {currentCategory?.name || "Categoría"}
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-xl font-light">
            {currentCategory?.desc || "Explora las descripciones, documentos y datos históricos agrupados en esta categoría de lore."}
          </p>
        </div>

        {/* Search inside Category */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filtrar en ${currentCategory?.name || "Categoría"}...`}
            className="w-full h-8 pl-9 pr-3 text-xs bg-secondary/70 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all"
          />
        </div>
      </div>

      {/* Dropdown Filters (Desplegables) */}
      <div className="bg-card border border-border/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Campaña</label>
          <select
            value={selCampana}
            onChange={(e) => setSelCampana(e.target.value)}
            className="w-full h-8 px-2.5 bg-secondary border border-border/80 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 text-xs transition-all"
          >
            <option value="">Todas las campañas</option>
            {(availableFilters.campaña || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Continente</label>
          <select
            value={selContinente}
            onChange={(e) => setSelContinente(e.target.value)}
            className="w-full h-8 px-2.5 bg-secondary border border-border/80 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 text-xs transition-all"
          >
            <option value="">Todos los continentes</option>
            {(availableFilters.continente || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Plano de Existencia</label>
          <select
            value={selPlano}
            onChange={(e) => setSelPlano(e.target.value)}
            className="w-full h-8 px-2.5 bg-secondary border border-border/80 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 text-xs transition-all"
          >
            <option value="">Todos los planos</option>
            {(availableFilters.plano || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Criatura / Especie</label>
          <select
            value={selCriatura}
            onChange={(e) => setSelCriatura(e.target.value)}
            className="w-full h-8 px-2.5 bg-secondary border border-border/80 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 text-xs transition-all"
          >
            <option value="">Todas las criaturas</option>
            {(availableFilters.criatura || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Ordenar Por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-8 px-2.5 bg-secondary border border-border/80 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 text-xs transition-all font-medium text-primary"
          >
            <option value="created_newest">Fecha de creación (Más nuevos)</option>
            <option value="created_oldest">Fecha de creación (Más antiguos)</option>
            <option value="name_asc">Nombre (A - Z)</option>
            <option value="name_desc">Nombre (Z - A)</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {sortedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card/15 border border-dashed border-border rounded-xl">
          <BookOpen className="h-10 w-10 text-muted-foreground/45 mx-auto mb-3" />
          <h3 className="font-heading font-medium text-sm text-foreground">No se encontraron artículos</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed font-light">
            {filterQuery || selCampana || selContinente || selPlano || selCriatura
              ? "No hay registros que coincidan con la combinación de filtros seleccionada." 
              : "Aún no se han redactado crónicas o registros en esta sección."}
          </p>
          {!(filterQuery || selCampana || selContinente || selPlano || selCriatura) && (
            <Link 
              to="/nuevo" 
              className="mt-4 inline-flex items-center text-xs px-3.5 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-md hover:bg-primary/35 transition-all font-medium"
            >
              Redactar Primer Artículo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
