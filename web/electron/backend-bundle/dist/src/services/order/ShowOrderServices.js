"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowOrderServices = void 0;
const prisma_1 = require("../../prisma");
const orderHelpers_1 = require("./orderHelpers");
class ShowOrderServices {
    async execute({ orderId, userId, role }) {
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (role === "WAITER" && order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        const total = order.items
            .filter((i) => i.status !== "CANCELED")
            .reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
        return { ...order, total: Number(total.toFixed(2)) };
    }
}
exports.ShowOrderServices = ShowOrderServices;
