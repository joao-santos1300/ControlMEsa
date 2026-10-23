import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { ACTIVE_STATUSES, orderInclude } from "./orderHelpers";

interface UpdateCustomerOrderRequest {
  orderId: string;
  userId: string;
  customerName?: string;
}

class UpdateCustomerOrderServices {
  async execute({ orderId, userId, customerName }: UpdateCustomerOrderRequest) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Pedido não encontrado");
    if (order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (!(ACTIVE_STATUSES as readonly string[]).includes(order.status)) throw new Error("Pedido já encerrado");

    // Nome vazio remove o cliente da mesa
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { customerName: customerName?.trim() || null },
      include: orderInclude,
    });
    emitToKitchen("order:updated", updated);
    return updated;
  }
}

export { UpdateCustomerOrderServices };
