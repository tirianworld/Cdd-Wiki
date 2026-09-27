import { 
  Users, MapPin, Calendar, Sparkles, Flame, Shield, Heart, Gem, BookOpen, LucideIcon,
  Skull, Sword, Crown, Compass, Wand2, Hourglass, Eye, Map, Feather, Key,
  Mountain, TreePine, Anchor, Sun, Moon, Ghost, Trophy, Crosshair, Hammer, Coins,
  Grape, Infinity as InfinityIcon, Wind, Waves, Leaf, PawPrint,
  AppWindow, Boxes, Layers, Bot, Cpu
} from "lucide-react";
import { TarotLogo } from "../components/TarotLogo";
import { WikiCategory } from "../types";

export interface MergedCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  desc?: string;
  color: string;
  icon: LucideIcon | React.ComponentType<any>;
  iconName?: string;
  isCustom?: boolean;
}

export const ICON_MAP: Record<string, LucideIcon | React.ComponentType<any>> = {
  Users, MapPin, Calendar, Sparkles, Flame, Shield, Heart, Gem, BookOpen,
  Skull, Sword, Crown, Compass, Wand2, Hourglass, Eye, Map, Feather, Key,
  Mountain, TreePine, Anchor, Sun, Moon, Ghost, Trophy, Crosshair, Hammer, Coins,
  Grape, Infinity: InfinityIcon, Wind, Waves, Leaf,
  PawPrint,
  Paw: PawPrint,
  paw: PawPrint,
  pawprint: PawPrint,
  Pata: PawPrint,
  pata: PawPrint,
  TarotLogo, 
  TarotAISeal: TarotLogo,
  TarotAI: TarotLogo,
  "Tarot AI": TarotLogo,
  tarot: TarotLogo,
  tarotai: TarotLogo,
  AppWindow,
  Boxes,
  Layers,
  Bot,
  Cpu,
  Aplicaciones: AppWindow,
  aplicaciones: AppWindow,
  app: AppWindow,
  apps: AppWindow
};

export const AVAILABLE_ICONS = [
  { name: "TarotLogo", label: "Sello Tarot AI / Inteligencia / Oráculo", icon: TarotLogo },
  { name: "AppWindow", label: "Ventana de Aplicación / Software / Herramienta", icon: AppWindow },
  { name: "Boxes", label: "Cajas / Módulos / Ecosistema", icon: Boxes },
  { name: "Layers", label: "Capas / Sistemas / Integraciones", icon: Layers },
  { name: "PawPrint", label: "Pata de animal / Mascotas / Fauna", icon: PawPrint },
  { name: "Flame", label: "Fuego / Dragón", icon: Flame },
  { name: "Users", label: "Personajes", icon: Users },
  { name: "MapPin", label: "Lugares", icon: MapPin },
  { name: "Calendar", label: "Eventos", icon: Calendar },
  { name: "Sparkles", label: "Magia / Dioses", icon: Sparkles },
  { name: "Shield", label: "Organizaciones", icon: Shield },
  { name: "Heart", label: "Familia / Amor", icon: Heart },
  { name: "Gem", label: "Objetos / Joyas", icon: Gem },
  { name: "BookOpen", label: "Libros / Saber", icon: BookOpen },
  { name: "Skull", label: "Muerte / Peligros", icon: Skull },
  { name: "Sword", label: "Espadas / Combate", icon: Sword },
  { name: "Crown", label: "Corona / Realeza", icon: Crown },
  { name: "Compass", label: "Brújula / Viajes", icon: Compass },
  { name: "Wand2", label: "Varita / Arcano", icon: Wand2 },
  { name: "Hourglass", label: "Reloj / Historia", icon: Hourglass },
  { name: "Eye", label: "Ojo / Sabiduría", icon: Eye },
  { name: "Map", label: "Mapa / Territorios", icon: Map },
  { name: "Feather", label: "Pluma / Escritos", icon: Feather },
  { name: "Key", label: "Llave / Secretos", icon: Key },
  { name: "Mountain", label: "Montaña / Regiones", icon: Mountain },
  { name: "TreePine", label: "Bosque / Naturaleza", icon: TreePine },
  { name: "Anchor", label: "Ancla / Puertos", icon: Anchor },
  { name: "Sun", label: "Sol / Luz", icon: Sun },
  { name: "Moon", label: "Luna / Noche", icon: Moon },
  { name: "Ghost", label: "Fantasma / Espíritu", icon: Ghost },
  { name: "Trophy", label: "Trofeo / Hazaña", icon: Trophy },
  { name: "Crosshair", label: "Mira / Caza", icon: Crosshair },
  { name: "Hammer", label: "Martillo / Oficios", icon: Hammer },
  { name: "Coins", label: "Monedas / Oro", icon: Coins },
  { name: "Grape", label: "Uva / Taberna", icon: Grape },
  { name: "Infinity", label: "Infinito / Eternidad", icon: InfinityIcon },
  { name: "Wind", label: "Viento / Aeros", icon: Wind },
  { name: "Waves", label: "Olas / Kaliria", icon: Waves },
  { name: "Leaf", label: "Hoja / Avalon", icon: Leaf },
  { name: "Bot", label: "Autómata / IA / Robot", icon: Bot },
  { name: "Cpu", label: "Procesador / Algoritmo", icon: Cpu },
];

