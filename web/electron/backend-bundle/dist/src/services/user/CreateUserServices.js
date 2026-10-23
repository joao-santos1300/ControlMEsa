"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserServices = void 0;
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = require("../../prisma");
const ROLES = ["ADMIN", "WAITER", "KITCHEN"];
class CreateUserServices {
    async execute({ name, email, password, role }) {
        const cleanName = name?.trim();
        const cleanEmail = email?.trim().toLowerCase();
        if (!cleanName || !cleanEmail || !password)
            throw new Error("Preencha todos os campos");
        if (!ROLES.includes(role))
            throw new Error("Perfil inválido");
        if (password.length < 6)
            throw new Error("A senha deve ter ao menos 6 caracteres");
        const exists = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (exists)
            throw new Error("Email já cadastrado");
        return prisma_1.prisma.user.create({
            data: { name: cleanName, email: cleanEmail, password: await (0, bcryptjs_1.hash)(password, 8), role: role },
            select: { id: true, name: true, email: true, role: true, active: true },
        });
    }
}
exports.CreateUserServices = CreateUserServices;
