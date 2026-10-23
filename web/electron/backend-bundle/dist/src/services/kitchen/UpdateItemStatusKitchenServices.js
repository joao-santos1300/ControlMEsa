"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemStatusKitchenServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("../order/orderHelpers");
class UpdateItemStatusKitchenServices {
    async execute({ orderId, itemId, status }) {
        if (status !== "PREPARING" && status !== "READY")
            throw new Error("Status inválido");
        const item = await prisma_1.prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
        if (!item)
            throw new Error("Item não encontrado");
        if (item.status === "CANCELED")
            throw new Error("Item cancelado");
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            // Ao mudar o status a cozinha reconhece a alteração, então limpa o destaque
            await tx.orderItem.update({ where: { id: itemId }, data: { status, changed: false } });
            await (0, orderHelpers_1.refreshOrderStatus)(tx, orderId);
            return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        (0, socket_1.emitToWaiter)(updated.waiterId, "item:status", {
            orderId,
            itemId,
            status,
            table: updated.table,
            orderStatus: updated.status,
        });
        if (updated.status === "READY") {
            (0, socket_1.emitToWaiter)(updated.waiterId, "order:ready", { orderId, table: updated.table });
        }
        return updated;
    }
}
exports.UpdateItemStatusKitchenServices = UpdateItemStatusKitchenServices;
