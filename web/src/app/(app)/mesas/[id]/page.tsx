"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { itemStatusLabel, money, orderStatusLabel, orderTotal } from "@/lib/format";
import { canPrintSilently, kitchenTicket, printHtml } from "@/lib/print";
import { useSocket } from "@/lib/socket";
import type { Category, Order, OrderItem, Product, Table } from "@/lib/types";
import { PayModal } from "@/components/PayModal";
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  ErrorState,
  Input,
  Loading,
  statusTone,
  useLoad,
  useToast,
} from "@/components/ui";

interface CartLine {
  product: Product;
  quantity: number;
  notes: string;
}

export default function MesaPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const toast = useToast();

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sending, setSending] = useState(false);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"cancel" | null>(null);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEdit, setCustomerEdit] = useState<string | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Catálogo quase não muda: carrega uma vez e não refaz a cada evento de socket
  const catalog = useLoad(async () => {
    const [products, categories] = await Promise.all([api<Product[]>("/products"), api<Category[]>("/categories")]);
    return { products, categories };
  });

  // Estado da mesa/pedido: é o que realmente muda e precisa ser recarregado
  const live = useLoad(async () => {
    const isAdmin = session?.role === "ADMIN";
    const [tables, orders] = await Promise.all([
      api<Table[]>("/tables"),
      api<Order[]>(isAdmin ? "/kitchen/orders" : "/orders/mine"),
    ]);
    return {
      table: tables.find((t) => t.id === id) ?? null,
      order: orders.find((o) => o.table.id === id) ?? null,
    };
  }, [id]);

  const reload = live.reload;
  const loading = live.loading || catalog.loading;
  const error = live.error ?? catalog.error;
  const data = live.data && catalog.data ? { ...live.data, ...catalog.data } : null;
  const products = catalog.data?.products;

  // Cozinha altera status dos itens: mantém a tela sincronizada
  useSocket({ "item:status": () => void reload(), "order:updated": () => void reload() }, () => void reload());

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products ?? []).filter(
      (p) =>
        p.active &&
        (!category || p.categoryId === category) &&
        (!term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)),
    );
  }, [products, category, search]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Erro inesperado"} onRetry={reload} />;
  if (!data.table) return <ErrorState message="Mesa não encontrada" />;

  const { table, order, categories } = data;
  const foreign = table.status === "OCCUPIED" && !order;
  const cartTotal = cart.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);

  function addToCart(product: Product) {
    setCart((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (existing) return lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...lines, { product, quantity: 1, notes: "" }];
    });
  }

  function changeLine(productId: string, patch: Partial<CartLine>) {
    setCart((lines) =>
      lines.flatMap((l) => {
        if (l.product.id !== productId) return [l];
        const next = { ...l, ...patch };
        return next.quantity > 0 ? [next] : [];
      }),
    );
  }

  async function sendOrder() {
    setSending(true);
    try {
      const items = cart.map((l) => ({ productId: l.product.id, quantity: l.quantity, notes: l.notes.trim() || undefined }));
      if (order) {
        for (const item of items) await api(`/orders/${order.id}/items`, { method: "POST", body: item });
      } else {
        await api("/orders", { method: "POST", body: { tableId: id, items, customerName: customerName.trim() || undefined } });
      }
      const lines = cart.map((l) => ({ quantity: l.quantity, notes: l.notes.trim() || null, product: l.product }));
      setCart([]);
      toast("Pedido enviado para a cozinha", "success");
      // Com impressora térmica no app desktop, a comanda sai sozinha
      if (canPrintSilently() && table) {
        void printHtml(kitchenTicket({ table, waiter: { name: session?.name ?? "" }, customerName: order ? order.customerName : customerName.trim() || null }, lines)).catch(() => {});
      }
      setCustomerName("");
      await reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSending(false);
    }
  }

  async function saveCustomer() {
    if (!order || customerEdit === null) return;
    setSavingCustomer(true);
    try {
      await api(`/orders/${order.id}/customer`, { method: "PUT", body: { customerName: customerEdit.trim() } });
      setCustomerEdit(null);
      toast("Nome do cliente atualizado", "success");
      await reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSavingCustomer(false);
    }
  }

  async function changeQuantity(item: OrderItem, quantity: number) {
    if (!order) return;
    setBusyItem(item.id);
    try {
      if (quantity <= 0) await api(`/orders/${order.id}/items/${item.id}`, { method: "DELETE" });
      else await api(`/orders/${order.id}/items/${item.id}`, { method: "PUT", body: { quantity } });
      await reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusyItem(null);
    }
  }

  async function runConfirmed() {
    if (!order || !confirm) return;
    setConfirming(true);
    try {
      await api(`/orders/${order.id}`, { method: "DELETE" });
      toast("Pedido cancelado", "success");
      setConfirm(null);
      await reload();
    } catch (err) {
      toast(errorMessage(err), "error");
      setConfirm(null);
    } finally {
      setConfirming(false);
    }
  }

  const activeItems = order?.items.filter((i) => i.status !== "CANCELED") ?? [];

  return (
    <>
      <div className="mb-6">
        <Link href="/mesas" className="text-sm text-slate-500 hover:text-slate-800">
          ← Mesas
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Mesa {table.number}</h1>
          {table.name && <span className="text-slate-500">{table.name}</span>}
          <Badge tone={table.status === "OCCUPIED" ? "amber" : "green"}>
            {table.status === "OCCUPIED" ? "Ocupada" : "Livre"}
          </Badge>
        </div>
      </div>

      {foreign ? (
        <EmptyState>Esta mesa está sendo atendida por outro garçom.</EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Catálogo */}
          <section className="min-w-0">
            <div className="mb-4 space-y-3">
              <Input type="search" placeholder="Buscar produto…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {[{ id: "", name: "Todos" }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                      category === c.id
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {visibleProducts.length === 0 ? (
              <EmptyState>Nenhum produto encontrado.</EmptyState>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {visibleProducts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => addToCart(p)}
                      className="flex h-full w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">{p.name}</span>
                        <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500">{p.description}</span>
                        <span className="mt-2 block text-sm font-semibold text-emerald-700">{money(p.price)}</span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg leading-none text-white">
                        +
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pedido */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {cart.length > 0 && (
              <Card>
                <h2 className="mb-3 font-semibold">Novos itens</h2>
                {!order && (
                  <Input
                    placeholder="Nome do cliente (opcional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mb-3 py-1.5"
                  />
                )}
                <ul className="space-y-3">
                  {cart.map((l) => (
                    <li key={l.product.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">{l.product.name}</span>
                        <Stepper value={l.quantity} onChange={(q) => changeLine(l.product.id, { quantity: q })} />
                      </div>
                      <Input
                        placeholder="Observação (ex.: sem cebola)"
                        value={l.notes}
                        onChange={(e) => changeLine(l.product.id, { notes: e.target.value })}
                        className="py-1.5"
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span className="font-semibold">{money(cartTotal)}</span>
                </div>
                <Button className="mt-3 w-full" loading={sending} onClick={sendOrder}>
                  Enviar para a cozinha
                </Button>
              </Card>
            )}

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Pedido atual</h2>
                {order && (
                  <Badge tone={statusTone(order.status)}>{orderStatusLabel[order.status]}</Badge>
                )}
              </div>

              {!order ? (
                <p className="text-sm text-slate-500">Nenhum pedido aberto. Toque nos produtos para começar.</p>
              ) : (
                <>
                  {customerEdit === null ? (
                    <div className="mb-3 flex items-center justify-between gap-2 text-sm">
                      <span className={order.customerName ? "font-medium text-amber-600" : "text-slate-400"}>
                        {order.customerName ?? "Sem nome do cliente"}
                      </span>
                      <button
                        className="text-xs font-medium text-emerald-700 hover:underline"
                        onClick={() => setCustomerEdit(order.customerName ?? "")}
                      >
                        {order.customerName ? "Editar" : "Adicionar"}
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Nome do cliente"
                        value={customerEdit}
                        onChange={(e) => setCustomerEdit(e.target.value)}
                        className="py-1.5"
                      />
                      <Button size="sm" loading={savingCustomer} onClick={saveCustomer}>
                        Salvar
                      </Button>
                    </div>
                  )}
                  <ul className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${item.status === "CANCELED" ? "text-slate-400 line-through" : ""}`}>
                            {item.quantity}× {item.product.name}
                          </p>
                          {item.notes && <p className="text-xs text-slate-500">{item.notes}</p>}
                          <div className="mt-1">
                            <Badge tone={statusTone(item.status)}>{itemStatusLabel[item.status]}</Badge>
                          </div>
                        </div>
                        {item.status !== "READY" && item.status !== "CANCELED" && (
                          <Stepper
                            value={item.quantity}
                            disabled={busyItem === item.id}
                            onChange={(q) => changeQuantity(item, q)}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-lg font-semibold">{money(orderTotal(order.items))}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full border border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100"
                    onClick={() => void printHtml(kitchenTicket(order, activeItems)).catch((e) => toast(errorMessage(e), "error"))}
                  >
                    <Printer size={16} aria-hidden />
                    Imprimir comanda
                  </Button>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setConfirm("cancel")}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setPaying(true)} disabled={activeItems.length === 0}>
                      Pagar / fechar conta
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </aside>
        </div>
      )}

      <ConfirmModal
        open={confirm !== null}
        title="Cancelar pedido"
        message={`Cancelar todo o pedido da mesa ${table.number}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar pedido"
        loading={confirming}
        onConfirm={runConfirmed}
        onClose={() => setConfirm(null)}
      />
      {order && <PayModal order={order} open={paying} onClose={() => setPaying(false)} onChanged={reload} />}
    </>
  );
}

function Stepper({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-lg leading-none text-slate-700 hover:bg-slate-50 disabled:opacity-40";
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button className={btn} disabled={disabled} onClick={() => onChange(value - 1)} aria-label="Diminuir">
        −
      </button>
      <span className="w-5 text-center text-sm font-medium">{value}</span>
      <button className={btn} disabled={disabled} onClick={() => onChange(value + 1)} aria-label="Aumentar">
        +
      </button>
    </div>
  );
}
