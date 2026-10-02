/**
 * Sistema de diseño y tokens boutique para "Mía Pastas Bella"
 * Basado en tonos crema artesanal, terracota/marrón pastel y verde oliva.
 */

export const THEME_COLORS = {
  crema: {
    base: "#FDFBF7",
    superficie: "#F7F3E9",
    borde: "#EFE7D8",
    muted: "#DFD3BD",
  },
  terracota: {
    pastel: "#A8654C",
    calido: "#8C4F37",
    profundo: "#703D2A",
    oscuroTexto: "#331910",
  },
  oliva: {
    suave: "#8B9F7B",
    principal: "#6B805B",
    oscuro: "#415036",
  },
  dorado: {
    acento: "#D4AF37",
    fondo: "#FBF4E2",
  },
} as const;

export const CATEGORIAS_DEFAULT = [
  { nombre: "Tallarines", slug: "tallarines", icon: "Utensils" },
  { nombre: "Sorrentinos", slug: "sorrentinos", icon: "CircleDot" },
  { nombre: "Ravioles", slug: "ravioles", icon: "Square" },
  { nombre: "Ñoquis", slug: "noquis", icon: "Cloud" },
  { nombre: "Tortellinis", slug: "tortellinis", icon: "Triangle" },
  { nombre: "Salsas", slug: "salsas", icon: "Flame" },
] as const;
