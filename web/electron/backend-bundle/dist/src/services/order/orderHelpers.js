"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_STATUSES = exports.orderInclude = void 0;
exports.refreshOrderStatus = refreshOrderStatus;
const orderInclude = {
    table: { select: { id: true, number: true, name: true } },
    waiter: { select: { id: true, name: true } },
    items: {
        include: { product: { select: { id: true, name: true, description: true, price: true } } },
        orderBy: { created_at: "asc" },
    },
};
exports.orderInclude = orderInclude;
const ACTIVE_STATUSES = ["OPEN", "PREPARING", "READY"];
exports.ACTIVE_STATUSES = ACTIVE_STATUSES;
// Status do pedido deriva do status dos itens não cancelados
async function refreshOrderStatus(tx, orderId) {
    const items = await tx.orderItem.findMany({
        where: { orderId, status: { not: "CANCELED" } },
        select: { status: true },
    });
    let status = "OPEN";
    if (items.length > 0 && items.every((i) => i.status === "READY"))
        status = "READY";
    else if (items.some((i) => i.status === "PREPARING" || i.status === "READY"))
        status = "PREPARING";
    await tx.order.update({ where: { id: orderId }, data: { status } });
}
