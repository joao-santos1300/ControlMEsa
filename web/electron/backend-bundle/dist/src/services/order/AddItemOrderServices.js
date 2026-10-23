"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddItemOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class AddItemOrderServices {
    async execute({ orderId, userId, role, productId, quantity, notes }) {
        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Produto ou quantidade inválida");
        }
        const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new Error("Pedido não encontrado");
        if (role !== "ADMIN" && order.waiterId !== userId)
            throw new Error("Pedido pertence a outro garçom");
        if (!orderHelpers_1.ACTIVE_STATUSES.some((s) => s === order.status))
            throw new Error("Pedido já encerrado");
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product || !product.active)
            throw new Error("Produto não encontrado ou inativo");
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.orderItem.create({
                data: { orderId, productId, quantity, unitPrice: product.price, notes: notes?.trim() || null, changed: true },
            });
            await (0, orderHelpers_1.refreshOrderStatus)(tx, orderId);
            return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
        });
        (0, socket_1.emitToKitchen)("order:updated", updated);
        return updated;
    }
}
exports.AddItemOrderServices = AddItemOrderServices;
