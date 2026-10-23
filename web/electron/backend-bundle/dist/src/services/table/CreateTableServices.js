"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTableServices = void 0;
const prisma_1 = require("../../prisma");
class CreateTableServices {
    async execute({ number, name }) {
        const tableNumber = Number(number);
        if (!Number.isInteger(tableNumber) || tableNumber <= 0)
            throw new Error("Número da mesa inválido");
        const exists = await prisma_1.prisma.table.findUnique({ where: { number: tableNumber } });
        if (exists)
            throw new Error("Mesa já cadastrada");
        return prisma_1.prisma.table.create({ data: { number: tableNumber, name: name?.trim() || null } });
    }
}
exports.CreateTableServices = CreateTableServices;
