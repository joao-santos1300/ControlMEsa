"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListKitchenServices = void 0;
const prisma_1 = require("../../prisma");
const orderHelpers_1 = require("../order/orderHelpers");
class ListKitchenServices {
    async execute() {
        return prisma_1.prisma.order.findMany({
            where: { status: { in: [...orderHelpers_1.ACTIVE_STATUSES] } },
            include: orderHelpers_1.orderInclude,
            orderBy: { created_at: "asc" },
        });
    }
}
exports.ListKitchenServices = ListKitchenServices;
