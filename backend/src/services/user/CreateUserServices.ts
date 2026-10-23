import { hash } from "bcryptjs";
import { prisma } from "../../prisma";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

const ROLES = ["ADMIN", "WAITER", "KITCHEN"] as const;
type RoleName = (typeof ROLES)[number];

class CreateUserServices {
  async execute({ name, email, password, role }: CreateUserRequest) {
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password) throw new Error("Preencha todos os campos");
    if (!ROLES.includes(role as RoleName)) throw new Error("Perfil inválido");
    if (password.length < 6) throw new Error("A senha deve ter ao menos 6 caracteres");

    const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists) throw new Error("Email já cadastrado");

    return prisma.user.create({
      data: { name: cleanName, email: cleanEmail, password: await hash(password, 8), role: role as RoleName },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
  }
}

export { CreateUserServices };
