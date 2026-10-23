"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTableServices = void 0;
const prisma_1 = require("../../prisma");
class ListTableServices {
    async execute() {
        return prisma_1.prisma.table.findMany({ where: { active: true }, orderBy: { number: "asc" } });
    }
}
exports.ListTableServices = ListTableServices;
