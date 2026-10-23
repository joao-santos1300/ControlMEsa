"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class CloseOrderServices {
    async execute({ orderId, userId, role }) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (role !== "ADMIN" && order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (!orderHelpers_1.ACTIVE_STATUSES.some((s) => s === order.status))
            throw new Error("Pedido já encerrado");
        const pending = order.items.some((i) => i.status === "PENDING" || i.status === "PREPARING");
        if (pending)
            throw new Error("Existem itens ainda em preparo");
        // Com pagamento parcial em andamento, só fecha quando tudo foi pago
        const active = order.items.filter((i) => i.status !== "CANCELED");
        if (active.some((i) => i.paidQuantity > 0) && active.some((i) => i.paidQuantity < i.quantity)) {
            throw new Error("Ainda há itens a pagar");
        }
        const closed = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.order.update({ where: { id: orderId }, data: { status: "CLOSED" } });
            await tx.table.update({ where: { id: order.tableId }, data: { status: "FREE" } });
            return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        });
        (0, socket_1.emitToKitchen)("order:updated", closed);
        return closed;
    }
}
exports.CloseOrderServices = CloseOrderServices;
