import { prisma } from "../../prisma";

interface CreateProductRequest {
  name: string;
  description: string;
  price: number | string;
  categoryId: string;
}

class CreateProductServices {
  async execute({ name, description, price, categoryId }: CreateProductRequest) {
    const cleanName = name?.trim();
    const cleanDescription = description?.trim();
    const numericPrice = Number(price);
    if (!cleanName || !cleanDescription || !categoryId) throw new Error("Preencha todos os campos");
    if (price === undefined || price === null || price === "" || Number.isNaN(numericPrice) || numericPrice < 0) {
      throw new Error("Preço inválido");
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new Error("Categoria não encontrada");

    return prisma.product.create({
      data: { name: cleanName, description: cleanDescription, price: numericPrice, categoryId },
    });
  }
}

export { CreateProductServices };
