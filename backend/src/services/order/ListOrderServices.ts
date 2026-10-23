import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../prisma";
import { orderInclude } from "./orderHelpers";

interface ListOrderRequest {
  userId: string;
  role: string;
  status?: string;
  tableId?: string;
  waiterId?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
}

const STATUSES = ["OPEN", "PREPARING", "READY", "CLOSED", "CANCELED"] as const;
type StatusName = (typeof STATUSES)[number];

class ListOrderServices {
  async execute({ userId, role, status, tableId, waiterId, from, to, page, pageSize }: ListOrderRequest) {
    if (status && !STATUSES.includes(status as StatusName)) throw new Error("Status inválido");

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
      throw new Error("Data inválida");
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const take = Math.min(Math.max(Number(pageSize) || 20, 1), 100);

    // Garçom só enxerga os próprios pedidos
    const where: Prisma.OrderWhereInput = {
      status: status as StatusName | undefined,
      tableId: tableId || undefined,
      waiterId: role === "ADMIN" ? waiterId || undefined : userId,
      created_at: { gte: fromDate, lte: toDate },
    };

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { created_at: "desc" },
        skip: (currentPage - 1) * take,
        take,
      }),
    ]);

    return { data, page: currentPage, pageSize: take, total, totalPages: Math.ceil(total / take) };
  }
}

export { ListOrderServices };
