"use client";

import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Summary, TopProduct } from "@/lib/types";
import { Card, EmptyState, ErrorState, Loading, PageHeader, useLoad } from "@/components/ui";

export default function DashboardPage() {
  const { data, error, loading, reload } = useLoad(async () => {
    const [summary, top] = await Promise.all([
      api<Summary>("/dashboard/summary"),
      api<TopProduct[]>("/dashboard/top-products", { query: { limit: 8 } }),
    ]);
    return { summary, top };
  });

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />;

  const { summary, top } = data;
  const max = Math.max(...top.map((t) => t.totalSold), 1);

  const stats = [
    { label: "Faturamento hoje", value: money(summary.revenueToday) },
    { label: "Pedidos hoje", value: summary.ordersToday },
    { label: "Pedidos em aberto", value: summary.openOrders },
    { label: "Mesas ocupadas", value: summary.occupiedTables },
  ];

  return (
    <>
      <PageHeader title="Painel" subtitle="Resumo da operação de hoje" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">{s.label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{s.value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Produtos mais vendidos</h2>
      {top.length === 0 ? (
        <EmptyState>Ainda não há vendas registradas.</EmptyState>
      ) : (
        <Card>
          <ul className="space-y-4">
            {top.map((p, index) => (
              <li key={p.productId}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">
                    {index + 1}. {p.name}
                  </span>
                  <span className="shrink-0 text-slate-500">{p.totalSold} un.</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(p.totalSold / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
