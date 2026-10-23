"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserServices = void 0;
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = require("../../prisma");
const ROLES = ["ADMIN", "WAITER", "KITCHEN"];
class UpdateUserServices {
    async execute({ id, name, email, password, role, active }) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new Error("Usuário não encontrado");
        if (role !== undefined && !ROLES.includes(role))
            throw new Error("Perfil inválido");
        if (password !== undefined && password.length < 6)
            throw new Error("A senha deve ter ao menos 6 caracteres");
        const cleanEmail = email?.trim().toLowerCase();
        if (cleanEmail && cleanEmail !== user.email) {
            const exists = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
            if (exists)
                throw new Error("Email já cadastrado");
        }
        return prisma_1.prisma.user.update({
            where: { id },
            data: {
                name: name?.trim() || undefined,
                email: cleanEmail || undefined,
                password: password ? await (0, bcryptjs_1.hash)(password, 8) : undefined,
                role: role,
                active,
            },
            select: { id: true, name: true, email: true, role: true, active: true },
        });
    }
}
exports.UpdateUserServices = UpdateUserServices;
