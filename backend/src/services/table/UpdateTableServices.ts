import { prisma } from "../../prisma";

interface UpdateTableRequest {
  id: string;
  number?: number;
  name?: string;
  active?: boolean;
}

class UpdateTableServices {
  async execute({ id, number, name, active }: UpdateTableRequest) {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new Error("Mesa não encontrada");

    let tableNumber: number | undefined;
    if (number !== undefined) {
      tableNumber = Number(number);
      if (!Number.isInteger(tableNumber) || tableNumber <= 0) throw new Error("Número da mesa inválido");
      const exists = await prisma.table.findUnique({ where: { number: tableNumber } });
      if (exists && exists.id !== id) throw new Error("Mesa já cadastrada");
    }

    return prisma.table.update({ where: { id }, data: { number: tableNumber, name: name?.trim(), active } });
  }
}

export { UpdateTableServices };
