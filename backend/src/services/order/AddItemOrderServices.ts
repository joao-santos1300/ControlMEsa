import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { ACTIVE_STATUSES, orderInclude, refreshOrderStatus } from "./orderHelpers";

interface AddItemOrderRequest {
  orderId: string;
  userId: string;
  role: string;
  productId: string;
  quantity: number;
  notes?: string;
}

class AddItemOrderServices {
  async execute({ orderId, userId, role, productId, quantity, notes }: AddItemOrderRequest) {
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Produto ou quantidade inválida");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Pedido não encontrado");
    if (role !== "ADMIN" && order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (!ACTIVE_STATUSES.some((s) => s === order.status)) throw new Error("Pedido já encerrado");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) throw new Error("Produto não encontrado ou inativo");

    const updated = await prisma.$transaction(async (tx) => {
      await tx.orderItem.create({
        data: { orderId, productId, quantity, unitPrice: product.price, notes: notes?.trim() || null, changed: true },
      });
      await refreshOrderStatus(tx, orderId);
      return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    });

    emitToKitchen("order:updated", updated);
    return updated;
  }
}

export { AddItemOrderServices };
