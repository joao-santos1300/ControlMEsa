"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopProductsDashboardServices = void 0;
const prisma_1 = require("../../prisma");
class TopProductsDashboardServices {
    async execute({ from, to, limit }) {
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
            throw new Error("Data inválida");
        }
        const take = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const grouped = await prisma_1.prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
                status: { not: "CANCELED" },
                order: { status: { not: "CANCELED" } },
                created_at: { gte: fromDate, lte: toDate },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take,
        });
        const products = await prisma_1.prisma.product.findMany({
            where: { id: { in: grouped.map((g) => g.productId) } },
            select: { id: true, name: true, price: true },
        });
        const byId = new Map(products.map((p) => [p.id, p]));
        return grouped.map((g) => ({
            productId: g.productId,
            name: byId.get(g.productId)?.name ?? "",
            price: byId.get(g.productId)?.price ?? null,
            totalSold: g._sum.quantity ?? 0,
        }));
    }
}
exports.TopProductsDashboardServices = TopProductsDashboardServices;
