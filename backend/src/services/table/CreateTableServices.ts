import { prisma } from "../../prisma";

interface CreateTableRequest {
  number: number;
  name?: string;
}

class CreateTableServices {
  async execute({ number, name }: CreateTableRequest) {
    const tableNumber = Number(number);
    if (!Number.isInteger(tableNumber) || tableNumber <= 0) throw new Error("Número da mesa inválido");

    const exists = await prisma.table.findUnique({ where: { number: tableNumber } });
    if (exists) throw new Error("Mesa já cadastrada");

    return prisma.table.create({ data: { number: tableNumber, name: name?.trim() || null } });
  }
}

export { CreateTableServices };
