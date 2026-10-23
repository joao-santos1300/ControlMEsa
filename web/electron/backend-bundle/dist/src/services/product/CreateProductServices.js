"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductServices = void 0;
const prisma_1 = require("../../prisma");
class CreateProductServices {
    async execute({ name, description, price, categoryId }) {
        const cleanName = name?.trim();
        const cleanDescription = description?.trim();
        const numericPrice = Number(price);
        if (!cleanName || !cleanDescription || !categoryId)
            throw new Error("Preencha todos os campos");
        if (price === undefined || price === null || price === "" || Number.isNaN(numericPrice) || numericPrice < 0) {
            throw new Error("Preço inválido");
        }
        const category = await prisma_1.prisma.category.findUnique({ where: { id: categoryId } });
        if (!category)
            throw new Error("Categoria não encontrada");
        return prisma_1.prisma.product.create({
            data: { name: cleanName, description: cleanDescription, price: numericPrice, categoryId },
        });
    }
}
exports.CreateProductServices = CreateProductServices;
