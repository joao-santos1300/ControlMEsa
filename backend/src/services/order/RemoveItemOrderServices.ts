import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { orderInclude, refreshOrderStatus } from "./orderHelpers";

interface RemoveItemOrderRequest {
  orderId: string;
  itemId: string;
  userId: string;
}

class RemoveItemOrderServices {
  async execute({ orderId, itemId, userId }: RemoveItemOrderRequest) {
    const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId }, include: { order: true } });
    if (!item) throw new Error("Item não encontrado");
    if (item.order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (item.status === "READY" || item.status === "CANCELED") {
      throw new Error("Item já pronto ou cancelado não pode ser retirado");
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.update({ where: { id: itemId }, data: { status: "CANCELED", changed: true } });

      const remaining = await tx.orderItem.count({ where: { orderId, status: { not: "CANCELED" } } });
      if (remaining === 0) {
        // Sem itens ativos o pedido é cancelado e a mesa liberada
        await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });
        await tx.table.update({ where: { id: item.order.tableId }, data: { status: "FREE" } });
      } else {
        await refreshOrderStatus(tx, orderId);
      }
      return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    });

    emitToKitchen("order:updated", updated);
    return updated;
  }
}

export { RemoveItemOrderServices };
