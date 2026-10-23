"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductServices = void 0;
const prisma_1 = require("../../prisma");
class ListProductServices {
    async execute({ onlyActive, categoryId, q }) {
        return prisma_1.prisma.product.findMany({
            where: {
                active: onlyActive ? true : undefined,
                categoryId: categoryId || undefined,
                name: q ? { contains: q, mode: "insensitive" } : undefined,
            },
            include: { category: { select: { id: true, name: true } } },
            orderBy: { name: "asc" },
        });
    }
}
exports.ListProductServices = ListProductServices;
