import { prisma } from "../../prisma";
import { emitToKitchen } from "../../socket";
import { ACTIVE_STATUSES, orderInclude } from "./orderHelpers";

interface PayItemsOrderRequest {
  orderId: string;
  userId: string;
  role: string;
  items: { itemId: string; quantity: number }[];
}

// Pagamento parcial: cada cliente paga só os itens (e quantidades) que escolheu
class PayItemsOrderServices {
  async execute({ orderId, userId, role, items }: PayItemsOrderRequest) {
    if (!Array.isArray(items) || items.length === 0) throw new Error("Selecione ao menos um item");

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Pedido não encontrado");
    if (role !== "ADMIN" && order.waiterId !== userId) throw new Error("Pedido pertence a outro garçom");
    if (!ACTIVE_STATUSES.some((s) => s === order.status)) throw new Error("Pedido já encerrado");

    const wanted = new Map<string, number>();
    for (const { itemId, quantity } of items) {
      if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantidade inválida");
      wanted.set(itemId, (wanted.get(itemId) ?? 0) + quantity);
    }

    for (const [itemId, quantity] of wanted) {
      const item = order.items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item não encontrado");
      if (item.status !== "READY") throw new Error("Só é possível pagar itens já prontos");
      if (item.paidQuantity + quantity > item.quantity) throw new Error("Quantidade maior que a restante a pagar");
    }

    await prisma.$transaction(
      [...wanted].map(([itemId, quantity]) =>
        prisma.orderItem.update({ where: { id: itemId }, data: { paidQuantity: { increment: quantity } } }),
      ),
    );

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude });
    emitToKitchen("order:updated", updated);
    return updated;
  }
}

export { PayItemsOrderServices };
