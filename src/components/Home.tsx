import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { WikiArticle, WikiCategory } from "../types";
import { getCategoryIcon } from "./Layout";
import { ArticleCard } from "./ArticleCard";
import { Library, FileText, FolderSync, Edit3, ChevronUp, ChevronDown, Minimize2, Maximize2 } from "lucide-react";
import { TarotLogo } from "./TarotLogo";
import { useCategories } from "../context/CategoryContext";
import { useVisualEditor } from "../context/VisualEditorContext";
import { syncFetch, getCachedArticles } from "../utils/syncArticles";
import { LatestEventsPanel } from "./LatestEventsPanel";
import { WorldMapsBanner } from "./WorldMapsBanner";
import { EditableText } from "./webbuilder/EditableText";
import { CategoryQuickEditModal } from "./webbuilder/CategoryQuickEditModal";

export function Home() {
  const { isVisualEditMode } = useVisualEditor();
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [allArticlesList, setAllArticlesList] = useState<WikiArticle[]>(() => {
    const cached = getCachedArticles();
    return Array.isArray(cached) ? cached : [];
  });
  const [featuredArticles, setFeaturedArticles] = useState<WikiArticle[]>(() => {
    const cached = getCachedArticles();
    if (!Array.isArray(cached) || cached.length === 0) return [];
    const featured = cached.filter((a: WikiArticle) => a.is_featured);
    return featured.length > 0 ? featured.slice(0, 3) : cached.slice(0, 3);
  });
  const [latestArticles, setLatestArticles] = useState<WikiArticle[]>(() => {
    const cached = getCachedArticles();
    return Array.isArray(cached) ? cached.slice(0, 6) : [];
  });
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const { mergedCategories } = useCategories();

  // Category 3-row wheel-stepped pagination state
  const [currentRow, setCurrentRow] = useState(0);
  const [numCols, setNumCols] = useState(4);
  const [cardHeight, setCardHeight] = useState(140);
  const categoryContainerRef = useRef<HTMLDivElement | null>(null);
  const categoryGridRef = useRef<HTMLDivElement | null>(null);
  const currentRowRef = useRef(0);
  const maxRowRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  const [isHomeCategoriesMinimized, setIsHomeCategoriesMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem("tarot_home_categories_minimized") === "true";
    } catch {
      return false;
    }
  });

  const toggleHomeCategoriesMinimized = () => {
    setIsHomeCategoriesMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tarot_home_categories_minimized", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 640) {
        setNumCols(1);
      } else if (window.innerWidth < 1024) {
        setNumCols(2);
      } else {
        setNumCols(4);
      }
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const totalCategoryRows = Math.ceil(mergedCategories.length / numCols);
  const maxCategoryRow = Math.max(0, totalCategoryRows - 3);

  currentRowRef.current = currentRow;
  maxRowRef.current = maxCategoryRow;

  // Clamp currentRow when maxCategoryRow decreases
  useEffect(() => {
    if (currentRow > maxCategoryRow) {
      setCurrentRow(maxCategoryRow);
    }
  }, [maxCategoryRow, currentRow]);

  // Measure card height dynamically
  useEffect(() => {
    if (!categoryGridRef.current) return;
    const firstChild = categoryGridRef.current.firstElementChild as HTMLElement;
    if (firstChild && firstChild.offsetHeight > 0) {
      setCardHeight(firstChild.offsetHeight);
    }
  }, [mergedCategories, numCols]);

  // Native wheel and touch event handling to step row by row cleanly without scrollbars
  useEffect(() => {
    const el = categoryContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;

      const now = Date.now();
      const isDown = e.deltaY > 0;
      const isUp = e.deltaY < 0;

      if (isDown && currentRowRef.current < maxRowRef.current) {
        e.preventDefault();
        if (now - lastWheelTimeRef.current > 260) {
          lastWheelTimeRef.current = now;
          setCurrentRow((r) => {
            const next = Math.min(r + 1, maxRowRef.current);
            currentRowRef.current = next;
            return next;
          });
        }
        return;
      }

      if (isUp && currentRowRef.current > 0) {
        e.preventDefault();
        if (now - lastWheelTimeRef.current > 260) {
          lastWheelTimeRef.current = now;
          setCurrentRow((r) => {
            const next = Math.max(r - 1, 0);
            currentRowRef.current = next;
            return next;
          });
        }
        return;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const deltaY = touchStartYRef.current - e.touches[0].clientY;
      const now = Date.now();

      if (Math.abs(deltaY) > 35) {
        if (deltaY > 0 && currentRowRef.current < maxRowRef.current) {
          e.preventDefault();
          if (now - lastWheelTimeRef.current > 260) {
            lastWheelTimeRef.current = now;
            touchStartYRef.current = e.touches[0].clientY;
            setCurrentRow((r) => Math.min(r + 1, maxRowRef.current));
          }
        } else if (deltaY < 0 && currentRowRef.current > 0) {
          e.preventDefault();
          if (now - lastWheelTimeRef.current > 260) {
            lastWheelTimeRef.current = now;
            touchStartYRef.current = e.touches[0].clientY;
            setCurrentRow((r) => Math.max(r - 1, 0));
          }
        }
      }
    };

    const onTouchEnd = () => {
      touchStartYRef.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const populateArticles = (articles: WikiArticle[]) => {
    const safeArticles = Array.isArray(articles) ? articles.filter(a => a && a.id) : [];
    setAllArticlesList(safeArticles);
    const featured = safeArticles.filter((a: WikiArticle) => a.is_featured);
    setFeaturedArticles(featured.length > 0 ? featured.slice(0, 3) : safeArticles.slice(0, 3));
    setLatestArticles(safeArticles.slice(0, 6));
  };

  useEffect(() => {
    // Initial fetch in background
    Promise.all([
      syncFetch("/api/articles").then((res) => res.json()).catch(() => []),
      fetch("/api/categories").then((res) => res.json()).catch(() => [])
    ])
      .then(([allArticles, fetchedCategories]) => {
        populateArticles(allArticles);
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
      })
      .catch((err) => {
        console.error("Error loading home page content:", err);
      });

    // Listen to background sync updates
    const handleUpdate = () => {
      const fresh = getCachedArticles();
      if (fresh.length > 0) {
        populateArticles(fresh);
      }
    };
    window.addEventListener("wiki-articles-updated", handleUpdate);
    return () => window.removeEventListener("wiki-articles-updated", handleUpdate);
  }, []);

  const gap = 16;
  const visibleRows = Math.min(3, totalCategoryRows);
  const containerHeight = cardHeight * visibleRows + gap * Math.max(0, visibleRows - 1);
  const rowStep = cardHeight + gap;

  return (
    <div className="p-6 lg:p-8 space-y-12">
      {/* Category Quick Edit Modal in Visual Mode */}
      {editingCategory && (
        <CategoryQuickEditModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 lg:p-12">
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <Library className="h-5.5 w-5.5 text-primary" />
            </div>
            <EditableText
              textKey="home.hero.title"
              defaultValue="Libro de Tarot"
              as="h1"
              label="Título Principal"
              className="font-heading text-2xl lg:text-3.5xl font-bold text-foreground tracking-wide"
            />
          </div>

          <div className="mb-6">
            <EditableText
              textKey="home.hero.subtitle"
              defaultValue="La enciclopedia definitiva del universo de Caldo de Dragón. Explora deidades primordiales, héroes de leyenda, dragones mitológicos, órdenes sagradas y reliquias arcanas del Mundo."
              as="p"
              multiline={true}
              label="Descripción Principal"
              className="text-sm lg:text-base text-muted-foreground leading-relaxed font-light"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/45 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">
                {featuredArticles.length + latestArticles.length}+{" "}
                <EditableText
                  textKey="home.hero.articlesSuffix"
                  defaultValue="artículos"
                  label="Etiqueta Artículos"
                />
              </span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5">
              <FolderSync className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">
                {mergedCategories.length}{" "}
                <EditableText
                  textKey="home.hero.categoriesSuffix"
                  defaultValue="categorías"
                  label="Etiqueta Categorías"
                />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Interactivo de Cartografía y Mapas */}
      <WorldMapsBanner />

      {/* Panel de Últimos Acontecimientos / Novedades de Campañas */}
      <LatestEventsPanel articles={allArticlesList} />

      {/* Explore by Category */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TarotLogo className="h-4 w-4 text-primary" />
            <EditableText
              textKey="home.explore.title"
              defaultValue="Explorar por Categoría"
              as="h2"
              label="Título Sección Categorías"
              className="font-heading font-semibold text-lg text-foreground tracking-wider uppercase"
            />
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/40">
              {mergedCategories.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle minimize button */}
            <button
              type="button"
              onClick={toggleHomeCategoriesMinimized}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors"
              title={isHomeCategoriesMinimized ? "Desplegar categorías de Lore" : "Minimizar categorías de Lore"}
              aria-label={isHomeCategoriesMinimized ? "Desplegar categorías" : "Minimizar categorías"}
            >
              {isHomeCategoriesMinimized ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline font-medium">Desplegar</span>
                </>
              ) : (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline font-medium">Minimizar</span>
                </>
              )}
            </button>

            {/* Stepped Row Indicator & Controls */}
            {!isHomeCategoriesMinimized && totalCategoryRows > 3 && (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground select-none">
                <span className="text-[11px] font-mono tracking-tight text-muted-foreground/80">
                  Fila {currentRow + 1}–{Math.min(currentRow + 3, totalCategoryRows)} de {totalCategoryRows}
                </span>
                <div className="flex items-center bg-secondary/40 border border-border/50 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrentRow((r) => Math.max(0, r - 1))}
                    disabled={currentRow === 0}
                    className="p-1 rounded hover:bg-secondary text-foreground disabled:opacity-25 disabled:pointer-events-none transition-colors"
                    aria-label="Fila anterior"
                    title="Fila anterior"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRow((r) => Math.min(maxCategoryRow, r + 1))}
                    disabled={currentRow >= maxCategoryRow}
                    className="p-1 rounded hover:bg-secondary text-foreground disabled:opacity-25 disabled:pointer-events-none transition-colors"
                    aria-label="Siguiente fila"
                    title="Siguiente fila"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimized categories shelf */}
        {isHomeCategoriesMinimized ? (
          <div
            onClick={toggleHomeCategoriesMinimized}
            className="cursor-pointer bg-card/40 border border-border/60 hover:border-primary/50 rounded-xl p-3 sm:p-4 flex items-center justify-between transition-all group shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                Categorías de lore minimizadas ({mergedCategories.length} disponibles)
              </span>
              <div className="flex items-center gap-1.5 overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
                {mergedCategories.slice(0, 8).map((c) => {
                  const CatIcon = c.icon;
                  return (
                    <span
                      key={c.slug}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-secondary/60 border border-border/40 shrink-0"
                      title={c.name}
                    >
                      <CatIcon className="h-3.5 w-3.5" style={{ color: c.color }} />
                    </span>
                  );
                })}
                {mergedCategories.length > 8 && (
                  <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded border border-border/30">
                    +{mergedCategories.length - 8}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-primary font-medium flex items-center gap-1 shrink-0 group-hover:underline">
              Desplegar <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
        ) : (
          /* Categories container: exactly 3 rows high, NO visible container styling, NO scrollbar */
          <div
            ref={categoryContainerRef}
            className="relative overflow-hidden w-full select-none"
            style={{ height: `${containerHeight}px` }}
          >
            <div
              ref={categoryGridRef}
              style={{
                transform: `translateY(-${currentRow * rowStep}px)`,
                transition: "transform 320ms cubic-bezier(0.2, 0.8, 0.25, 1)"
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {mergedCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.slug} className="relative group">
                    <Link
                      to={isVisualEditMode ? "#" : `/categoria/${cat.slug}`}
                      onClick={(e) => {
                        if (isVisualEditMode) {
                          e.preventDefault();
                          setEditingCategory(cat);
                        }
                      }}
                      className={`block bg-card border border-border/75 rounded-xl p-4 sm:p-5 hover:border-primary/45 transition-all hover:bg-secondary/20 hover:shadow-sm h-[140px] flex flex-col justify-between ${
                        isVisualEditMode ? "cursor-pointer ring-1 ring-primary/20 hover:ring-primary/60" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors"
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: cat.color }} />
                          </div>
                          {isVisualEditMode && (
                            <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                              <Edit3 className="h-2.5 w-2.5" />
                              Editar
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-wide uppercase line-clamp-1">
                          {cat.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-light">
                        {cat.description || "Categoría mística de la enciclopedia de Caldo de Dragón."}
                      </p>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="space-y-5">
          <EditableText
            textKey="home.featured.title"
            defaultValue="Artículos Destacados"
            as="h2"
            label="Título Destacados"
            className="font-heading font-semibold text-lg text-foreground tracking-wider uppercase"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="space-y-5">
        <EditableText
          textKey="home.latest.title"
          defaultValue="Últimos Artículos Añadidos"
          as="h2"
          label="Título Últimos Artículos"
          className="font-heading font-semibold text-lg text-foreground tracking-wider uppercase"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
