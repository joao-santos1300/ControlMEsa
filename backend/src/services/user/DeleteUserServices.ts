import { prisma } from "../../prisma";

interface DeleteUserRequest {
  id: string;
}

class DeleteUserServices {
  async execute({ id }: DeleteUserRequest) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Usuário não encontrado");

    // Desativa em vez de apagar para preservar o histórico dos pedidos
    return prisma.user.update({
      where: { id },
      data: { active: false },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
  }
}

export { DeleteUserServices };
