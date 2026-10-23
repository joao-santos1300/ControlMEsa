"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryServices = void 0;
const prisma_1 = require("../../prisma");
class UpdateCategoryServices {
    async execute({ id, name }) {
        const cleanName = name?.trim();
        if (!cleanName)
            throw new Error("Informe o nome da categoria");
        const category = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new Error("Categoria não encontrada");
        const exists = await prisma_1.prisma.category.findUnique({ where: { name: cleanName } });
        if (exists && exists.id !== id)
            throw new Error("Categoria já cadastrada");
        return prisma_1.prisma.category.update({ where: { id }, data: { name: cleanName } });
    }
}
exports.UpdateCategoryServices = UpdateCategoryServices;
