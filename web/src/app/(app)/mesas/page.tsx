"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import type { Table } from "@/lib/types";
import { Badge, EmptyState, ErrorState, Loading, PageHeader, useLoad } from "@/components/ui";

export default function MesasPage() {
  const { data, error, loading, reload } = useLoad(() => api<Table[]>("/tables"));

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />;

  const occupied = data.filter((t) => t.status === "OCCUPIED").length;

  return (
    <>
      <PageHeader title="Mesas" subtitle={`${occupied} ocupada(s) de ${data.length}`} />

      {data.length === 0 ? (
        <EmptyState>Nenhuma mesa cadastrada.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {data.map((table) => {
            const busy = table.status === "OCCUPIED";
            return (
              <li key={table.id}>
                <Link
                  href={`/mesas/${table.id}`}
                  className={`flex h-full flex-col items-center justify-center gap-2 rounded-xl border p-5 text-center shadow-sm transition-colors ${
                    busy
                      ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                      : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  <span className="text-3xl font-semibold tracking-tight">{table.number}</span>
                  {table.name && <span className="text-xs text-slate-500">{table.name}</span>}
                  <Badge tone={busy ? "amber" : "green"}>{busy ? "Ocupada" : "Livre"}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
