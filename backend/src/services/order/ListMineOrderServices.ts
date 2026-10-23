import { prisma } from "../../prisma";
import { ACTIVE_STATUSES, orderInclude } from "./orderHelpers";

interface ListMineOrderRequest {
  userId: string;
}

class ListMineOrderServices {
  async execute({ userId }: ListMineOrderRequest) {
    return prisma.order.findMany({
      where: { waiterId: userId, status: { in: [...ACTIVE_STATUSES] } },
      include: orderInclude,
      orderBy: { created_at: "asc" },
    });
  }
}

export { ListMineOrderServices };
