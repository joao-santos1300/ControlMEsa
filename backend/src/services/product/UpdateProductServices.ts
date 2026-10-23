import { prisma } from "../../prisma";

interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number | string;
  categoryId?: string;
  active?: boolean;
}

class UpdateProductServices {
  async execute({ id, name, description, price, categoryId, active }: UpdateProductRequest) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Produto não encontrado");

    let numericPrice: number | undefined;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (price === "" || Number.isNaN(numericPrice) || numericPrice < 0) throw new Error("Preço inválido");
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) throw new Error("Categoria não encontrada");
    }

    return prisma.product.update({
      where: { id },
      data: {
        name: name?.trim() || undefined,
        description: description?.trim() || undefined,
        price: numericPrice,
        categoryId,
        active,
      },
    });
  }
}

export { UpdateProductServices };
