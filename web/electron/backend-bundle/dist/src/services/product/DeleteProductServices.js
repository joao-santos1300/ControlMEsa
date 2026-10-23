"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProductServices = void 0;
const prisma_1 = require("../../prisma");
class DeleteProductServices {
    async execute({ id }) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error("Produto não encontrado");
        // Desativa para não quebrar pedidos antigos e o dashboard
        return prisma_1.prisma.product.update({ where: { id }, data: { active: false } });
    }
}
exports.DeleteProductServices = DeleteProductServices;
