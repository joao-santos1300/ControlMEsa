import { prisma } from "../../prisma";

class ListTableServices {
  async execute() {
    return prisma.table.findMany({ where: { active: true }, orderBy: { number: "asc" } });
  }
}

export { ListTableServices };
