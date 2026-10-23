"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayItemsOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
// Pagamento parcial: cada cliente paga só os itens (e quantidades) que escolheu
class PayItemsOrderServices {
    async execute({ orderId, userId, role, items }) {
        if (!Array.isArray(items) || items.length === 0)
            throw new Error("Selecione ao menos um item");
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (role !== "ADMIN" && order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (!orderHelpers_1.ACTIVE_STATUSES.some((s) => s === order.status))
            throw new Error("Pedido já encerrado");
        const wanted = new Map();
        for (const { itemId, quantity } of items) {
            if (!Number.isInteger(quantity) || quantity <= 0)
                throw new Error("Quantidade inválida");
            wanted.set(itemId, (wanted.get(itemId) ?? 0) + quantity);
        }
        for (const [itemId, quantity] of wanted) {
            const item = order.items.find((i) => i.id === itemId);
            if (!item)
                throw new Error("Item não encontrado");
            if (item.status !== "READY")
                throw new Error("Só é possível pagar itens já prontos");
            if (item.paidQuantity + quantity > item.quantity)
                throw new Error("Quantidade maior que a restante a pagar");
        }
        await prisma_1.prisma.$transaction([...wanted].map(([itemId, quantity]) => prisma_1.prisma.orderItem.update({ where: { id: itemId }, data: { paidQuantity: { increment: quantity } } })));
        const updated = await prisma_1.prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        return updated;
    }
}
exports.PayItemsOrderServices = PayItemsOrderServices;
