"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class UpdateItemOrderServices {
    async execute({ orderId, itemId, userId, quantity, notes }) {
        if (quantity !== undefined && (!Number.isInteger(quantity) || quantity <= 0)) {
            throw new Error("Quantidade inválida");
        }
        const item = await prisma_1.prisma.orderItem.findFirst({ where: { id: itemId, orderId }, include: { order: true } });
        if (!item)
            throw new Error("Item não encontrado");
        if (item.order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (item.status === "READY" || item.status === "CANCELED") {
            throw new Error("Item já pronto ou cancelado não pode ser alterado");
        }
        await prisma_1.prisma.orderItem.update({
            where: { id: itemId },
            data: { quantity, notes: notes?.trim(), changed: true },
        });
        const updated = await prisma_1.prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        return updated;
    }
}
exports.UpdateItemOrderServices = UpdateItemOrderServices;
