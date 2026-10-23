"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrderServices = void 0;
const prisma_1 = require("../../prisma");
const orderHelpers_1 = require("./orderHelpers");
const STATUSES = ["OPEN", "PREPARING", "READY", "CLOSED", "CANCELED"];
class ListOrderServices {
    async execute({ userId, role, status, tableId, waiterId, from, to, page, pageSize }) {
        if (status && !STATUSES.includes(status))
            throw new Error("Status inválido");
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
            throw new Error("Data inválida");
        }
        const currentPage = Math.max(Number(page) || 1, 1);
        const take = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
        // Garçom só enxerga os próprios pedidos
        const where = {
            status: status,
            tableId: tableId || undefined,
            waiterId: role === "ADMIN" ? waiterId || undefined : userId,
            created_at: { gte: fromDate, lte: toDate },
        };
        const [total, data] = await Promise.all([
            prisma_1.prisma.order.count({ where }),
            prisma_1.prisma.order.findMany({
                where,
                include: orderHelpers_1.orderInclude,
                orderBy: { created_at: "desc" },
                skip: (currentPage - 1) * take,
                take,
            }),
        ]);
        return { data, page: currentPage, pageSize: take, total, totalPages: Math.ceil(total / take) };
    }
}
exports.ListOrderServices = ListOrderServices;
