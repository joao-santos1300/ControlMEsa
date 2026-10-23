"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/format";
import { useSocket } from "@/lib/socket";
import type { Role } from "@/lib/types";
import { Loading, useToast } from "./ui";

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "Painel", roles: ["ADMIN"] },
  { href: "/mesas", label: "Mesas", roles: ["WAITER", "ADMIN"] },
  { href: "/pedidos", label: "Pedidos", roles: ["WAITER", "ADMIN"] },
  { href: "/comandas", label: "Comandas", roles: ["ADMIN"] },
  { href: "/faturamento", label: "Faturamento", roles: ["ADMIN"] },
  { href: "/cozinha", label: "Cozinha", roles: ["KITCHEN", "ADMIN"] },
  { href: "/admin/produtos", label: "Produtos", roles: ["ADMIN"] },
  { href: "/admin/categorias", label: "Categorias", roles: ["ADMIN"] },
  { href: "/admin/mesas", label: "Gerir mesas", roles: ["ADMIN"] },
  { href: "/admin/usuarios", label: "Usuários", roles: ["ADMIN"] },
];

// Avisos em tempo real para o garçom (a cozinha marcou itens/pedido como prontos)
function WaiterAlerts() {
  const toast = useToast();
  useSocket({
    "order:ready": ({ table }: { table: { number: number } }) => toast(`Mesa ${table.number}: pedido pronto!`, "success"),
  });
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) return <Loading />;

  const items = nav.filter((n) => n.roles.includes(session.role));
  const allowed = items.some((n) => pathname.startsWith(n.href));

  const links = (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const user = (
    <div className="border-t border-slate-200 pt-4">
      <p className="truncate text-sm font-medium text-slate-900">{session.name}</p>
      <p className="mb-3 text-xs text-slate-500">{roleLabel[session.role]}</p>
      <button
        onClick={() => {
          logout();
          router.replace("/login");
        }}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Sair
      </button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {session.role === "WAITER" && <WaiterAlerts />}

      {/* Barra superior (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-semibold tracking-tight">ControlMesa</span>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-x-0 top-[53px] z-20 space-y-4 border-b border-slate-200 bg-white p-4 shadow-lg lg:hidden">
          {links}
          {user}
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 lg:flex">
        <div>
          <p className="mb-6 px-3 text-lg font-semibold tracking-tight">ControlMesa</p>
          {links}
        </div>
        {user}
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {allowed ? children : <p className="py-16 text-center text-sm text-slate-500">Você não tem acesso a esta página.</p>}
        </div>
      </main>
    </div>
  );
}
