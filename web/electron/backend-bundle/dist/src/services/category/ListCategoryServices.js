"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCategoryServices = void 0;
const prisma_1 = require("../../prisma");
class ListCategoryServices {
    async execute() {
        return prisma_1.prisma.category.findMany({ orderBy: { name: "asc" } });
    }
}
exports.ListCategoryServices = ListCategoryServices;
