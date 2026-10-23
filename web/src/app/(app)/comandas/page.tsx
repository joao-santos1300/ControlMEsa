"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { dateTime, money, orderStatusLabel, orderTotal } from "@/lib/format";
import { billTicket, printHtml } from "@/lib/print";
import type { Order, Paginated } from "@/lib/types";
import { PayModal } from "@/components/PayModal";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Loading, PageHeader, Select, statusTone, useLoad, useToast } from "@/components/ui";

type Filter = "ACTIVE" | "CLOSED" | "ALL";

const isActive = (o: Order) => o.status === "OPEN" || o.status === "PREPARING" || o.status === "READY";

export default function ComandasPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data, error, loading, reload } = useLoad(
    () =>
      api<Paginated<Order>>("/orders", {
        query: {
          status: filter === "CLOSED" ? "CLOSED" : "",
          from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
          to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
          pageSize: 100,
        },
      }),
    [filter, from, to],
  );

  const term = search.trim().toLowerCase();
  const orders = (data?.data ?? []).filter((o) => {
    if (filter === "ACTIVE" && !isActive(o)) return false;
    if (!term) return true;
    return [o.customerName ?? "", String(o.table.number), o.table.name ?? "", o.waiter.name].some((v) => v.toLowerCase().includes(term));
  });
  const paying = data?.data.find((o) => o.id === payingId);

  async function print(order: Order) {
    try {
      await printHtml(billTicket(order));
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  }

  return (
    <>
      <PageHeader title="Comandas" subtitle="Receba, imprima e busque comandas dos clientes" />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Input placeholder="Buscar cliente, mesa ou garçom" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Situação">
          <option value="ACTIVE">A receber (em andamento)</option>
          <option value="CLOSED">Fechadas</option>
          <option value="ALL">Todas</option>
        </Select>
        <Input type="date" aria-label="De" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" aria-label="Até" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />
      ) : orders.length === 0 ? (
        <EmptyState>Nenhuma comanda encontrada.</EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">Mesa {order.table.number}</p>
                    {order.customerName && <p className="text-sm font-medium text-amber-600">{order.customerName}</p>}
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
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                  <span className="font-semibold">{money(orderTotal(order.items))}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => print(order)}>
                      <Printer size={14} aria-hidden /> Imprimir
                    </Button>
                    {isActive(order) && (
                      <Button size="sm" onClick={() => setPayingId(order.id)}>
                        Receber
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {paying && <PayModal order={paying} open onClose={() => setPayingId(null)} onChanged={reload} />}
    </>
  );
}
