import { Prisma } from "../../../generated/prisma/client";

const orderInclude = {
  table: { select: { id: true, number: true, name: true } },
  waiter: { select: { id: true, name: true } },
  items: {
    include: { product: { select: { id: true, name: true, description: true, price: true } } },
    orderBy: { created_at: "asc" },
  },
} satisfies Prisma.OrderInclude;

const ACTIVE_STATUSES = ["OPEN", "PREPARING", "READY"] as const;

// Status do pedido deriva do status dos itens não cancelados
async function refreshOrderStatus(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({
    where: { orderId, status: { not: "CANCELED" } },
    select: { status: true },
  });

  let status: "OPEN" | "PREPARING" | "READY" = "OPEN";
  if (items.length > 0 && items.every((i) => i.status === "READY")) status = "READY";
  else if (items.some((i) => i.status === "PREPARING" || i.status === "READY")) status = "PREPARING";

  await tx.order.update({ where: { id: orderId }, data: { status } });
}

export { orderInclude, ACTIVE_STATUSES, refreshOrderStatus };
