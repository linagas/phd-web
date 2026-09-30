import CatalogManager from "@/app/quality-pulse/components/catalog-manager";

/** `/administracion/catalogo`. Guard heredado de `(console)/layout.tsx`. */
export default function AdminCatalogoPage() {
  return (
    <section className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="flex flex-col gap-1 mb-8">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-cyan">
          Quality Pulse · Administración
        </p>
        <h1 className="font-heading font-bold text-white text-3xl">Catálogo</h1>
      </div>
      <CatalogManager />
    </section>
  );
}