export const BASE_CATEGORIES: MergedCategory[] = [
  { id: "cat-personajes", name: "Personajes", slug: "personajes", description: "Héroes, sabios, guerreros y seres místicas", color: "#70b8c8", icon: Users, iconName: "Users" },
  { id: "cat-lugares", name: "Lugares", slug: "lugares", description: "Ciudades medievales, mazmorras y reinos antiguos", color: "#6ea8c8", icon: MapPin, iconName: "MapPin" },
  { id: "cat-eventos", name: "Eventos", slug: "eventos", description: "Eclipses, batallas históricas y hitos del destino", color: "#c86e6e", icon: Calendar, iconName: "Calendar" },
  { id: "cat-dioses", name: "Dioses", slug: "dioses", description: "Deidades cósmicas y fuerzas divinas del universo", color: "#a7f9f7", icon: Sparkles, iconName: "Sparkles" },
  { id: "cat-dragones", name: "Dragones", slug: "dragones", description: "Dragones legendarios de inmenso poder elemental", color: "#c8856e", icon: Flame, iconName: "Flame" },
  { id: "cat-organizaciones", name: "Organizaciones", slug: "organizaciones", description: "Gremios celestiales, imperios y sectas secretas", color: "#9e6ec8", icon: Shield, iconName: "Shield" },
  { id: "cat-familias", name: "Familias", slug: "familias", description: "Líneas de sangre real y dinastías eternas", color: "#6ec8c0", icon: Heart, iconName: "Heart" },
  { id: "cat-objetos", name: "Objetos", slug: "objetos", description: "Artefactos rúnicos, armas legendarias y joyas sagradas", color: "#6ec88a", icon: Gem, iconName: "Gem" }
];

export let globalMergedCategories: MergedCategory[] = [...BASE_CATEGORIES];

export function setGlobalMergedCategories(categories: MergedCategory[]) {
  globalMergedCategories = categories;
}

export function mergeCategories(customCategories: WikiCategory[]): MergedCategory[] {
  const merged: MergedCategory[] = [...BASE_CATEGORIES];
  
  customCategories.forEach((custom) => {
    const customSlug = (custom.slug || "").toLowerCase().trim();
    const customName = (custom.name || "").toLowerCase().trim();

    // No permitir que Tarot AI ni Aplicaciones se agreguen como categorías de lore
    if (
      customSlug === "tarot-ai" || customSlug === "cat-tarot-ai" || customName === "tarot ai" ||
      customSlug === "aplicaciones" || customSlug === "cat-aplicaciones" || customName === "aplicaciones"
    ) {
      return;
    }

    // Evitar duplicar si ya existe en las base por nombre o slug
    const exists = merged.some(
      (base) => 
        base.slug.toLowerCase().trim() === customSlug ||
        base.name.toLowerCase().trim() === customName
    );
    
    if (!exists) {
      let iconComp = (custom.icon && ICON_MAP[custom.icon]) ? ICON_MAP[custom.icon] : null;
      let iconName = custom.icon || "BookOpen";

      const normName = (custom.name || "").toLowerCase().trim();
      if (!iconComp || custom.icon === "Ghost" && (normName === "mascotas" || normName === "animales" || normName === "fauna")) {
        if (normName === "mascotas" || normName === "animales" || normName === "criaturas" || normName === "fauna" || normName === "bestias") {
          iconComp = PawPrint;
          iconName = "PawPrint";
        } else if (!iconComp) {
          iconComp = BookOpen;
        }
      }

      merged.push({
        id: custom.id || `cat-${custom.slug}`,
        name: custom.name,
        slug: custom.slug,
        description: custom.description || "Categoría mística personalizada",
        color: custom.color || "#808080",
        icon: iconComp,
        iconName: iconName,
        isCustom: true
      });
    }
  });
  
  return merged;
}

export function getCategoryIconByListName(catName: string, customCategories: WikiCategory[] = []): LucideIcon | React.ComponentType<any> {
  const all = customCategories.length > 0 ? mergeCategories(customCategories) : globalMergedCategories;
  const matched = all.find(c => c.name.toLowerCase().trim() === catName.toLowerCase().trim());
  if (matched) return matched.icon;

  const norm = (catName || "").toLowerCase().trim();
  if (norm === "mascotas" || norm === "animales" || norm === "criaturas" || norm === "fauna" || norm === "bestias") {
    return PawPrint;
  }
  if (norm === "tarot ai" || norm === "tarot-ai" || norm === "tarotai" || norm === "tarot") {
    return TarotLogo;
  }
  if (norm === "aplicaciones" || norm === "aplicacion" || norm === "aplicación" || norm === "apps" || norm === "software" || norm === "herramientas") {
    return AppWindow;
  }

  return BookOpen;
}

export function getCategoryColorByListName(catName: string, customCategories: WikiCategory[] = []): string {
  const all = customCategories.length > 0 ? mergeCategories(customCategories) : globalMergedCategories;
  const matched = all.find(c => c.name.toLowerCase().trim() === catName.toLowerCase().trim());
  if (matched) return matched.color;

  const norm = (catName || "").toLowerCase().trim();
  if (norm === "mascotas" || norm === "animales" || norm === "criaturas") {
    return "#ff007b";
  }
  if (norm === "tarot ai" || norm === "tarot-ai" || norm === "tarotai") {
    return "#f59e0b";
  }
  if (norm === "aplicaciones" || norm === "aplicacion" || norm === "aplicación" || norm === "apps") {
    return "#3b82f6";
  }

  return "#a0a0a0";
}
