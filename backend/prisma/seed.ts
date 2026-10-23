import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../src/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return;

  await prisma.user.create({
    data: { name: process.env.ADMIN_NAME ?? "Administrador", email, password: await hash(password, 8), role: "ADMIN" },
  });
}

main().finally(() => prisma.$disconnect());
