import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { ACTIVE_STATUSES, orderInclude } from "./orderHelpers";

interface CancelOrderRequest {
  orderId: string;
  userId: string;
  role: string;
}

class CancelOrderServices {
  async execute({ orderId, userId, role }: CancelOrderRequest) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Pedido não encontrado");
    if (role !== "ADMIN" && order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (!ACTIVE_STATUSES.some((s) => s === order.status)) throw new Error("Pedido já encerrado");
    if (order.items.some((i) => i.status === "READY")) {
      throw new Error("Pedido com itens já prontos não pode ser cancelado");
    }

    const canceled = await prisma.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: { orderId, status: { not: "CANCELED" } },
        data: { status: "CANCELED", changed: true },
      });
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });
      await tx.table.update({ where: { id: order.tableId }, data: { status: "FREE" } });
      return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    });

    emitToKitchen("order:updated", canceled);
    return canceled;
  }
}

export { CancelOrderServices };
