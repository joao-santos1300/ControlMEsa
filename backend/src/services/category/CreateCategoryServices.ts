import { prisma } from "../../prisma";

interface CreateCategoryRequest {
  name: string;
}

class CreateCategoryServices {
  async execute({ name }: CreateCategoryRequest) {
    const cleanName = name?.trim();
    if (!cleanName) throw new Error("Informe o nome da categoria");

    const exists = await prisma.category.findUnique({ where: { name: cleanName } });
    if (exists) throw new Error("Categoria já cadastrada");

    return prisma.category.create({ data: { name: cleanName } });
  }
}

export { CreateCategoryServices };
