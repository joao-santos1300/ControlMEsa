"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = require("../src/prisma");
async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password)
        throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env");
    const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (exists)
        return;
    await prisma_1.prisma.user.create({
        data: { name: process.env.ADMIN_NAME ?? "Administrador", email, password: await (0, bcryptjs_1.hash)(password, 8), role: "ADMIN" },
    });
}
main().finally(() => prisma_1.prisma.$disconnect());
