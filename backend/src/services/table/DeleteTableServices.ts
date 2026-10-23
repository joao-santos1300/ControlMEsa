import { prisma } from "../../prisma";

interface DeleteTableRequest {
  id: string;
}

class DeleteTableServices {
  async execute({ id }: DeleteTableRequest) {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new Error("Mesa não encontrada");
    if (table.status === "OCCUPIED") throw new Error("Mesa ocupada não pode ser removida");

    return prisma.table.update({ where: { id }, data: { active: false } });
  }
}

export { DeleteTableServices };
