import { prisma } from "../../prisma";

interface UpdateCategoryRequest {
  id: string;
  name: string;
}

class UpdateCategoryServices {
  async execute({ id, name }: UpdateCategoryRequest) {
    const cleanName = name?.trim();
    if (!cleanName) throw new Error("Informe o nome da categoria");

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error("Categoria não encontrada");

    const exists = await prisma.category.findUnique({ where: { name: cleanName } });
    if (exists && exists.id !== id) throw new Error("Categoria já cadastrada");

    return prisma.category.update({ where: { id }, data: { name: cleanName } });
  }
}

export { UpdateCategoryServices };
