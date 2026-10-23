"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCategoryServices = void 0;
const prisma_1 = require("../../prisma");
class DeleteCategoryServices {
    async execute({ id }) {
        const category = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new Error("Categoria não encontrada");
        const products = await prisma_1.prisma.product.count({ where: { categoryId: id } });
        if (products > 0)
            throw new Error("Categoria possui produtos vinculados");
        return prisma_1.prisma.category.delete({ where: { id } });
    }
}
exports.DeleteCategoryServices = DeleteCategoryServices;
