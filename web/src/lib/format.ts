import type { ItemStatus, OrderItem, OrderStatus, Role } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function money(value: string | number) {
  return brl.format(Number(value));
}

export function orderTotal(items: OrderItem[]) {
  return items.filter((i) => i.status !== "CANCELED").reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
}

export function timeSince(iso: string) {
  const minutes = Math.max(Math.floor((Date.now() - new Date(iso).getTime()) / 60000), 0);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export const roleLabel: Record<Role, string> = { ADMIN: "Administrador", WAITER: "Garçom", KITCHEN: "Cozinha" };

export const orderStatusLabel: Record<OrderStatus, string> = {
  OPEN: "Aberto",
  PREPARING: "Em preparo",
  READY: "Pronto",
  CLOSED: "Fechado",
  CANCELED: "Cancelado",
};

export const itemStatusLabel: Record<ItemStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Em preparo",
  READY: "Pronto",
  CANCELED: "Cancelado",
};

/** Valor ainda a pagar de um item (quantidade restante × preço). */
export function itemRemaining(item: OrderItem) {
  return Number(item.unitPrice) * (item.quantity - item.paidQuantity);
}
