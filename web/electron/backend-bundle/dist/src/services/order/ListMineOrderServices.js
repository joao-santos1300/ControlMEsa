"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMineOrderServices = void 0;
const prisma_1 = require("../../prisma");
const orderHelpers_1 = require("./orderHelpers");
class ListMineOrderServices {
    async execute({ userId }) {
        return prisma_1.prisma.order.findMany({
            where: { waiterId: userId, status: { in: [...orderHelpers_1.ACTIVE_STATUSES] } },
            include: orderHelpers_1.orderInclude,
            orderBy: { created_at: "asc" },
        });
    }
}
exports.ListMineOrderServices = ListMineOrderServices;
