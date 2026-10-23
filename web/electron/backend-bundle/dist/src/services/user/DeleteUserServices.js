"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserServices = void 0;
const prisma_1 = require("../../prisma");
class DeleteUserServices {
    async execute({ id }) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new Error("Usuário não encontrado");
        // Desativa em vez de apagar para preservar o histórico dos pedidos
        return prisma_1.prisma.user.update({
            where: { id },
            data: { active: false },
            select: { id: true, name: true, email: true, role: true, active: true },
        });
    }
}
exports.DeleteUserServices = DeleteUserServices;
