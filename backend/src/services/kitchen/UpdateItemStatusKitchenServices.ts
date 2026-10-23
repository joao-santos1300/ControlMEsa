import { prisma } from "../../prisma";
import { emitToKitchen, emitToWaiter } from "../../socket";
import { orderInclude, refreshOrderStatus } from "../order/orderHelpers";

interface UpdateItemStatusKitchenRequest {
  orderId: string;
  itemId: string;
  status: string;
}

class UpdateItemStatusKitchenServices {
  async execute({ orderId, itemId, status }: UpdateItemStatusKitchenRequest) {
    if (status !== "PREPARING" && status !== "READY") throw new Error("Status inválido");

    const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
    if (!item) throw new Error("Item não encontrado");
    if (item.status === "CANCELED") throw new Error("Item cancelado");

    const updated = await prisma.$transaction(async (tx) => {
      // Ao mudar o status a cozinha reconhece a alteração, então limpa o destaque
      await tx.orderItem.update({ where: { id: itemId }, data: { status, changed: false } });
      await refreshOrderStatus(tx, orderId);
      return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    });

    emitToKitchen("order:updated", updated);
    emitToWaiter(updated.waiterId, "item:status", {
      orderId,
      itemId,
      status,
      table: updated.table,
      orderStatus: updated.status,
    });
    if (updated.status === "READY") {
      emitToWaiter(updated.waiterId, "order:ready", { orderId, table: updated.table });
    }
    return updated;
  }
}

export { UpdateItemStatusKitchenServices };
