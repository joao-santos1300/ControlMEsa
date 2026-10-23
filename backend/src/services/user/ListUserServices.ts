import { prisma } from "../../prisma";

class ListUserServices {
  async execute() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true },
      orderBy: { name: "asc" },
    });
  }
}

export { ListUserServices };
