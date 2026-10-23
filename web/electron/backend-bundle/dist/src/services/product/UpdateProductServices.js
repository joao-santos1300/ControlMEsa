"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductServices = void 0;
const prisma_1 = require("../../prisma");
class UpdateProductServices {
    async execute({ id, name, description, price, categoryId, active }) {
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new Error("Produto não encontrado");
        let numericPrice;
        if (price !== undefined) {
            numericPrice = Number(price);
            if (price === "" || Number.isNaN(numericPrice) || numericPrice < 0)
                throw new Error("Preço inválido");
        }
        if (categoryId) {
            const category = await prisma_1.prisma.category.findUnique({ where: { id: categoryId } });
            if (!category)
                throw new Error("Categoria não encontrada");
        }
        return prisma_1.prisma.product.update({
            where: { id },
            data: {
                name: name?.trim() || undefined,
                description: description?.trim() || undefined,
                price: numericPrice,
                categoryId,
                active,
            },
        });
    }
}
exports.UpdateProductServices = UpdateProductServices;
