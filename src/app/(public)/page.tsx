import { Utensils, Sparkles, ChefHat } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      {/* Badge artesanal */}
      <div className="inline-flex items-center gap-2 rounded-full border border-dorado-300 bg-dorado-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-terracota-700 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-dorado-500" />
        Pastas Artesanales Gourmet
      </div>

      {/* Titular con fuente Serif */}
      <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-terracota-900 md:text-6xl">
        Mía Pastas Bella
      </h1>

      <p className="mt-4 max-w-xl text-lg text-terracota-800/80">
        Tradición italiana, ingredientes nobles y masa fresca elaborada día a día.
        Entorno local configurado con éxito.
      </p>

      {/* Indicadores de paleta boutique */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-crema-200 px-4 py-2 border border-crema-300 text-xs font-medium text-terracota-800">
          <span className="h-3 w-3 rounded-full bg-crema-100 border border-crema-400" />
          Crema (#FDFBF7)
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-crema-200 px-4 py-2 border border-crema-300 text-xs font-medium text-terracota-800">
          <span className="h-3 w-3 rounded-full bg-terracota-600" />
          Terracota (#8C4F37)
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-crema-200 px-4 py-2 border border-crema-300 text-xs font-medium text-terracota-800">
          <span className="h-3 w-3 rounded-full bg-oliva-500" />
          Verde Oliva (#6B805B)
        </div>
      </div>

      {/* Botones con estilos boutique */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button className="btn-boutique flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          Ver Catálogo
        </button>
        <button className="btn-oliva flex items-center gap-2">
          <Utensils className="h-4 w-4" />
          Hacer Pedido
        </button>
      </div>
    </div>
  );
}
