import { prisma } from "../../prisma";

class SummaryDashboardServices {
  async execute() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayItems = await prisma.orderItem.findMany({
      where: { created_at: { gte: startOfDay }, status: { not: "CANCELED" }, order: { status: { not: "CANCELED" } } },
      select: { quantity: true, unitPrice: true },
    });
    const ordersToday = await prisma.order.count({
      where: { created_at: { gte: startOfDay }, status: { not: "CANCELED" } },
    });
    const openOrders = await prisma.order.count({ where: { status: { in: ["OPEN", "PREPARING", "READY"] } } });
    const occupiedTables = await prisma.table.count({ where: { status: "OCCUPIED", active: true } });

    const revenueToday = todayItems.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);

    return { ordersToday, openOrders, occupiedTables, revenueToday: Number(revenueToday.toFixed(2)) };
  }
}

export { SummaryDashboardServices };
