"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveItemOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class RemoveItemOrderServices {
    async execute({ orderId, itemId, userId }) {
        const item = await prisma_1.prisma.orderItem.findFirst({ where: { id: itemId, orderId }, include: { order: true } });
        if (!item)
            throw new Error("Item não encontrado");
        if (item.order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (item.status === "READY" || item.status === "CANCELED") {
            throw new Error("Item já pronto ou cancelado não pode ser retirado");
        }
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.orderItem.update({ where: { id: itemId }, data: { status: "CANCELED", changed: true } });
            const remaining = await tx.orderItem.count({ where: { orderId, status: { not: "CANCELED" } } });
            if (remaining === 0) {
                // Sem itens ativos o pedido é cancelado e a mesa liberada
                await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });
                await tx.table.update({ where: { id: item.order.tableId }, data: { status: "FREE" } });
            }
            else {
                await (0, orderHelpers_1.refreshOrderStatus)(tx, orderId);
            }
            return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        return updated;
    }
}
exports.RemoveItemOrderServices = RemoveItemOrderServices;
