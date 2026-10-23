import { prisma } from "../../prisma";
import { orderInclude } from "./orderHelpers";

interface ShowOrderRequest {
  orderId: string;
  userId: string;
  role: string;
}

class ShowOrderServices {
  async execute({ orderId, userId, role }: ShowOrderRequest) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) throw new Error("Pedido não encontrado");
    if (role === "WAITER" && order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");

    const total = order.items
      .filter((i) => i.status !== "CANCELED")
      .reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);

    return { ...order, total: Number(total.toFixed(2)) };
  }
}

export { ShowOrderServices };
