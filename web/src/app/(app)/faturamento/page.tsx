"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { money, orderStatusLabel, orderTotal } from "@/lib/format";
import { printReport, revenueReport } from "@/lib/print";
import type { Order, OrderStatus, Paginated } from "@/lib/types";
import { Button, Card, EmptyState, Field, Input, PageHeader, Select, useToast } from "@/components/ui";

const today = () => new Date().toLocaleDateString("sv-SE");
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
const br = (ymd: string) => ymd.split("-").reverse().join("/");

async function fetchAll(from: string, to: string, status: string) {
  const all: Order[] = [];
  for (let page = 1; ; page++) {
    const res = await api<Paginated<Order>>("/orders", {
      query: {
        status,
        from: new Date(`${from}T00:00:00`).toISOString(),
        to: new Date(`${to}T23:59:59.999`).toISOString(),
        page,
        pageSize: 100,
      },
    });
    all.push(...res.data);
    if (page >= res.totalPages) return all;
  }
}

export default function FaturamentoPage() {
  const toast = useToast();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState<OrderStatus | "ALL">("CLOSED");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [period, setPeriod] = useState("");

  async function generate() {
    if (from > to) return toast("A data inicial é maior que a final", "error");
    setLoading(true);
    try {
      const list = await fetchAll(from, to, status === "ALL" ? "" : status);
      setOrders(list.filter((o) => status !== "ALL" || o.status !== "CANCELED"));
      setPeriod(from === to ? br(from) : `${br(from)} a ${br(to)}`);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  const total = orders?.reduce((s, o) => s + orderTotal(o.items), 0) ?? 0;

  const byDay = new Map<string, { count: number; total: number }>();
  const byProduct = new Map<string, { quantity: number; total: number }>();
  for (const o of orders ?? []) {
    const d = byDay.get(day(o.created_at)) ?? { count: 0, total: 0 };
    d.count++;
    d.total += orderTotal(o.items);
    byDay.set(day(o.created_at), d);
    for (const i of o.items.filter((i) => i.status !== "CANCELED")) {
      const p = byProduct.get(i.product.name) ?? { quantity: 0, total: 0 };
      p.quantity += i.quantity;
      p.total += Number(i.unitPrice) * i.quantity;
      byProduct.set(i.product.name, p);
    }
  }
  const dayRows = [...byDay].map(([d, v]) => ({ day: d, ...v })).reverse();
  const productRows = [...byProduct].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);

  function print() {
    if (!orders) return;
    printReport(
      revenueReport({
        periodLabel: period,
        statusLabel: status === "ALL" ? "todos (exceto cancelados)" : orderStatusLabel[status],
        total,
        count: orders.length,
        byDay: dayRows,
        byProduct: productRows,
        orders: orders.map((o) => ({
          date: `${day(o.created_at)} ${new Date(o.created_at).toLocaleTimeString("pt-BR", { timeStyle: "short" })}`,
          table: `Mesa ${o.table.number}`,
          customer: o.customerName ?? "-",
          waiter: o.waiter.name,
          total: orderTotal(o.items),
        })),
      }),
    );
  }

  return (
    <>
      <PageHeader
        title="Faturamento"
        subtitle="Gere o relatório por período"
        actions={
          orders && orders.length > 0 ? (
            <Button variant="secondary" onClick={print}>
              <Printer size={16} aria-hidden /> Imprimir
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <Field label="De">
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Até">
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="Pedidos">
            <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}>
              <option value="CLOSED">Fechados (pagos)</option>
              <option value="ALL">Todos (exceto cancelados)</option>
            </Select>
          </Field>
          <Button loading={loading} onClick={generate}>
            Gerar relatório
          </Button>
        </div>
      </Card>

      {orders &&
        (orders.length === 0 ? (
          <EmptyState>Nenhum pedido no período.</EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-slate-500">Faturamento ({period})</p>
                <p className="mt-2 text-2xl font-semibold">{money(total)}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Pedidos</p>
                <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Ticket médio</p>
                <p className="mt-2 text-2xl font-semibold">{money(total / orders.length)}</p>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-3 font-semibold">Por dia</h2>
                <ul className="divide-y divide-slate-100 text-sm">
                  {dayRows.map((d) => (
                    <li key={d.day} className="flex justify-between py-2">
                      <span>
                        {d.day} · {d.count} pedido(s)
                      </span>
                      <span className="font-medium">{money(d.total)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h2 className="mb-3 font-semibold">Por produto</h2>
                <ul className="divide-y divide-slate-100 text-sm">
                  {productRows.map((p) => (
                    <li key={p.name} className="flex justify-between gap-2 py-2">
                      <span className="truncate">
                        {p.quantity}× {p.name}
                      </span>
                      <span className="shrink-0 font-medium">{money(p.total)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        ))}
    </>
  );
}
