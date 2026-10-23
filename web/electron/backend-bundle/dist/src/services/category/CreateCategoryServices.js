"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryServices = void 0;
const prisma_1 = require("../../prisma");
class CreateCategoryServices {
    async execute({ name }) {
        const cleanName = name?.trim();
        if (!cleanName)
            throw new Error("Informe o nome da categoria");
        const exists = await prisma_1.prisma.category.findUnique({ where: { name: cleanName } });
        if (exists)
            throw new Error("Categoria já cadastrada");
        return prisma_1.prisma.category.create({ data: { name: cleanName } });
    }
}
exports.CreateCategoryServices = CreateCategoryServices;
