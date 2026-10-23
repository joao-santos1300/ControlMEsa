import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { prisma } from "../../prisma";

interface AuthRequest {
  email: string;
  password: string;
}

class AuthSessionServices {
  async execute({ email, password }: AuthRequest) {
    if (!email || !password) throw new Error("Email ou senha incorretos!");

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.active) throw new Error("Email ou senha incorretos!");

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) throw new Error("Email ou senha incorretos!");

    const token = sign({ role: user.role }, process.env.JWT_SECRET as string, {
      subject: user.id,
      expiresIn: "12h",
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role, token };
  }
}

export { AuthSessionServices };
