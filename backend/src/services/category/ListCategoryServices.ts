import { prisma } from "../../prisma";

class ListCategoryServices {
  async execute() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }
}

export { ListCategoryServices };
