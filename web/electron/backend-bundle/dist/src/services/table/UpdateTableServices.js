"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTableServices = void 0;
const prisma_1 = require("../../prisma");
class UpdateTableServices {
    async execute({ id, number, name, active }) {
        const table = await prisma_1.prisma.table.findUnique({ where: { id } });
        if (!table)
            throw new Error("Mesa não encontrada");
        let tableNumber;
        if (number !== undefined) {
            tableNumber = Number(number);
            if (!Number.isInteger(tableNumber) || tableNumber <= 0)
                throw new Error("Número da mesa inválido");
            const exists = await prisma_1.prisma.table.findUnique({ where: { number: tableNumber } });
            if (exists && exists.id !== id)
                throw new Error("Mesa já cadastrada");
        }
        return prisma_1.prisma.table.update({ where: { id }, data: { number: tableNumber, name: name?.trim(), active } });
    }
}
exports.UpdateTableServices = UpdateTableServices;
