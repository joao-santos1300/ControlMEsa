"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money, orderStatusLabel, orderTotal } from "@/lib/format";
import type { Order, OrderStatus, Paginated } from "@/lib/types";
import { Badge, Button, Card, EmptyState, ErrorState, Loading, PageHeader, Select, statusTone, useLoad } from "@/components/ui";

const PAGE_SIZE = 12;

export default function PedidosPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useLoad(
    () => api<Paginated<Order>>("/orders", { query: { status, page, pageSize: PAGE_SIZE } }),
    [status, page],
  );

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle="Histórico e pedidos em andamento"
        actions={
          <Select
            aria-label="Filtrar por status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | "");
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel[s]}
              </option>
            ))}
          </Select>
        }
      />

      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />
      ) : data.data.length === 0 ? (
        <EmptyState>Nenhum pedido encontrado.</EmptyState>
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.data.map((order) => {
              const active = order.status === "OPEN" || order.status === "PREPARING" || order.status === "READY";
              return (
                <li key={order.id}>
                  <Card className="h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">Mesa {order.table.number}</p>
                        {order.customerName && (
                          <p className="text-sm font-medium text-amber-600">{order.customerName}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {order.waiter.name} · {dateTime(order.created_at)}
                        </p>
                      </div>
                      <Badge tone={statusTone(order.status)}>{orderStatusLabel[order.status]}</Badge>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {order.items
                        .filter((i) => i.status !== "CANCELED")
                        .map((i) => (
                          <li key={i.id} className="flex justify-between gap-2">
                            <span className="truncate">
                              {i.quantity}× {i.product.name}
                            </span>
                            <span className="shrink-0">{money(Number(i.unitPrice) * i.quantity)}</span>
                          </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="font-semibold">{money(orderTotal(order.items))}</span>
                      {active && (
                        <Link href={`/mesas/${order.table.id}`} className="text-sm font-medium text-emerald-700 hover:underline">
                          Abrir mesa
                        </Link>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-slate-500">
                {data.page} de {data.totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
