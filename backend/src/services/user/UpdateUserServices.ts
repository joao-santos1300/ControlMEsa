import { hash } from "bcryptjs";
import { prisma } from "../../prisma";

interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  active?: boolean;
}

const ROLES = ["ADMIN", "WAITER", "KITCHEN"] as const;
type RoleName = (typeof ROLES)[number];

class UpdateUserServices {
  async execute({ id, name, email, password, role, active }: UpdateUserRequest) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("Usuário não encontrado");

    if (role !== undefined && !ROLES.includes(role as RoleName)) throw new Error("Perfil inválido");
    if (password !== undefined && password.length < 6) throw new Error("A senha deve ter ao menos 6 caracteres");

    const cleanEmail = email?.trim().toLowerCase();
    if (cleanEmail && cleanEmail !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (exists) throw new Error("Email já cadastrado");
    }

    return prisma.user.update({
      where: { id },
      data: {
        name: name?.trim() || undefined,
        email: cleanEmail || undefined,
        password: password ? await hash(password, 8) : undefined,
        role: role as RoleName | undefined,
        active,
      },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
  }
}

export { UpdateUserServices };
