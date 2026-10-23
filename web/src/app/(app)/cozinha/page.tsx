"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { itemStatusLabel, orderStatusLabel, timeSince } from "@/lib/format";
import { kitchenTicket, printHtml } from "@/lib/print";
import { useSocket } from "@/lib/socket";
import type { ItemStatus, Order, OrderItem } from "@/lib/types";
import { Badge, Button, Card, EmptyState, ErrorState, Loading, PageHeader, statusTone, useLoad, useToast } from "@/components/ui";

const ACTIVE = ["OPEN", "PREPARING", "READY"];

export default function CozinhaPage() {
  const toast = useToast();
  const { data, setData, error, loading, reload } = useLoad(() => api<Order[]>("/kitchen/orders"));
  const [busy, setBusy] = useState<string | null>(null);
  const [, tick] = useState(0);

  // Atualiza os tempos de espera exibidos
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  function upsert(order: Order) {
    setData((list) => {
      const rest = (list ?? []).filter((o) => o.id !== order.id);
      if (!ACTIVE.includes(order.status)) return rest;
      return [...rest, order].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  }

  useSocket(
    {
      "order:new": (order: Order) => {
        upsert(order);
        toast(`Novo pedido: mesa ${order.table.number}`, "info");
      },
      "order:updated": (order: Order) => upsert(order),
    },
    () => void reload(),
  );

  async function setStatus(order: Order, item: OrderItem, status: Extract<ItemStatus, "PREPARING" | "READY">) {
    setBusy(item.id);
    try {
      upsert(await api<Order>(`/orders/${order.id}/items/${item.id}/status`, { method: "PUT", body: { status } }));
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Cozinha" subtitle={`${data.length} pedido(s) em andamento · atualização em tempo real`} />

      {data.length === 0 ? (
        <EmptyState>Nenhum pedido na fila. Novos pedidos aparecem aqui automaticamente.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((order) => (
            <li key={order.id}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">Mesa {order.table.number}</p>
                    {order.customerName && (
                      <p className="text-sm font-medium text-amber-600">{order.customerName}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {order.waiter.name} · há {timeSince(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={statusTone(order.status)}>{orderStatusLabel[order.status]}</Badge>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      onClick={() =>
                        void printHtml(kitchenTicket(order, order.items.filter((i) => i.status !== "CANCELED"))).catch((e) =>
                          toast(errorMessage(e), "error"),
                        )
                      }
                    >
                      <Printer size={14} aria-hidden />
                      Imprimir
                    </button>
                  </div>
                </div>
                {order.notes && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{order.notes}</p>}

                <ul className="mt-3 divide-y divide-slate-100">
                  {order.items
                    .filter((i) => i.status !== "CANCELED")
                    .map((item) => (
                      <li key={item.id} className={`py-3 ${item.changed ? "-mx-2 rounded-lg bg-amber-50 px-2" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {item.quantity}× {item.product.name}
                            </p>
                            {item.notes && <p className="text-sm text-slate-600">Obs.: {item.notes}</p>}
                            {item.changed && <p className="text-xs font-semibold text-amber-700">Novo / alterado</p>}
                          </div>
                          <Badge tone={statusTone(item.status)}>{itemStatusLabel[item.status]}</Badge>
                        </div>
                        {item.status !== "READY" && (
                          <div className="mt-2 flex gap-2">
                            {item.status === "PENDING" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                loading={busy === item.id}
                                onClick={() => setStatus(order, item, "PREPARING")}
                              >
                                Iniciar preparo
                              </Button>
                            )}
                            <Button size="sm" loading={busy === item.id} onClick={() => setStatus(order, item, "READY")}>
                              Marcar pronto
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
