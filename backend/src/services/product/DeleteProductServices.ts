import { prisma } from "../../prisma";

interface DeleteProductRequest {
  id: string;
}

class DeleteProductServices {
  async execute({ id }: DeleteProductRequest) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Produto não encontrado");

    // Desativa para não quebrar pedidos antigos e o dashboard
    return prisma.product.update({ where: { id }, data: { active: false } });
  }
}

export { DeleteProductServices };
