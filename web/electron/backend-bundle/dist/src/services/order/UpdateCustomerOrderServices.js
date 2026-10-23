"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class UpdateCustomerOrderServices {
    async execute({ orderId, userId, customerName }) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (!orderHelpers_1.ACTIVE_STATUSES.includes(order.status))
            throw new Error("Pedido já encerrado");
        // Nome vazio remove o cliente da mesa
        const updated = await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: { customerName: customerName?.trim() || null },
            include: orderHelpers_1.orderInclude,
        });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        return updated;
    }
}
exports.UpdateCustomerOrderServices = UpdateCustomerOrderServices;
