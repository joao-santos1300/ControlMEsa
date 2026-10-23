import { prisma } from "../../prisma";

interface DeleteCategoryRequest {
  id: string;
}

class DeleteCategoryServices {
  async execute({ id }: DeleteCategoryRequest) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error("Categoria não encontrada");

    const products = await prisma.product.count({ where: { categoryId: id } });
    if (products > 0) throw new Error("Categoria possui produtos vinculados");

    return prisma.category.delete({ where: { id } });
  }
}

export { DeleteCategoryServices };
