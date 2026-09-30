"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  adminEmail: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/administracion" },
  { label: "Clientes", href: "/administracion/clientes" },
  { label: "Catálogo", href: "/administracion/catalogo" },
] as const;

const NAV_ITEMS_PENDING = ["Resultados", "Auditoría", "Soporte"] as const;

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-white/5 bg-phd-dark/80 backdrop-blur-md flex flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-phd-cyan" />
            <span className="w-2.5 h-2.5 rounded-full bg-phd-pink" />
            <span className="w-2.5 h-2.5 rounded-full bg-phd-purple" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading font-bold text-white text-sm tracking-tight">PHD</span>
            <span className="font-body text-slate-400 text-[8px] tracking-widest uppercase mt-0.5">
              Quality Engineering
            </span>
          </span>
        </Link>

        <Link href="/quality-pulse" className="flex items-center gap-2">
          <span className="flex items-end gap-0.5 h-4" aria-hidden="true">
            <span className="w-1 h-2 rounded-sm bg-phd-cyan" />
            <span className="w-1 h-4 rounded-sm bg-phd-purple" />
            <span className="w-1 h-3 rounded-sm bg-phd-pink" />
          </span>
          <span className="font-heading font-extrabold text-xs tracking-wide text-white">
            QUALITY <span className="text-phd-pink">PULSE</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Navegación de administración">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`font-body text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
                isActive
                  ? "bg-phd-cyan/10 text-phd-cyan border-phd-cyan/30"
                  : "text-slate-300 border-transparent hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {NAV_ITEMS_PENDING.map((label) => (
          <span
            key={label}
            title="Próximamente"
            aria-disabled="true"
            className="font-body text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-600 cursor-not-allowed select-none flex items-center justify-between"
          >
            {label}
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
              Próximamente
            </span>
          </span>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-xs text-slate-500">Sesión activa</p>
        <p className="text-sm text-white truncate">{adminEmail}</p>
      </div>
    </aside>
  );
}
