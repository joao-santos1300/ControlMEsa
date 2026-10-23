"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderServices = void 0;
const prisma_1 = require("../../prisma");
const socket_1 = require("../../socket");
const orderHelpers_1 = require("./orderHelpers");
class CreateOrderServices {
    async execute({ waiterId, tableId, notes, customerName, items }) {
        if (!tableId || !Array.isArray(items) || items.length === 0) {
            throw new Error("Informe a mesa e ao menos um item");
        }
        for (const item of items) {
            if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error("Item com produto ou quantidade inválida");
            }
        }
        const table = await prisma_1.prisma.table.findUnique({ where: { id: tableId } });
        if (!table || !table.active)
            throw new Error("Mesa não encontrada");
        const productIds = [...new Set(items.map((i) => i.productId))];
        const products = await prisma_1.prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
        if (products.length !== productIds.length)
            throw new Error("Produto não encontrado ou inativo");
        const productById = new Map(products.map((p) => [p.id, p]));
        const { order, isNew } = await prisma_1.prisma.$transaction(async (tx) => {
            const openOrder = await tx.order.findFirst({
                where: { tableId, status: { in: [...orderHelpers_1.ACTIVE_STATUSES] } },
            });
            if (openOrder && openOrder.waiterId !== waiterId)
                throw new Error("Mesa ocupada por outro garçom");
            const orderId = openOrder?.id ??
                (await tx.order.create({
                    data: { tableId, waiterId, notes: notes?.trim() || null, customerName: customerName?.trim() || null },
                })).id;
            for (const i of items) {
                const product = productById.get(i.productId);
                if (!product)
                    throw new Error("Produto não encontrado ou inativo");
                await tx.orderItem.create({
                    data: {
                        orderId,
                        productId: i.productId,
                        quantity: i.quantity,
                        unitPrice: product.price,
                        notes: i.notes?.trim() || null,
                        // Itens adicionados a um pedido já enviado ficam destacados na cozinha
                        changed: Boolean(openOrder),
                    },
                });
            }
            await tx.table.update({ where: { id: tableId }, data: { status: "OCCUPIED" } });
            await (0, orderHelpers_1.refreshOrderStatus)(tx, orderId);
            const full = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderHelpers_1.orderInclude });
            return { order: full, isNew: !openOrder };
        });
        (0, socket_1.emitToKitchen)(isNew ? "order:new" : "order:updated", order);
        return order;
    }
}
exports.CreateOrderServices = CreateOrderServices;
