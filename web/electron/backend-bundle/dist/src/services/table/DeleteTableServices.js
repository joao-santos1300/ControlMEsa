"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTableServices = void 0;
const prisma_1 = require("../../prisma");
class DeleteTableServices {
    async execute({ id }) {
        const table = await prisma_1.prisma.table.findUnique({ where: { id } });
        if (!table)
            throw new Error("Mesa não encontrada");
        if (table.status === "OCCUPIED")
            throw new Error("Mesa ocupada não pode ser removida");
        return prisma_1.prisma.table.update({ where: { id }, data: { active: false } });
    }
}
exports.DeleteTableServices = DeleteTableServices;
