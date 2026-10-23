"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class CancelOrderServices {
    async execute({ orderId, userId, role }) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (role !== "ADMIN" && order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (!orderHelpers_1.ACTIVE_STATUSES.some((s) => s === order.status))
            throw new Error("Pedido já encerrado");
        if (order.items.some((i) => i.status === "READY")) {
            throw new Error("Pedido com itens já prontos não pode ser cancelado");
        }
        const canceled = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.orderItem.updateMany({
                where: { orderId, status: { not: "CANCELED" } },
                data: { status: "CANCELED", changed: true },
            });
            await tx.order.update({ where: { id: orderId }, data: { status: "CANCELED" } });
            await tx.table.update({ where: { id: order.tableId }, data: { status: "FREE" } });
            return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        });
        (0, socket_1.emitToKitchen)("order:updated", canceled);
        return canceled;
    }
}
exports.CancelOrderServices = CancelOrderServices;
