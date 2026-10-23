import { prisma } from "../../prisma";
import { ACTIVE_STATUSES, orderInclude } from "../order/orderHelpers";

class ListKitchenServices {
  async execute() {
    return prisma.order.findMany({
      where: { status: { in: [...ACTIVE_STATUSES] } },
      include: orderInclude,
      orderBy: { created_at: "asc" },
    });
  }
}

export { ListKitchenServices };
