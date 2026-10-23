import { prisma } from "../../prisma";

interface ListProductRequest {
  onlyActive: boolean;
  categoryId?: string;
  q?: string;
}

class ListProductServices {
  async execute({ onlyActive, categoryId, q }: ListProductRequest) {
    return prisma.product.findMany({
      where: {
        active: onlyActive ? true : undefined,
        categoryId: categoryId || undefined,
        name: q ? { contains: q, mode: "insensitive" } : undefined,
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  }
}

export { ListProductServices };
