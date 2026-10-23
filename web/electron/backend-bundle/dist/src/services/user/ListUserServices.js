"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserServices = void 0;
const prisma_1 = require("../../prisma");
class ListUserServices {
    async execute() {
        return prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, active: true },
            orderBy: { name: "asc" },
        });
    }
}
exports.ListUserServices = ListUserServices;
