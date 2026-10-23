import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { orderInclude } from "./orderHelpers";

interface UpdateItemOrderRequest {
  orderId: string;
  itemId: string;
  userId: string;
  quantity?: number;
  notes?: string;
}

class UpdateItemOrderServices {
  async execute({ orderId, itemId, userId, quantity, notes }: UpdateItemOrderRequest) {
    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
      throw new Error("Quantidade inválida");
    }

    const item = await prisma.orderItem.findFirst({ where: { id: itemId, orderId }, include: { order: true } });
    if (!item) throw new Error("Item não encontrado");
    if (item.order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (item.status === "READY" || item.status === "CANCELED") {
      throw new Error("Item já pronto ou cancelado não pode ser alterado");
    }

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity, notes: notes?.trim(), changed: true },
    });

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    emitToKitchen("order:updated", updated);
    return updated;
  }
}

export { UpdateItemOrderServices };
