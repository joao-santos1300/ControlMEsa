import { dateTime, money } from "./format";
import type { Order, OrderItem } from "./types";

const esc = (text: string) =>
  text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

const STYLE = `
  @page { size: 80mm auto; margin: 0 }
  * { box-sizing: border-box }
  body { width: 72mm; margin: 0 auto; padding: 2mm 0; font: 12px/1.35 "Courier New", monospace; color: #000 }
  h1 { font-size: 16px; margin: 0 0 2px; text-align: center }
  .c { text-align: center }
  .row { display: flex; justify-content: space-between; gap: 6px }
  .big { font-size: 14px; font-weight: bold }
  .obs { padding-left: 14px; font-style: italic }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0 }
`;

const doc = (body: string) => `<!doctype html><html><head><meta charset="utf-8"><style>${STYLE}</style></head><body>${body}</body></html>`;

interface TicketInfo {
  table: { number: number; name: string | null };
  waiter: { name: string };
  customerName?: string | null;
}

function header(title: string, order: TicketInfo) {
  return `<h1>${title}</h1>
    <p class="c big">Mesa ${order.table.number}${order.table.name ? ` · ${esc(order.table.name)}` : ""}</p>
    ${order.customerName ? `<p class="c big">${esc(order.customerName)}</p>` : ""}
    <p class="c">${esc(order.waiter.name)} · ${dateTime(new Date().toISOString())}</p><hr>`;
}

interface KitchenLine {
  quantity: number;
  notes: string | null;
  product: { name: string };
}

/** Comanda para a cozinha: só os itens informados, com observações. */
export function kitchenTicket(order: TicketInfo & { notes?: string | null }, items: KitchenLine[]) {
  const lines = items
    .map(
      (i) => `<div class="big">${i.quantity}× ${esc(i.product.name)}</div>${i.notes ? `<div class="obs">Obs.: ${esc(i.notes)}</div>` : ""}`,
    )
    .join("<br>");
  return doc(`${header("COZINHA", order)}${lines}${order.notes ? `<hr><div>${esc(order.notes)}</div>` : ""}<hr>`);
}

/** Conta: itens com valor; `only` restringe aos itens/quantidades de um pagamento parcial. */
export function billTicket(order: Order, only?: { item: OrderItem; quantity: number }[]) {
  const lines = (only ?? order.items.filter((i) => i.status !== "CANCELED").map((item) => ({ item, quantity: item.quantity })))
    .map(
      ({ item, quantity }) =>
        `<div class="row"><span>${quantity}× ${esc(item.product.name)}</span><span>${money(Number(item.unitPrice) * quantity)}</span></div>`,
    )
    .join("");
  const total = (only ?? order.items.filter((i) => i.status !== "CANCELED").map((item) => ({ item, quantity: item.quantity }))).reduce(
    (sum, { item, quantity }) => sum + Number(item.unitPrice) * quantity,
    0,
  );
  return doc(
    `${header(only ? "CONTA PARCIAL" : "CONTA", order)}${lines}<hr><div class="row big"><span>TOTAL</span><span>${money(total)}</span></div><hr><p class="c">Obrigado pela preferência!</p>`,
  );
}

export async function printHtml(html: string): Promise<void> {
  if (window.controlmesa?.printHtml) {
    if (await window.controlmesa.printHtml(html)) return;
  }
  await new Promise<void>((resolve) => {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    frame.srcdoc = html;
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      setTimeout(() => {
        frame.remove();
        resolve();
      }, 1000);
    };
    document.body.appendChild(frame);
  });
}

/** Impressão silenciosa só existe no app desktop. */
export const canPrintSilently = () => typeof window !== "undefined" && !!window.controlmesa?.printHtml;

const REPORT_STYLE = `
  @page { size: A4; margin: 14mm }
  * { box-sizing: border-box }
  body { font: 12px/1.4 Arial, sans-serif; color: #000; margin: 0 }
  h1 { font-size: 20px; margin: 0 0 4px }
  h2 { font-size: 14px; margin: 18px 0 6px }
  p { margin: 0 0 4px }
  table { width: 100%; border-collapse: collapse }
  th, td { padding: 4px 6px; border-bottom: 1px solid #ccc; text-align: left }
  th.r, td.r { text-align: right }
  .sum { display: flex; gap: 24px; margin: 12px 0 }
  .sum div { border: 1px solid #999; padding: 8px 14px }
  .sum b { display: block; font-size: 16px }
`;

export interface ReportData {
  periodLabel: string;
  statusLabel: string;
  total: number;
  count: number;
  byDay: { day: string; count: number; total: number }[];
  byProduct: { name: string; quantity: number; total: number }[];
  orders: { date: string; table: string; customer: string; waiter: string; total: number }[];
}

export function revenueReport(r: ReportData) {
  const rows = (cells: string[][]) => cells.map((c) => `<tr>${c.join("")}</tr>`).join("");
  const td = (v: string, right = false) => `<td${right ? ' class="r"' : ""}>${esc(v)}</td>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${REPORT_STYLE}</style></head><body>
    <h1>Relatório de faturamento</h1>
    <p>Período: ${esc(r.periodLabel)} · Pedidos: ${esc(r.statusLabel)}</p>
    <p>Emitido em ${dateTime(new Date().toISOString())}</p>
    <div class="sum"><div>Faturamento<b>${money(r.total)}</b></div><div>Pedidos<b>${r.count}</b></div><div>Ticket médio<b>${money(r.count ? r.total / r.count : 0)}</b></div></div>
    <h2>Por dia</h2>
    <table><tr><th>Dia</th><th class="r">Pedidos</th><th class="r">Total</th></tr>${rows(r.byDay.map((d) => [td(d.day), td(String(d.count), true), td(money(d.total), true)]))}</table>
    <h2>Por produto</h2>
    <table><tr><th>Produto</th><th class="r">Qtd.</th><th class="r">Total</th></tr>${rows(r.byProduct.map((p) => [td(p.name), td(String(p.quantity), true), td(money(p.total), true)]))}</table>
    <h2>Pedidos</h2>
    <table><tr><th>Data</th><th>Mesa</th><th>Cliente</th><th>Garçom</th><th class="r">Total</th></tr>${rows(r.orders.map((o) => [td(o.date), td(o.table), td(o.customer), td(o.waiter), td(money(o.total), true)]))}</table>
  </body></html>`;
}

/** Relatório em A4: sempre pelo diálogo de impressão do navegador (não usa a impressora de cupom). */
export function printReport(html: string) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  frame.srcdoc = html;
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  };
  document.body.appendChild(frame);
}
