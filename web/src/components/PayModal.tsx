"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { itemRemaining, money } from "@/lib/format";
import { billTicket, printHtml } from "@/lib/print";
import type { Order, OrderItem } from "@/lib/types";
import { Badge, Button, Modal, useToast } from "@/components/ui";

/** Conta dividida: cada cliente escolhe os itens (e quantidades) que vai pagar. */
export function PayModal({ order, open, onClose, onChanged }: { order: Order; open: boolean; onClose: () => void; onChanged: () => Promise<void> }) {
  const toast = useToast();
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  const items = order.items.filter((i) => i.status !== "CANCELED");
  const left = (i: OrderItem) => i.quantity - i.paidQuantity;
  const payable = (i: OrderItem) => i.status === "READY" && left(i) > 0;
  const selection = items.filter((i) => (picked[i.id] ?? 0) > 0).map((item) => ({ item, quantity: picked[item.id] }));
  const selectedTotal = selection.reduce((sum, s) => sum + Number(s.item.unitPrice) * s.quantity, 0);
  const remainingTotal = items.reduce((sum, i) => sum + itemRemaining(i), 0);
  const coversAll = selection.length > 0 && items.every((i) => left(i) === 0 || (payable(i) && picked[i.id] === left(i)));

  function set(item: OrderItem, quantity: number) {
    setPicked((p) => ({ ...p, [item.id]: Math.min(Math.max(quantity, 0), left(item)) }));
  }

  function close() {
    setPicked({});
    onClose();
  }

  async function pay() {
    setBusy(true);
    try {
      const body = { items: selection.map((s) => ({ itemId: s.item.id, quantity: s.quantity })) };
      await api(`/orders/${order.id}/pay`, { method: "PUT", body });
      if (coversAll) await api(`/orders/${order.id}/close`, { method: "PUT" });
      toast(coversAll ? "Conta paga e mesa liberada" : "Pagamento registrado", "success");
      setPicked({});
      await onChanged();
      if (coversAll) onClose();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  async function print(only?: typeof selection) {
    try {
      await printHtml(billTicket(order, only));
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  }

  return (
    <Modal open={open} title={`Pagar · Mesa ${order.table.number}`} onClose={close}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">Restante da conta</span>
        <span className="font-semibold">{money(remainingTotal)}</span>
      </div>
      <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto">
        {items.map((item) => {
          const done = left(item) === 0;
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className={`text-sm font-medium ${done ? "text-slate-400 line-through" : ""}`}>
                  {item.quantity}× {item.product.name}
                </p>
                <p className="text-xs text-slate-500">
                  {money(item.unitPrice)} cada
                  {item.paidQuantity > 0 && !done && ` · ${item.paidQuantity} já pago(s)`}
                </p>
                {done && <Badge tone="green">Pago</Badge>}
                {!done && item.status !== "READY" && <Badge tone="amber">Aguardando cozinha</Badge>}
              </div>
              {payable(item) && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-lg leading-none hover:bg-slate-50"
                    onClick={() => set(item, (picked[item.id] ?? 0) - 1)}
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{picked[item.id] ?? 0}</span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-lg leading-none hover:bg-slate-50"
                    onClick={() => set(item, (picked[item.id] ?? 0) + 1)}
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
        <button
          className="text-sm font-medium text-emerald-700 hover:underline"
          onClick={() => setPicked(Object.fromEntries(items.filter(payable).map((i) => [i.id, left(i)])))}
        >
          Selecionar tudo
        </button>
        <span className="font-semibold">
          Selecionado: <span className="text-lg">{money(selectedTotal)}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="border border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100"
          onClick={() => print(selection.length ? selection : undefined)}
        >
          <Printer size={16} aria-hidden />
          {selection.length ? "Imprimir seleção" : "Imprimir conta"}
        </Button>
        <Button loading={busy} disabled={selection.length === 0} onClick={pay}>
          {coversAll ? "Pagar e fechar mesa" : "Pagar selecionados"}
        </Button>
      </div>
    </Modal>
  );
}
